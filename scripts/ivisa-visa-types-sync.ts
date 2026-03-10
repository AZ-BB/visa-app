/**
 * iVisa visa types & products sync: populates visa_types and products using APIs.
 * 1. Fetches visa types per destination (visa_type_names API), inserts into visa_types (processing_fee=0).
 * 2. For each visa's eligible nationalities, fetches processing fee (prices API), creates products.
 *    - First country for a visa: sets visa_types.processing_fee.
 *    - Overridden values on products only when they differ from base.
 *
 * Run: npm run sync:ivisa-types
 * Requires: .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY
 * Logs: logs/ivisa-visa-types-{timestamp}.log
 */

import { mkdirSync, appendFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { config } from "dotenv";

config({ path: resolve(process.cwd(), ".env.local") });

import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/database.types";
import { ivisaCountryCodeToSlug } from "./ivisa-country-map.generated";
import {
  fetchVisaTypeNames,
  fetchProcessingTime,
  type VisaTypeOption,
} from "./ivisa-api";

type Country = { id: string; name: string };

const LOG_DIR = join(process.cwd(), "logs");
const LOG_FILE = join(
  LOG_DIR,
  `ivisa-visa-types-${new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)}.log`,
);

function log(msg: string, alsoConsole = true) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  mkdirSync(LOG_DIR, { recursive: true });
  appendFileSync(LOG_FILE, line, "utf8");
  if (alsoConsole) console.log(msg);
}

function parseNumberOfEntries(text: string | undefined): number {
  if (!text) return 1;
  const t = text.trim().toLowerCase();
  if (t.includes("multiple")) return -1;
  const m = text.match(/(\d+)\s*entry|entry\s*(\d+)/i) ?? text.match(/(\d+)/);
  if (m) return Number(m[1] ?? m[2] ?? m[0]) || 1;
  return 1;
}

function parseMaxStayDays(text: string | undefined): number {
  if (!text) return 0;
  const m = text.match(/(\d+)\s*day/i);
  if (m) return Number(m[1]);
  const m2 = text.match(/(\d+)/);
  return m2 ? Number(m2[1]) : 0;
}

function parseValidFor(validity: VisaTypeOption["validity"]): string {
  const days = validity?.visa_validity_days;
  if (days != null) {
    if (days >= 365) return `${Math.round(days / 365)} year${days >= 730 ? "s" : ""}`;
    if (days >= 30) return `${Math.round(days / 30)} month${days >= 60 ? "s" : ""}`;
    return `${days} day${days !== 1 ? "s" : ""}`;
  }
  const short = validity?.max_stay_short;
  return short ?? validity?.visa_validity ?? "—";
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !serviceKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in .env.local");
    process.exit(1);
  }

  const supabase = createClient<Database>(url, serviceKey);

  const { data: countries, error: countriesError } = await supabase
    .from("countries")
    .select("id, name")
    .eq("is_disabled", false)
    .order("id");

  if (countriesError || !countries?.length) {
    log(`Failed to fetch countries: ${countriesError?.message ?? "No countries"}`, true);
    process.exit(1);
  }

  const countryList = countries as Country[];
  log(`=== iVisa Visa Types Sync ===`, true);
  log(`Starting: ${countryList.length} countries`, true);
  log(`Log file: ${LOG_FILE}`, true);

  const errorLog: { context: string; message: string }[] = [];
  let visaTypesCreated = 0;
  let productsCreated = 0;

  for (const dest of countryList) {
    const refererSlug = ivisaCountryCodeToSlug[dest.id] ?? "india";
    log(`Processing ${dest.name} (${dest.id})...`, true);

    try {
      const { options } = await fetchVisaTypeNames(dest.id, refererSlug);

      if (!options?.length) {
        log(`  No visa options for ${dest.id}`, true);
        continue;
      }

      log(`  Found ${options.length} visa type(s)`, true);

      for (const opt of options) {
        const name = opt.name ?? "Visa";
        const ivisaVisaTypeId = String(opt.id ?? opt.value);
        const validFor = parseValidFor(opt.validity);
        const number_of_entries = parseNumberOfEntries(opt.validity?.num_entries);
        const max_stay = parseMaxStayDays(opt.validity?.max_stay_short ?? opt.validity?.max_stay);
        const govFee = parseFloat(opt.pricing?.visa_cost ?? "0") || 0;

        let visaTypeId: number;

        const { data: existingType } = await supabase
          .from("visa_types")
          .select("id, gov_fee, processing_fee")
          .eq("destination_country", dest.id)
          .eq("name", name)
          .maybeSingle();

        if (existingType) {
          visaTypeId = existingType.id;
          await supabase
            .from("visa_types")
            .update({
              valid_for: validFor,
              number_of_entries,
              max_stay,
              gov_fee: govFee || existingType.gov_fee,
              updated_at: new Date().toISOString(),
            })
            .eq("id", visaTypeId);
        } else {
          const { data: inserted, error: insErr } = await supabase
            .from("visa_types")
            .insert({
              destination_country: dest.id,
              name,
              valid_for: validFor,
              number_of_entries,
              max_stay,
              gov_fee: govFee,
              processing_fee: 0,
            })
            .select("id")
            .single();

          if (insErr) {
            log(`  ERROR inserting visa_type "${name}": ${insErr.message}`, true);
            errorLog.push({
              context: `visa_type ${name} (${dest.id})`,
              message: insErr.message,
            });
            continue;
          }
          visaTypeId = inserted.id;
          visaTypesCreated++;
        }

        const rawEligible = opt.eligible_nationalities ?? [];
        const eligibleNats = rawEligible.filter((code) =>
          countryList.some((c) => c.id === code),
        );
        const totalForVisa = eligibleNats.length;
        if (rawEligible.length > totalForVisa) {
          log(
            `    ${name}: ${totalForVisa} eligible (${rawEligible.length - totalForVisa} skipped - not in DB)`,
            true,
          );
        } else {
          log(`    ${name}: ${totalForVisa} eligible nationalities`, true);
        }

        let isFirstCountryForVisa = true;
        const { count } = await supabase
          .from("products")
          .select("id", { count: "exact", head: true })
          .eq("visa_type_id", visaTypeId);
        if (count && count > 0) isFirstCountryForVisa = false;

        const { data: visaTypeRow } = await supabase
          .from("visa_types")
          .select("gov_fee, processing_fee")
          .eq("id", visaTypeId)
          .single();

        const baseGovFee = visaTypeRow?.gov_fee ?? govFee;
        let baseProcFee = visaTypeRow?.processing_fee ?? 0;

        for (let idx = 0; idx < eligibleNats.length; idx++) {
          const natCode = eligibleNats[idx];
          const country = countryList.find((c) => c.id === natCode)!;
          const current = idx + 1;
          const left = totalForVisa - current;
          log(
            `      [${current}/${totalForVisa}] ${natCode} - ${country.name}`,
            true,
          );

          try {
            const prices = await fetchProcessingTime(
              {
                visaTypeId: ivisaVisaTypeId,
                nationality: natCode,
                destinationCountryCode: dest.id,
              },
              refererSlug,
            );

            const processingFee = prices?.[0]?.price_per_applicant ?? 0;

            if (isFirstCountryForVisa && processingFee > 0) {
              await supabase
                .from("visa_types")
                .update({
                  processing_fee: processingFee,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", visaTypeId);
              baseProcFee = processingFee;
              isFirstCountryForVisa = false;
            }

            const { data: ruleRow } = await supabase
              .from("visa_rules")
              .upsert(
                {
                  nationality: natCode,
                  destination_country: dest.id,
                  is_supported: true,
                  is_visa_required: true,
                  updated_at: new Date().toISOString(),
                },
                { onConflict: "nationality,destination_country" },
              )
              .select("id")
              .single();

            const ruleId = ruleRow?.id;
            if (!ruleId) continue;

            const { data: existingProduct } = await supabase
              .from("products")
              .select("id, gov_fee_override, processing_fee_override")
              .eq("visa_rule_id", ruleId)
              .eq("visa_type_id", visaTypeId)
              .maybeSingle();

            const overriddenProcFee =
              processingFee !== baseProcFee ? processingFee : null;
            const overriddenGovFee =
              govFee !== baseGovFee ? govFee : null;

            if (!existingProduct) {
              const { error: prodErr } = await supabase.from("products").insert({
                visa_rule_id: ruleId,
                visa_type_id: visaTypeId,
                gov_fee_override: overriddenGovFee,
                processing_fee_override: overriddenProcFee,
              });
              if (prodErr) {
                errorLog.push({
                  context: `product ${natCode}→${dest.id} ${name}`,
                  message: prodErr.message,
                });
              } else {
                productsCreated++;
              }
            } else if (
              overriddenProcFee !== existingProduct.processing_fee_override ||
              overriddenGovFee !== existingProduct.gov_fee_override
            ) {
              await supabase
                .from("products")
                .update({
                  gov_fee_override: overriddenGovFee,
                  processing_fee_override: overriddenProcFee,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", existingProduct.id);
            }

            await new Promise((r) => setTimeout(r, 100));
          } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            errorLog.push({
              context: `prices ${natCode}→${dest.id} ${name}`,
              message: msg,
            });
            log(`      ERROR ${natCode}: ${msg}`, true);
          }
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      log(`  ERROR for ${dest.id}: ${msg}`, true);
      errorLog.push({
        context: `destination ${dest.id}`,
        message: msg,
      });
    }

    await new Promise((r) => setTimeout(r, 200));
  }

  log("", true);
  log("=== Summary ===", true);
  log(`Visa types created: ${visaTypesCreated}`, true);
  log(`Products created: ${productsCreated}`, true);
  log(`Errors: ${errorLog.length}`, true);
  if (errorLog.length > 0) {
    log("", true);
    log("=== Errors ===", true);
    for (const e of errorLog) {
      log(`  [${e.context}] ${e.message}`, true);
    }
  }
  log(`Log written to ${LOG_FILE}`, true);
  log("Done.", true);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
