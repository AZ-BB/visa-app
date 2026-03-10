/**
 * iVisa.com scraper: for a given destination, checks each nationality and scrapes visa rules/types.
 * Takes destination as CLI arg: country code (e.g. US, AG) or iVisa slug (e.g. usa, antigua-barbuda).
 * Uses country code for DB seeding; resolves to iVisa slug for the apply-now URL.
 *
 * Run: npm run scrape:ivisa -- US      (country code, default if omitted)
 *      npm run scrape:ivisa -- usa      (slug also accepted)
 * Seed DB: SEED_DATABASE=true npm run scrape:ivisa -- US
 * Requires: .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY (service_role)
 * Uses scripts/ivisa-country-map.generated.ts (ivisaSlugToCountry) only; code→slug is derived from that map (longest slug wins, e.g. AE→united-arab-emirates).
 *
 * Seeding logic:
 * - visa_rules: (supported, visa_required) = (true, false) | (false, true) | (true, true) per case below.
 * - visa_types: insert when first time for destination, with scraped fees as base; else update metadata only.
 * - products: insert per (visa_rule, visa_type); if visa_type was new, no overrides; if existing, scraped fees as overrides.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { config } from "dotenv";

config({ path: resolve(process.cwd(), ".env.local") });

import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/database.types";
import { ivisaSlugToCountry } from "./ivisa-country-map.generated";

/** Resolve country code to iVisa slug using only ivisaSlugToCountry (prefer longer slug, e.g. united-arab-emirates over uae). */
function slugForCountryCode(code: string): string | undefined {
  const slugs = Object.entries(ivisaSlugToCountry)
    .filter(([, entry]) => entry.countryCode === code)
    .map(([slug]) => slug);
  if (slugs.length === 0) return undefined;
  return slugs.reduce((a, b) => (a.length >= b.length ? a : b));
}

const destInput = process.argv[2]?.trim() || "US";
const isCountryCode = destInput.length === 2;

let DESTINATION_COUNTRY: string;
let DESTINATION_SLUG: string;

if (isCountryCode) {
  DESTINATION_COUNTRY = destInput.toUpperCase();
  const slug = slugForCountryCode(DESTINATION_COUNTRY);
  if (!slug) {
    console.error(
      `Unknown country code "${DESTINATION_COUNTRY}". Ensure the destination exists in ivisa-country-map.generated.ts.`,
    );
    process.exit(1);
  }
  DESTINATION_SLUG = slug;
} else {
  DESTINATION_SLUG = destInput.toLowerCase();
  const code = ivisaSlugToCountry[DESTINATION_SLUG]?.countryCode;
  if (!code) {
    console.error(
      `Unknown iVisa slug "${DESTINATION_SLUG}". Use a 2-letter country code (e.g. US, AE) or a slug from ivisa-country-map.generated.ts.`,
    );
    process.exit(1);
  }
  DESTINATION_COUNTRY = code;
}

const APPLY_URL = `https://www.ivisa.com/${DESTINATION_SLUG}/apply-now#step=step_1`;

/** When false, seed DB (visa_rules, visa_types, products). Set SEED_DATABASE=true to enable. */
const DRY_RUN = true;

type Country = { id: string; name: string };
type ScrapedVisa = {
  name: string; // e.g. "United States B1/B2 Visa"
  validFor: string;
  numberOfEntries: number; // -1 for multiple
  maxStay: number;
  /** Filled after price flow (Start application → personal → passport later). */
  governmentFee?: number;
  processingFee?: number;
  totalPrice?: number;
  /** Set true/false after price flow so logs can show whether price was fetched. */
  priceFetched?: boolean;
};

function parseNumberOfEntries(text: string): number {
  const t = text.trim().toLowerCase();
  if (t.includes("multiple")) return -1;
  const m = t.match(/(\d+)\s*entry|entry\s*(\d+)/i) ?? t.match(/(\d+)/);
  if (m) return Number(m[1] ?? m[2] ?? m[0]) || 1;
  return 1;
}

function parseMaxStayDays(text: string): number {
  const m = text.match(/(\d+)\s*day/i);
  if (m) return Number(m[1]);
  const m2 = text.match(/(\d+)/);
  return m2 ? Number(m2[1]) : 0;
}

/** Parse "Valid for" into "number period" (e.g. "10 years", "2 months"). */
function parseValidFor(text: string): string {
  const t = text.trim();
  if (!t) return "—";
  const m = t.match(/(\d+)\s*(year|years|month|months|day|days|week|weeks)/i);
  if (m) return `${m[1]} ${m[2].toLowerCase()}`;
  return t;
}

/** Parse amount from strings like "EGP 1,126.35" or "USD 99.00". */
function parseAmount(text: string): number {
  const t = text.trim().replace(/,/g, "");
  const m = t.match(/[\d.]+/);
  return m ? Number.parseFloat(m[0]) : 0;
}

/** Canonical visa name: strip " - 10 years, Multiple entry" suffix. */
function canonicalVisaName(optionText: string): string {
  const idx = optionText.indexOf(" - ");
  return idx > 0 ? optionText.slice(0, idx).trim() : optionText.trim();
}

/** Select nationality on the apply page (after goto). Reusable for restart-per-visa. */
async function selectNationality(
  page: import("playwright").Page,
  country: Country,
): Promise<void> {
  const passportSection = page
    .locator('[data-ivisa-question-selector="general.common_nationality_country"]')
    .first();
  await passportSection.waitFor({ state: "visible", timeout: 20000 });
  await passportSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  const dropdownTrigger = passportSection.locator('[data-handle="filter-value"]').first();
  if (!(await dropdownTrigger.isVisible().catch(() => false))) return;
  await dropdownTrigger.click();
  await page.waitForTimeout(200);
  const filterInput = passportSection
    .locator('input[data-handle="dropdown-general.common_nationality_country"]')
    .first();
  if (await filterInput.isVisible().catch(() => false)) {
    await filterInput.fill(country.name);
    await page.waitForTimeout(250);
  }
  const option = passportSection
    .locator(`[data-value="${country.id}"], [value="${country.id}"]`)
    .first();
  const optionByText = passportSection.getByText(country.name, { exact: true }).first();
  if (await option.isVisible().catch(() => false)) {
    await option.click();
  } else if (await optionByText.isVisible().catch(() => false)) {
    await optionByText.click();
  } else {
    await passportSection.locator(`text=${country.name}`).first().click();
  }
  await page.waitForTimeout(400);
}

/** Make USD the default currency via default_currency cookie before page scripts run (no modal). */
function addCurrencyUsdInitScript(context: import("playwright").BrowserContext): void {
  context.addInitScript(() => {
    try {
      const maxAge = 60 * 60 * 24 * 365;
      document.cookie = `default_currency=USD; path=/; max-age=${maxAge}; SameSite=Lax`;
    } catch (_) {}
  });
}

/**
 * Wait until the breakdown has all 3 rows (Government, Processing, Total) and the
 * processing row (middle) has a numeric value. Avoids passing when only 2 rows exist
 * (e.g. Gov + Total) where rows[1] would be Total and we'd scrape processingFee as 0.
 */
async function waitForProcessingFeeToLoad(
  page: import("playwright").Page,
  timeout = 10000,
): Promise<void> {
  await page.waitForFunction(
    () => {
      const breakdown = document.querySelector(
        '[data-handle="sidebar-summary-breakdown"]',
      );
      if (!breakdown) return false;
      const rows = breakdown.querySelectorAll(":scope > div");
      // Require all 3 rows so the middle row is the processing fee, not Total
      if (rows.length < 3) return false;
      const paras = rows[1].querySelectorAll("p");
      if (paras.length < 2) return false;
      const label = (paras[0].textContent ?? "").trim();
      const value = (paras[1].textContent ?? "").trim();
      // Middle row must be processing (not "Total" or "Government fees")
      if (/Total|Government\s*fees?/i.test(label)) return false;
      return /\d/.test(value);
    },
    { timeout },
  );
}

/**
 * Scrape government fee, processing fee, and total from sidebar breakdown.
 * Processing is the row between Government fees and Total (label may be e.g. "24 hour processing").
 */
async function scrapeFeesFromBreakdown(
  page: import("playwright").Page,
  breakdown: import("playwright").Locator,
): Promise<{
  governmentFee: number;
  processingFee: number;
  totalPrice: number;
}> {
  let governmentFee = 0;
  let processingFee = 0;
  let totalPrice = 0;
  // Direct child divs so we get rows in order: Government, Processing, Total
  const rows = await breakdown.locator("> div").all();
  for (const row of rows) {
    const paras = await row.locator("p").all();
    if (paras.length < 2) continue;
    const label = (await paras[0].textContent())?.trim() ?? "";
    const valueText = (await paras[1].textContent())?.trim() ?? "";
    const amt = parseAmount(valueText);
    if (/Government\s*fees?/i.test(label)) {
      governmentFee = amt;
    } else if (/Total/i.test(label)) {
      totalPrice = amt;
    } else {
      // Row between gov and total (e.g. "24 hour processing", "Standard processing")
      processingFee = amt;
    }
  }
  if (totalPrice === 0) {
    const totalEl = page.locator('[data-handle="order-total"]');
    if (await totalEl.isVisible())
      totalPrice = parseAmount(
        (await totalEl.textContent())?.trim() ?? "",
      );
  }
  return { governmentFee, processingFee, totalPrice };
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !serviceKey) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in .env.local",
    );
    process.exit(1);
  }

  const supabase = createClient<Database>(url, serviceKey);

  let { data: countries, error: countriesError } = await supabase
    .from("countries")
    .select("id, name")
    .eq("is_disabled", false)
    .order("id");

  if (countriesError || !countries?.length) {
    console.error(
      "Failed to fetch countries:",
      countriesError?.message ?? "No countries",
    );
    process.exit(1);
  }
  countries = countries?.slice(0, 10);

  console.log(`Destination: ${DESTINATION_COUNTRY} (${APPLY_URL}). Found ${countries.length} countries.`);
  if (!DRY_RUN) console.log("Seeding database (visa_rules, visa_types, products).");

  // Check if this destination is supported by iVisa (e.g. AF returns "Page not found")
  const checkBrowser = await chromium.launch({ headless: true });
  try {
    const checkPage = await checkBrowser.newPage();
    await checkPage.goto(APPLY_URL, { waitUntil: "domcontentloaded", timeout: 15000 });
    const pageNotFound = await checkPage
      .getByText(/Page not found|URL not found/i)
      .first()
      .isVisible()
      .catch(() => false);
    await checkBrowser.close();
    if (pageNotFound) {
      console.log(
        `\nDestination ${DESTINATION_COUNTRY} is not supported by iVisa (Page not found). Setting visa_rules for all nationalities: is_supported=false, is_visa_required=true.`,
      );
      if (DRY_RUN) {
        console.log(
          `  [DRY RUN] Would upsert visa_rules for ${countries.length} nationalities: is_visa_required=true, is_supported=false.`,
        );
      } else {
        for (const c of countries as Country[]) {
          await supabase.from("visa_rules").upsert(
            {
              nationality: c.id,
              destination_country: DESTINATION_COUNTRY,
              is_supported: false,
              is_visa_required: true,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "nationality,destination_country" },
          );
        }
        console.log(`  Updated visa_rules for ${countries.length} nationalities.`);
      }
      console.log("\nDone.");
      return;
    }
  } catch (e) {
    console.warn("  Could not check destination support:", e instanceof Error ? e.message : e);
  } finally {
    await checkBrowser.close().catch(() => {});
  }

  /** Log skips and errors per nationality for end-of-run summary */
  const skipAndErrorLog: {
    country: string;
    id: string;
    type: "skip" | "error";
    message: string;
  }[] = [];

  /** Summary of what was scraped per nationality (for log file) */
  const scrapeSummaryLog: { country: string; id: string; outcome: string }[] = [];

  /** Visa names + metadata + price status per nationality (for log file) */
  const visaDiscoveryLog: {
    country: string;
    id: string;
    visas: { name: string; validFor: string; numberOfEntries: number; maxStay: number; priceFetched: boolean }[];
  }[] = [];

  const PARALLEL_BROWSERS = 1;
  function chunkArray<T>(arr: T[], n: number): T[][] {
    const chunks: T[][] = Array.from({ length: n }, () => []);
    for (let i = 0; i < arr.length; i++) chunks[i % n].push(arr[i]);
    return chunks;
  }
  const countryChunks = chunkArray(countries as Country[], PARALLEL_BROWSERS);

  async function runWorker(workerIndex: number, countryChunk: Country[]) {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      viewport: { width: 1280, height: 720 },
    });
    addCurrencyUsdInitScript(context);
    const w = `[W${workerIndex + 1}]`;

    try {
      for (const country of countryChunk) {
        let attempt = 0;
        const maxAttempts = 2;
        let done = false;
        while (!done && attempt < maxAttempts) {
          attempt++;
          console.log(
            `\n${w} --- ${country.name} (${country.id}) --- ${attempt > 1 ? "Retry..." : "New page..."}`,
          );

          const page = await context.newPage();
        try {
          await page.goto(APPLY_URL, {
          waitUntil: "domcontentloaded",
          timeout: 15000,
        });

        // Dismiss cookie consent if present
      const acceptAll = page.getByRole("button", { name: /Accept All|Accept all/i });
      if (await acceptAll.isVisible().catch(() => false)) {
        await acceptAll.click().catch(() => {});
        await page.waitForTimeout(150);
      }

      // Select this country's nationality on the apply page
      await selectNationality(page, country);
      // Give the page time to update (no visa / not supported / visa options often load via JS)
      await page.waitForTimeout(2500);

        // Check for "You don't need a visa!" / "Visa not required" (visa not required, supported)
        const noVisaRequiredMessage = page.getByText(
          /You don't need a visa|don't need a visa|Visa not required|No visa required|do not need a visa/i,
        ).first();
        const noVisaRequired = await noVisaRequiredMessage.isVisible().catch(() => false);
        if (noVisaRequired) {
          console.log(
            "  Visa not required for this nationality → visa_rule: is_visa_required=false, is_supported=true",
          );
          if (DRY_RUN) {
            console.log(
              "\n  [DRY RUN] Would upsert visa_rule:",
              JSON.stringify(
                {
                  nationality: country.id,
                  countryName: country.name,
                  destination: DESTINATION_COUNTRY,
                  is_visa_required: false,
                  is_supported: true,
                  visas: [],
                },
                null,
                2,
              ),
            );
          } else {
            await supabase.from("visa_rules").upsert(
              {
                nationality: country.id,
                destination_country: DESTINATION_COUNTRY,
                is_supported: true,
                is_visa_required: false,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "nationality,destination_country" },
            );
          }
          scrapeSummaryLog.push({
            country: country.name,
            id: country.id,
            outcome: "no visa required",
          });
          done = true;
          break;
        }

        // Check for "visa required but iVisa does not provide it" message
        const notSupportedMessage = page.getByText(
          /iVisa does not provide it|does not provide it|we don't provide|we do not provide|cannot provide|do not support|don't support/i,
        ).first();
        const notSupported = await notSupportedMessage.isVisible().catch(() => false);
        if (notSupported) {
          console.log(
            "  Visa required for this nationality but iVisa does not provide it → visa_rule: is_visa_required=true, is_supported=false",
          );
          if (DRY_RUN) {
            console.log(
              "\n  [DRY RUN] Would upsert visa_rule:",
              JSON.stringify(
                {
                  nationality: country.id,
                  countryName: country.name,
                  destination: DESTINATION_COUNTRY,
                  is_visa_required: true,
                  is_supported: false,
                  visas: [],
                },
                null,
                2,
              ),
            );
          } else {
            await supabase.from("visa_rules").upsert(
              {
                nationality: country.id,
                destination_country: DESTINATION_COUNTRY,
                is_supported: false,
                is_visa_required: true,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "nationality,destination_country" },
            );
          }
          scrapeSummaryLog.push({
            country: country.name,
            id: country.id,
            outcome: "visa required, not supported",
          });
          done = true;
          break;
        }

        // "Applying for" is a native <select> (may be hidden by custom dropdown UI)
        const applyingSelect = page
          .locator('select[data-handle="dropdown-general.visa_type_id"]')
          .first();
        await applyingSelect
          .waitFor({ state: "attached", timeout: 5000 })
          .catch(() => null);
        let options = await applyingSelect.locator("option").all();

        const visas: ScrapedVisa[] = [];

        // When only 1 visa exists, the "Applying for" dropdown may not appear — scrape from sidebar only
        if (options.length === 0) {
          const sidebar = page
            .locator('[data-handle="step-1-sidebar"]')
            .first();
          const sidebarVisible = await sidebar
            .waitFor({ state: "visible", timeout: 6000 })
            .then(() => true)
            .catch(() => false);
          if (!sidebarVisible) {
            // Fallback: page may show "no visa required" or "not supported" in different structure — check body text
            const bodyText =
              (await page.locator("body").textContent())?.toLowerCase() ?? "";
            const noVisaInText =
              /you don't need a visa|don't need a visa|visa not required|no visa required|do not need a visa/.test(
                bodyText,
              );
            const notSupportedInText =
              /ivisa does not provide|does not provide it|we don't provide|we do not provide|cannot provide|do not support|don't support/.test(
                bodyText,
              );
            if (noVisaInText) {
              console.log(
                "  No dropdown/sidebar but page text indicates visa not required → visa_rule: is_visa_required=false, is_supported=true",
              );
              if (DRY_RUN) {
                console.log(
                  "\n  [DRY RUN] Would upsert visa_rule: is_visa_required=false, is_supported=true",
                );
              } else {
                await supabase.from("visa_rules").upsert(
                  {
                    nationality: country.id,
                    destination_country: DESTINATION_COUNTRY,
                    is_supported: true,
                    is_visa_required: false,
                    updated_at: new Date().toISOString(),
                  },
                  { onConflict: "nationality,destination_country" },
                );
              }
              scrapeSummaryLog.push({
                country: country.name,
                id: country.id,
                outcome: "no visa required",
              });
              done = true;
              break;
            }
            if (notSupportedInText) {
              console.log(
                "  No dropdown/sidebar but page text indicates visa required, not supported → visa_rule: is_visa_required=true, is_supported=false",
              );
              if (DRY_RUN) {
                console.log(
                  "\n  [DRY RUN] Would upsert visa_rule: is_visa_required=true, is_supported=false",
                );
              } else {
                await supabase.from("visa_rules").upsert(
                  {
                    nationality: country.id,
                    destination_country: DESTINATION_COUNTRY,
                    is_supported: false,
                    is_visa_required: true,
                    updated_at: new Date().toISOString(),
                  },
                  { onConflict: "nationality,destination_country" },
                );
              }
              scrapeSummaryLog.push({
                country: country.name,
                id: country.id,
                outcome: "visa required, not supported",
              });
              done = true;
              break;
            }
            const skipMsg =
              "No visa dropdown and no step-1 sidebar; no 'no visa' / 'not supported' text found in page.";
            console.log(`  ${skipMsg}`);
            skipAndErrorLog.push({
              country: country.name,
              id: country.id,
              type: "skip",
              message: skipMsg,
            });
            scrapeSummaryLog.push({
              country: country.name,
              id: country.id,
              outcome: "skipped",
            });
            done = true;
            break;
          }
          // Single visa: get name from sidebar title (e.g. "United States ESTA")
          const titleEl = sidebar.locator(
            ".lmz.tu, .xn.lmz, [class*='lmz'][class*='tu']",
          ).first();
          const titleText =
            (await titleEl.textContent())?.trim() ||
            (await sidebar.locator("div").first().textContent())?.trim() ||
            "";
          const name = canonicalVisaName(titleText || "Visa");
          let validFor = "";
          let entriesText = "";
          let maxStayText = "";
          const rows = await sidebar
            .locator(".v2-space-y-20 .pt, [class*='space-y'] .pt, .od")
            .all();
          for (const row of rows) {
            const labelEl = row.locator(".yr, [class*='label']").first();
            const valueEl = row.locator(".ap, [class*='value']").first();
            const label = (await labelEl.textContent())?.trim() ?? "";
            const val = (await valueEl.textContent())?.trim() ?? "";
            if (label === "Valid for") validFor = parseValidFor(val);
            if (label === "Number of entries") entriesText = val;
            if (label === "Max stay") maxStayText = val;
          }
          visas.push({
            name,
            validFor: validFor || "—",
            numberOfEntries: parseNumberOfEntries(entriesText),
            maxStay: parseMaxStayDays(maxStayText),
          });
          console.log(
            `  ${name} (single visa, no dropdown): valid_for="${validFor}", entries=${visas[0].numberOfEntries}, max_stay=${visas[0].maxStay}`,
          );
          // Run price flow once for this single visa (no return to step 1)
          try {
            const startBtn = page.getByRole("button", {
              name: /Start your application/i,
            });
            await startBtn.waitFor({ state: "visible", timeout: 5000 });
            await startBtn.click();
            const firstName = page.locator(
              'input[name="applicant.0.first_name"]',
            );
            await firstName.waitFor({ state: "visible", timeout: 15000 });
            await firstName.fill("Scraper");
            await page
              .locator('input[name="applicant.0.last_name"]')
              .fill("Test");
            await page
              .locator('select[name="applicant.0.dob.month"]')
              .selectOption("1");
            await page
              .locator('select[name="applicant.0.dob.day"]')
              .selectOption("1");
            await page
              .locator('select[name="applicant.0.dob.year"]')
              .selectOption("1990");
            await page
              .locator('input[name="general.email"]')
              .fill("scraper@gmail.com");
            await page.waitForTimeout(200);
            const saveContinueBtn = page.locator("#btnContinueSidebar");
            await page.waitForTimeout(1000);
            await saveContinueBtn.click();
            const addPassportLater = page.locator(
              'input[name="applicant.0.is_passport_on_hand"]',
            );
            await addPassportLater.waitFor({ state: "visible", timeout: 12000 });
            await addPassportLater.check();
            await page.waitForTimeout(200);
            await page.waitForTimeout(1000);
            await saveContinueBtn.click();
            const breakdown = page.locator(
              '[data-handle="sidebar-summary-breakdown"]',
            );
            await breakdown.waitFor({ state: "visible", timeout: 12000 });
            await waitForProcessingFeeToLoad(page);
            const { governmentFee, processingFee, totalPrice } =
              await scrapeFeesFromBreakdown(page, breakdown);
            visas[0].governmentFee = governmentFee;
            visas[0].processingFee = processingFee;
            visas[0].totalPrice = totalPrice;
            visas[0].priceFetched = true;
            console.log(
              `    → fees: gov=${governmentFee} processing=${processingFee} total=${totalPrice}`,
            );
          } catch (priceErr) {
            visas[0].governmentFee = 0;
            visas[0].processingFee = 0;
            visas[0].totalPrice = 0;
            visas[0].priceFetched = false;
            const errMsg =
              priceErr instanceof Error ? priceErr.message : String(priceErr);
            console.warn(
              `    → [WARNING] Price flow failed for single visa; fees set to 0:`,
              errMsg,
            );
            skipAndErrorLog.push({
              country: country.name,
              id: country.id,
              type: "error",
              message: `Price flow failed (single visa): ${errMsg}`,
            });
          }
          // Skip the dropdown loop; go straight to DRY_RUN / DB
        } else {
          // Phase 1: Scrape all visa names from the native <select> so we know count and targets
          const visaOptionList: { value: string; text: string }[] = [];
          for (const opt of options) {
            const value = await opt.getAttribute("value");
            const text = (await opt.textContent())?.trim() ?? "";
            if (value && text) visaOptionList.push({ value, text });
          }
          const totalVisas = visaOptionList.length;
          console.log(
            `  Found ${totalVisas} visa(s): ${visaOptionList.map((o) => canonicalVisaName(o.text)).join(", ")}`,
          );

          try {
          for (let i = 0; i < totalVisas; i++) {
            const { value, text: optionText } = visaOptionList[i];
            // Use full option text so "90 days" vs "180 days" etc. are distinct visa types
            const name = optionText.trim() || canonicalVisaName(optionText);

            // Phase 2: For each visa, restart the operation so we target this one (no custom dropdown)
            if (i > 0) {
              await page.goto(APPLY_URL, { timeout: 20000, waitUntil: "domcontentloaded" });
              await page.waitForLoadState("domcontentloaded").catch(() => null);
              if (await page.getByRole("button", { name: /Accept All|Accept all/i }).isVisible().catch(() => false)) {
                await page.getByRole("button", { name: /Accept All|Accept all/i }).click().catch(() => {});
                await page.waitForTimeout(150);
              }
              // Wait for step-1 form so nationality dropdown is rendered before selecting
              await page.locator('select[data-handle="dropdown-general.visa_type_id"]').first().waitFor({ state: "attached", timeout: 15000 });
              await page.waitForTimeout(2000);
              await selectNationality(page, country);
              await page.waitForTimeout(500);
              const applyingSelectAfter = page.locator('select[data-handle="dropdown-general.visa_type_id"]').first();
              await applyingSelectAfter.waitFor({ state: "attached", timeout: 10000 });
            }

            const selectEl = page.locator('select[data-handle="dropdown-general.visa_type_id"]').first();
            await selectEl.selectOption(value, { force: true });
            await page.evaluate(
              ({ selector, val }: { selector: string; val: string }) => {
                const el = document.querySelector<HTMLSelectElement>(selector);
                if (el) {
                  el.value = val;
                  el.dispatchEvent(new Event("change", { bubbles: true }));
                  el.dispatchEvent(new Event("input", { bubbles: true }));
                }
              },
              { selector: 'select[data-handle="dropdown-general.visa_type_id"]', val: value },
            );
            await page.waitForTimeout(500);

            const sidebar = page.locator('[data-handle="step-1-sidebar"]').first();
            let validFor = "";
            let entriesText = "";
            let maxStayText = "";
            const rows = await sidebar.locator(".v2-space-y-20 .pt, [class*='space-y'] .pt, .od").all();
            for (const row of rows) {
              const labelEl = row.locator(".yr, [class*='label']").first();
              const valueEl = row.locator(".ap, [class*='value']").first();
              const label = (await labelEl.textContent())?.trim() ?? "";
              const val = (await valueEl.textContent())?.trim() ?? "";
              if (label === "Valid for") validFor = parseValidFor(val);
              if (label === "Number of entries") entriesText = val;
              if (label === "Max stay") maxStayText = val;
            }

            visas.push({
              name,
              validFor: validFor || "—",
              numberOfEntries: parseNumberOfEntries(entriesText),
              maxStay: parseMaxStayDays(maxStayText),
            });
            console.log(
              `  ${name}: valid_for="${validFor}", entries=${visas[visas.length - 1].numberOfEntries}, max_stay=${visas[visas.length - 1].maxStay}`,
            );

            try {
              const startBtn = page.getByRole("button", { name: /Start your application/i });
              await startBtn.waitFor({ state: "visible", timeout: 5000 });
              await startBtn.click();
              const firstName = page.locator('input[name="applicant.0.first_name"]');
              await firstName.waitFor({ state: "visible", timeout: 15000 });
              await firstName.fill("Scraper");
              await page.locator('input[name="applicant.0.last_name"]').fill("Test");
              await page.locator('select[name="applicant.0.dob.month"]').selectOption("1");
              await page.locator('select[name="applicant.0.dob.day"]').selectOption("1");
              await page.locator('select[name="applicant.0.dob.year"]').selectOption("1990");
              await page.locator('input[name="general.email"]').fill("scraper@gmail.com");
              await page.waitForTimeout(200);
              const saveContinueBtn = page.locator("#btnContinueSidebar");
              await page.waitForTimeout(1000);
              await saveContinueBtn.click();
              const addPassportLater = page.locator('input[name="applicant.0.is_passport_on_hand"]');
              await addPassportLater.waitFor({ state: "visible", timeout: 12000 });
              await addPassportLater.check();
              await page.waitForTimeout(200);
              await page.waitForTimeout(1000);
              await saveContinueBtn.click();
              const breakdown = page.locator('[data-handle="sidebar-summary-breakdown"]');
              await breakdown.waitFor({ state: "visible", timeout: 12000 });
              await waitForProcessingFeeToLoad(page);
              const { governmentFee, processingFee, totalPrice } = await scrapeFeesFromBreakdown(page, breakdown);
              const last = visas[visas.length - 1];
              last.governmentFee = governmentFee;
              last.processingFee = processingFee;
              last.totalPrice = totalPrice;
              last.priceFetched = true;
              console.log(`    → fees: gov=${governmentFee} processing=${processingFee} total=${totalPrice}`);
            } catch (priceErr) {
              const last = visas[visas.length - 1];
              last.governmentFee = 0;
              last.processingFee = 0;
              last.totalPrice = 0;
              last.priceFetched = false;
              const errMsg =
                priceErr instanceof Error ? priceErr.message : String(priceErr);
              console.warn(
                `    → [WARNING] Price flow failed for ${name}; fees set to 0:`,
                errMsg,
              );
              skipAndErrorLog.push({
                country: country.name,
                id: country.id,
                type: "error",
                message: `Price flow failed for visa "${name}": ${errMsg}`,
              });
            }
          }
          } catch (loopErr) {
            if (visas.length === 0) throw loopErr;
            const msg = loopErr instanceof Error ? loopErr.message : String(loopErr);
            console.warn(`  Partial scrape: saving ${visas.length} visa(s) after error:`, msg);
          }
        }

        if (DRY_RUN) {
          console.log("\n  [DRY RUN] Scraped data for this country:");
          console.log(
            JSON.stringify(
              {
                nationality: country.id,
                countryName: country.name,
                destination: DESTINATION_COUNTRY,
                visas,
              },
              null,
              2,
            ),
          );
        } else {
          for (const v of visas) {
            let visaTypeId: number;

            const { data: existingType } = await supabase
              .from("visa_types")
              .select("id, gov_fee, processing_fee")
              .eq("destination_country", DESTINATION_COUNTRY)
              .eq("name", v.name)
              .maybeSingle();

            const isNewVisaType = !existingType;
            const scrapedGov = v.governmentFee ?? 0;
            const scrapedProc = v.processingFee ?? 0;

            if (existingType) {
              visaTypeId = existingType.id;
              const baseGov = existingType.gov_fee ?? 0;
              const baseProc = existingType.processing_fee ?? 0;
              const updatePayload: { valid_for?: string; number_of_entries?: number; max_stay?: number; gov_fee?: number; processing_fee?: number; updated_at: string } = {
                valid_for: v.validFor,
                number_of_entries: v.numberOfEntries,
                max_stay: v.maxStay,
                updated_at: new Date().toISOString(),
              };
              if ((baseGov === 0 || baseProc === 0) && (scrapedGov > 0 || scrapedProc > 0)) {
                if (baseGov === 0 && scrapedGov > 0) updatePayload.gov_fee = scrapedGov;
                if (baseProc === 0 && scrapedProc > 0) updatePayload.processing_fee = scrapedProc;
              }
              await supabase.from("visa_types").update(updatePayload).eq("id", visaTypeId);
            } else {
              const { data: inserted, error: insErr } = await supabase
                .from("visa_types")
                .insert({
                  destination_country: DESTINATION_COUNTRY,
                  name: v.name,
                  valid_for: v.validFor,
                  number_of_entries: v.numberOfEntries,
                  max_stay: v.maxStay,
                  gov_fee: scrapedGov,
                  processing_fee: scrapedProc,
                })
                .select("id")
                .single();
              if (insErr) {
                console.error("  Insert visa_type error:", insErr.message);
                skipAndErrorLog.push({
                  country: country.name,
                  id: country.id,
                  type: "error",
                  message: `Insert visa_type failed: ${insErr.message}`,
                });
                continue;
              }
              visaTypeId = inserted.id;
            }

            // visa_rules: when we have visas → supported: true, visa_required: true
            const { data: ruleRow, error: ruleErr } = await supabase
              .from("visa_rules")
              .upsert(
                {
                  nationality: country.id,
                  destination_country: DESTINATION_COUNTRY,
                  is_supported: true,
                  is_visa_required: true,
                  updated_at: new Date().toISOString(),
                },
                { onConflict: "nationality,destination_country" },
              )
              .select("id")
              .single();

            let ruleId: number | null = ruleRow?.id ?? null;
            if (!ruleId && !ruleErr) {
              const { data: existing } = await supabase
                .from("visa_rules")
                .select("id")
                .eq("nationality", country.id)
                .eq("destination_country", DESTINATION_COUNTRY)
                .maybeSingle();
              ruleId = existing?.id ?? null;
            }
            if (ruleErr || ruleId == null) {
              const errMsg =
                ruleErr?.message ?? "Could not get visa_rule id after upsert";
              console.error("  Upsert visa_rule error:", errMsg);
              skipAndErrorLog.push({
                country: country.name,
                id: country.id,
                type: "error",
                message: `Upsert visa_rule failed: ${errMsg}`,
              });
              continue;
            }

            const baseGov = isNewVisaType ? scrapedGov : (existingType!.gov_fee ?? 0);
            const baseProc = isNewVisaType ? scrapedProc : (existingType!.processing_fee ?? 0);

            const { data: existingProduct } = await supabase
              .from("products")
              .select("id, gov_fee_override, processing_fee_override")
              .eq("visa_rule_id", ruleId)
              .eq("visa_type_id", visaTypeId)
              .maybeSingle();

            const effectiveGov = existingProduct?.gov_fee_override ?? baseGov;
            const effectiveProc = existingProduct?.processing_fee_override ?? baseProc;
            const priceDiffers = scrapedGov !== effectiveGov || scrapedProc !== effectiveProc;
            const govOverride =
              !isNewVisaType && scrapedGov > 0 && scrapedGov !== baseGov ? scrapedGov : null;
            const procOverride =
              !isNewVisaType && scrapedProc > 0 && scrapedProc !== baseProc ? scrapedProc : null;

            if (!existingProduct) {
              const { error: prodErr } = await supabase.from("products").insert({
                visa_rule_id: ruleId,
                visa_type_id: visaTypeId,
                gov_fee_override: govOverride,
                processing_fee_override: procOverride,
              });
              if (prodErr) {
                console.error("  Insert product error:", prodErr.message);
                skipAndErrorLog.push({
                  country: country.name,
                  id: country.id,
                  type: "error",
                  message: `Insert product failed: ${prodErr.message}`,
                });
              }
            } else if (priceDiffers) {
              await supabase
                .from("products")
                .update({
                  gov_fee_override: govOverride,
                  processing_fee_override: procOverride,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", existingProduct.id);
            }
          }
        }
        if (visas.length > 0) {
          scrapeSummaryLog.push({
            country: country.name,
            id: country.id,
            outcome: `${visas.length} visa(s): ${visas.map((v) => v.name).join(", ")}`,
          });
          visaDiscoveryLog.push({
            country: country.name,
            id: country.id,
            visas: visas.map((v) => ({
              name: v.name,
              validFor: v.validFor,
              numberOfEntries: v.numberOfEntries,
              maxStay: v.maxStay,
              priceFetched: v.priceFetched === true,
            })),
          });
        }
        done = true;
        } catch (e) {
          const errMsg = e instanceof Error ? e.message : String(e);
          const isTimeout = /timeout|exceeded/i.test(errMsg);
          if (isTimeout && attempt < maxAttempts) {
            console.log(
              `  ${w} Timeout for ${country.name}, retrying (attempt ${attempt + 1}/${maxAttempts})...`,
            );
          } else {
            console.error(`  ${w} Error for ${country.name}:`, e);
            skipAndErrorLog.push({
              country: country.name,
              id: country.id,
              type: "error",
              message: errMsg,
            });
            scrapeSummaryLog.push({
              country: country.name,
              id: country.id,
              outcome: `error: ${errMsg}`,
            });
            done = true;
          }
        } finally {
          await page.close().catch(() => {});
        }
        if (!done && attempt >= maxAttempts) done = true;
        }
      }
    } finally {
      await browser.close();
    }
  }

  await Promise.all(countryChunks.map((chunk, i) => runWorker(i, chunk)));

  if (DRY_RUN) {
    console.log("\n[DRY RUN] No data was written to the database.");
  }

  if (scrapeSummaryLog.length > 0 || skipAndErrorLog.length > 0) {
    const lines: string[] = [
      `Destination: ${DESTINATION_COUNTRY} (${APPLY_URL})`,
      `Run at: ${new Date().toISOString()}`,
      `Nationalities processed: ${scrapeSummaryLog.length}`,
      "",
      "=== Summary of scraped (by nationality) ===",
    ];
    for (const entry of scrapeSummaryLog) {
      const line = `  ${entry.country} (${entry.id}): ${entry.outcome}`;
      lines.push(line);
    }

    if (visaDiscoveryLog.length > 0) {
      lines.push("", "=== Visa names & data (before/after price fetch) ===");
      for (const entry of visaDiscoveryLog) {
        lines.push(`  ${entry.country} (${entry.id}):`);
        for (const v of entry.visas) {
          const entriesStr = v.numberOfEntries === -1 ? "multiple" : String(v.numberOfEntries);
          const priceStatus = v.priceFetched ? "price ✓" : "price ✗";
          lines.push(
            `    - ${v.name} | valid_for=${v.validFor} entries=${entriesStr} max_stay=${v.maxStay} | ${priceStatus}`,
          );
        }
      }
    }

    if (skipAndErrorLog.length > 0) {
      const byType = { skip: 0, error: 0 };
      lines.push("", "=== Skipped & errors by nationality ===");
      console.log("\n=== Skipped & errors by nationality ===");
      for (const entry of skipAndErrorLog) {
        byType[entry.type]++;
        const line = `  ${entry.country} (${entry.id}): [${entry.type.toUpperCase()}] ${entry.message}`;
        lines.push(line);
        console.log(line);
      }
      const totalLine = `  Total: ${skipAndErrorLog.length} (${byType.skip} skipped, ${byType.error} errors)`;
      lines.push(totalLine);
      console.log(totalLine);

      const codesWithErrors = [...new Set(skipAndErrorLog.filter((e) => e.type === "error").map((e) => e.id))].sort();
      lines.push("", "=== Country codes with errors (after retries) ===");
      lines.push(`  ${codesWithErrors.length > 0 ? codesWithErrors.join(", ") : "none"}`);
    }

    const logsDir = join(process.cwd(), "logs");
    mkdirSync(logsDir, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const logPath = join(logsDir, `ivisa-${DESTINATION_COUNTRY}-${timestamp}.log`);
    writeFileSync(logPath, lines.join("\n") + "\n", "utf8");
    console.log(`\nLog written to ${logPath}`);
  }

  console.log("\nDone.");
}

main();
