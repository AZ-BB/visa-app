/**
 * Builds a map between iVisa URL slugs/names and our database country codes (ISO 3166-1 alpha-2).
 *
 * 1. Fetches our countries from Supabase (id, name).
 * 2. Fetches iVisa sitemap and extracts destination slugs from /visas/{slug} and /{slug} URLs.
 * 3. Matches each slug to a country (explicit overrides first, then normalized name matching).
 * 4. Writes scripts/ivisa-country-map.json and scripts/ivisa-country-map.ts.
 *
 * Run: npx tsx scripts/ivisa-country-map.ts
 * Requires: .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY (or pass --no-db to use only sitemap + overrides).
 */

import { resolve } from "node:path";
import { writeFileSync } from "node:fs";
import { config } from "dotenv";

config({ path: resolve(process.cwd(), ".env.local") });

const IVISA_SITEMAP_URL = "https://www.ivisa.com/sitemap.xml";

type Country = { id: string; name: string };

/** Slugs that don't match by normalized name (iVisa slug → our country id). */
const SLUG_TO_COUNTRY_OVERRIDES: Record<string, string> = {
  usa: "US",
  "united-states": "US",
  uk: "GB",
  "united-kingdom": "GB",
  uae: "AE",
  "united-arab-emirates": "AE",
  "ivory-coast": "CI",
  "côte-d'ivoire": "CI",
  "czech-republic": "CZ",
  "antigua-barbuda": "AG",
  "new-zealand": "NZ",
  "south-korea": "KR",
  "north-korea": "KP",
  "viet-nam": "VN",
  vietnam: "VN",
  "republic-of-the-congo": "CG",
  congo: "CG",
  "democratic-republic-of-the-congo": "CD",
  "drc": "CD",
  "democratic-republic-of-congo": "CD",
  "tanzania": "TZ",
  "bolivia": "BO",
  "venezuela": "VE",
  "russia": "RU",
  "russian-federation": "RU",
  "turkey": "TR",
  "türkiye": "TR",
  "syria": "SY",
  "syrian-arab-republic": "SY",
  "iran": "IR",
  "iran-islamic-republic": "IR",
  "laos": "LA",
  "lao-peoples-democratic-republic": "LA",
  "brunei": "BN",
  "brunei-darussalam": "BN",
  "taiwan": "TW",
  "palestine": "PS",
  "state-of-palestine": "PS",
  "micronesia": "FM",
  "federated-states-of-micronesia": "FM",
  "macedonia": "MK",
  "north-macedonia": "MK",
  "cape-verde": "CV",
  "cabo-verde": "CV",
  "eswatini": "SZ",
  "swaziland": "SZ",
  "timor-leste": "TL",
  "east-timor": "TL",
  "saint-kitts-and-nevis": "KN",
  "st-kitts-and-nevis": "KN",
  "saint-lucia": "LC",
  "st-lucia": "LC",
  "saint-vincent-and-the-grenadines": "VC",
  "st-vincent-and-the-grenadines": "VC",
  "sao-tome-and-principe": "ST",
  "saint-vincent-grenadines": "VC",
  "trinidad-and-tobago": "TT",
  "turks-and-caicos": "TC",
  "virgin-islands": "VI",
  "cayman-islands": "KY",
  bermuda: "BM",
  aruba: "AW",
  curacao: "CW",
  "curaçao": "CW",
  "british-virgin-islands": "VG",
  "hong-kong": "HK",
  "puerto-rico": "PR",
  "saint-martin": "MF",
  "sint-maarten": "SX",
  "papua-new-guinea": "PG",
  "guinea-bissau": "GW",
  "equatorial-guinea": "GQ",
  "costa-rica": "CR",
  "el-salvador": "SV",
  "sri-lanka": "LK",
  "united-states-minor-outlying-islands": "UM",
  "central-african-republic": "CF",
  "dominican-republic": "DO",
  "bosnia-and-herzegovina": "BA",
  "bosnia-herzegovina": "BA",
  "burkina-faso": "BF",
  "united-republic-of-tanzania": "TZ",
};

function normalizeForMatch(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+and\s+/g, " ")
    .replace(/['']/g, "")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractSlugsFromSitemap(xml: string): Set<string> {
  const slugs = new Set<string>();
  // Match <loc>https://www.ivisa.com/visas/SLUG</loc> or <loc>https://www.ivisa.com/SLUG</loc> (single segment)
  const visaRegex = /https:\/\/www\.ivisa\.com\/visas\/([a-z0-9-]+)/gi;
  const rootRegex = /https:\/\/www\.ivisa\.com\/([a-z0-9-]+)(?:\/|<\/loc>|$)/gi;
  const skip = new Set([
    "visas", "blog", "pages", "api", "www", "apply-now", "travel", "help", "about", "careers", "contact", "privacy", "terms", "cookie", "auth", "login", "register", "faq", "resources", "explore", "destinations", "vaccination", "health",
    "about-us", "contact-us", "download", "news", "plus", "press", "terms-and-conditions", "testimonials", "travel-packages", "passport-renewal",
  ]);

  let m: RegExpExecArray | null;
  while ((m = visaRegex.exec(xml)) !== null) slugs.add(m[1].toLowerCase());
  while ((m = rootRegex.exec(xml)) !== null) {
    const slug = m[1].toLowerCase();
    if (!skip.has(slug) && slug.length > 1) slugs.add(slug);
  }
  return slugs;
}

function findCountryBySlug(slug: string, countries: Country[]): Country | undefined {
  const norm = normalizeForMatch(slug);
  for (const c of countries) {
    const nameNorm = normalizeForMatch(c.name);
    if (nameNorm === norm) return c;
    if (nameNorm.startsWith(norm) || norm.startsWith(nameNorm)) return c;
    // "antigua barbuda" vs "antigua and barbuda" → nameNorm is "antigua  barbuda" after and→space
    const nameNormNoAnd = c.name.toLowerCase().replace(/\s+and\s+/g, " ").replace(/-/g, " ").replace(/\s+/g, " ").trim();
    if (nameNormNoAnd === norm || nameNormNoAnd.startsWith(norm) || norm.startsWith(nameNormNoAnd)) return c;
  }
  return undefined;
}

export type IvisaCountryEntry = { name: string; countryCode: string };
export type IvisaCountryMap = Record<string, IvisaCountryEntry>;

async function main() {
  const useDb = !process.argv.includes("--no-db");

  let countries: Country[] = [];
  if (useDb) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SECRET_KEY;
    if (!url || !serviceKey) {
      console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY. Use --no-db to skip DB.");
      process.exit(1);
    }
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(url, serviceKey);
    const { data, error } = await supabase
      .from("countries")
      .select("id, name")
      .eq("is_disabled", false)
      .order("id");
    if (error || !data?.length) {
      console.error("Failed to fetch countries:", error?.message ?? "No data");
      process.exit(1);
    }
    countries = data as Country[];
    console.log(`Loaded ${countries.length} countries from DB.`);
  } else {
    // Minimal set for matching by name from overrides + common names
    countries = [
      { id: "US", name: "United States" },
      { id: "GB", name: "United Kingdom" },
      { id: "AE", name: "United Arab Emirates" },
      { id: "AG", name: "Antigua and Barbuda" },
      { id: "AR", name: "Argentina" },
      { id: "AM", name: "Armenia" },
      { id: "AU", name: "Australia" },
      { id: "AT", name: "Austria" },
      { id: "BH", name: "Bahrain" },
      { id: "BB", name: "Barbados" },
      { id: "BE", name: "Belgium" },
      { id: "BZ", name: "Belize" },
      { id: "BJ", name: "Benin" },
      { id: "BO", name: "Bolivia" },
      { id: "BA", name: "Bosnia and Herzegovina" },
      { id: "BW", name: "Botswana" },
      { id: "BR", name: "Brazil" },
      { id: "BN", name: "Brunei" },
      { id: "BF", name: "Burkina Faso" },
      { id: "KH", name: "Cambodia" },
      { id: "CM", name: "Cameroon" },
      { id: "CA", name: "Canada" },
      { id: "CV", name: "Cabo Verde" },
      { id: "CF", name: "Central African Republic" },
      { id: "TD", name: "Chad" },
      { id: "CL", name: "Chile" },
      { id: "CN", name: "China" },
      { id: "CO", name: "Colombia" },
      { id: "CI", name: "Côte d'Ivoire" },
      { id: "HR", name: "Croatia" },
      { id: "CU", name: "Cuba" },
      { id: "CY", name: "Cyprus" },
      { id: "CZ", name: "Czechia" },
      { id: "DK", name: "Denmark" },
      { id: "DJ", name: "Djibouti" },
      { id: "DO", name: "Dominican Republic" },
      { id: "EC", name: "Ecuador" },
      { id: "EG", name: "Egypt" },
      { id: "SV", name: "El Salvador" },
      { id: "GQ", name: "Equatorial Guinea" },
      { id: "ER", name: "Eritrea" },
      { id: "EE", name: "Estonia" },
      { id: "SZ", name: "Eswatini" },
      { id: "ET", name: "Ethiopia" },
      { id: "FJ", name: "Fiji" },
      { id: "FI", name: "Finland" },
      { id: "FR", name: "France" },
      { id: "GA", name: "Gabon" },
      { id: "GE", name: "Georgia" },
      { id: "DE", name: "Germany" },
      { id: "GH", name: "Ghana" },
      { id: "GR", name: "Greece" },
      { id: "GD", name: "Grenada" },
      { id: "GT", name: "Guatemala" },
      { id: "GN", name: "Guinea" },
      { id: "GW", name: "Guinea-Bissau" },
      { id: "GY", name: "Guyana" },
      { id: "HT", name: "Haiti" },
      { id: "HN", name: "Honduras" },
      { id: "HU", name: "Hungary" },
      { id: "IS", name: "Iceland" },
      { id: "IN", name: "India" },
      { id: "ID", name: "Indonesia" },
      { id: "IR", name: "Iran" },
      { id: "IQ", name: "Iraq" },
      { id: "IE", name: "Ireland" },
      { id: "IL", name: "Israel" },
      { id: "IT", name: "Italy" },
      { id: "JM", name: "Jamaica" },
      { id: "JP", name: "Japan" },
      { id: "JO", name: "Jordan" },
      { id: "KZ", name: "Kazakhstan" },
      { id: "KE", name: "Kenya" },
      { id: "KP", name: "North Korea" },
      { id: "KR", name: "South Korea" },
      { id: "KW", name: "Kuwait" },
      { id: "KG", name: "Kyrgyzstan" },
      { id: "LA", name: "Laos" },
      { id: "LV", name: "Latvia" },
      { id: "LB", name: "Lebanon" },
      { id: "LS", name: "Lesotho" },
      { id: "LR", name: "Liberia" },
      { id: "LY", name: "Libya" },
      { id: "LI", name: "Liechtenstein" },
      { id: "LT", name: "Lithuania" },
      { id: "LU", name: "Luxembourg" },
      { id: "MG", name: "Madagascar" },
      { id: "MW", name: "Malawi" },
      { id: "MY", name: "Malaysia" },
      { id: "MV", name: "Maldives" },
      { id: "ML", name: "Mali" },
      { id: "MT", name: "Malta" },
      { id: "MR", name: "Mauritania" },
      { id: "MU", name: "Mauritius" },
      { id: "MX", name: "Mexico" },
      { id: "FM", name: "Micronesia" },
      { id: "MD", name: "Moldova" },
      { id: "MN", name: "Mongolia" },
      { id: "ME", name: "Montenegro" },
      { id: "MA", name: "Morocco" },
      { id: "MZ", name: "Mozambique" },
      { id: "MM", name: "Myanmar" },
      { id: "NA", name: "Namibia" },
      { id: "NR", name: "Nauru" },
      { id: "NP", name: "Nepal" },
      { id: "NL", name: "Netherlands" },
      { id: "NZ", name: "New Zealand" },
      { id: "NI", name: "Nicaragua" },
      { id: "NE", name: "Niger" },
      { id: "NG", name: "Nigeria" },
      { id: "MK", name: "North Macedonia" },
      { id: "NO", name: "Norway" },
      { id: "OM", name: "Oman" },
      { id: "PK", name: "Pakistan" },
      { id: "PS", name: "Palestine" },
      { id: "PA", name: "Panama" },
      { id: "PG", name: "Papua New Guinea" },
      { id: "PY", name: "Paraguay" },
      { id: "PE", name: "Peru" },
      { id: "PH", name: "Philippines" },
      { id: "PL", name: "Poland" },
      { id: "PT", name: "Portugal" },
      { id: "QA", name: "Qatar" },
      { id: "RO", name: "Romania" },
      { id: "RU", name: "Russia" },
      { id: "RW", name: "Rwanda" },
      { id: "KN", name: "Saint Kitts and Nevis" },
      { id: "LC", name: "Saint Lucia" },
      { id: "VC", name: "Saint Vincent and the Grenadines" },
      { id: "WS", name: "Samoa" },
      { id: "SM", name: "San Marino" },
      { id: "ST", name: "Sao Tome and Principe" },
      { id: "SA", name: "Saudi Arabia" },
      { id: "SN", name: "Senegal" },
      { id: "RS", name: "Serbia" },
      { id: "SC", name: "Seychelles" },
      { id: "SL", name: "Sierra Leone" },
      { id: "SG", name: "Singapore" },
      { id: "SK", name: "Slovakia" },
      { id: "SI", name: "Slovenia" },
      { id: "SB", name: "Solomon Islands" },
      { id: "SO", name: "Somalia" },
      { id: "ZA", name: "South Africa" },
      { id: "SS", name: "South Sudan" },
      { id: "ES", name: "Spain" },
      { id: "LK", name: "Sri Lanka" },
      { id: "SD", name: "Sudan" },
      { id: "SR", name: "Suriname" },
      { id: "SE", name: "Sweden" },
      { id: "CH", name: "Switzerland" },
      { id: "SY", name: "Syria" },
      { id: "TW", name: "Taiwan" },
      { id: "TJ", name: "Tajikistan" },
      { id: "TZ", name: "Tanzania" },
      { id: "TH", name: "Thailand" },
      { id: "TL", name: "Timor-Leste" },
      { id: "TG", name: "Togo" },
      { id: "TO", name: "Tonga" },
      { id: "TT", name: "Trinidad and Tobago" },
      { id: "TN", name: "Tunisia" },
      { id: "TR", name: "Turkey" },
      { id: "TM", name: "Turkmenistan" },
      { id: "TV", name: "Tuvalu" },
      { id: "UG", name: "Uganda" },
      { id: "UA", name: "Ukraine" },
      { id: "UY", name: "Uruguay" },
      { id: "UZ", name: "Uzbekistan" },
      { id: "VU", name: "Vanuatu" },
      { id: "VE", name: "Venezuela" },
      { id: "VN", name: "Vietnam" },
      { id: "YE", name: "Yemen" },
      { id: "ZM", name: "Zambia" },
      { id: "ZW", name: "Zimbabwe" },
      { id: "DM", name: "Dominica" },
      { id: "CG", name: "Congo" },
      { id: "CD", name: "Democratic Republic of the Congo" },
    ];
    console.log("Using built-in country list (--no-db).");
  }

  console.log("Fetching iVisa sitemap...");
  const res = await fetch(IVISA_SITEMAP_URL, { headers: { "User-Agent": "Mozilla/5.0 (compatible; visa-app-map/1.0)" } });
  if (!res.ok) {
    console.error("Failed to fetch sitemap:", res.status);
    process.exit(1);
  }
  const xml = await res.text();
  const slugs = extractSlugsFromSitemap(xml);
  console.log(`Found ${slugs.size} destination slugs from sitemap.`);

  const map: IvisaCountryMap = {};
  const unmatched: string[] = [];
  const byCode: Record<string, { slugs: string[]; name: string }> = {};

  for (const slug of slugs) {
    const override = SLUG_TO_COUNTRY_OVERRIDES[slug];
    const country = override
      ? countries.find((c) => c.id === override)
      : findCountryBySlug(slug, countries);
    if (country) {
      map[slug] = { name: country.name, countryCode: country.id };
      if (!byCode[country.id]) byCode[country.id] = { name: country.name, slugs: [] };
      byCode[country.id].slugs.push(slug);
    } else {
      unmatched.push(slug);
    }
  }

  // Add apply-now aliases that might not be in sitemap
  for (const [slug, code] of Object.entries(SLUG_TO_COUNTRY_OVERRIDES)) {
    if (!map[slug]) {
      const country = countries.find((c) => c.id === code);
      if (country) {
        map[slug] = { name: country.name, countryCode: code };
        if (!byCode[code]) byCode[code] = { name: country.name, slugs: [] };
        byCode[code].slugs.push(slug);
      }
    }
  }

  /** Preferred apply-now slug per country code (short/common form for URL). */
  const preferredSlugByCode: Record<string, string> = {
    US: "usa",
    GB: "uk",
    AE: "united-arab-emirates",
    CI: "ivory-coast",
    CZ: "czech-republic",
    AG: "antigua-barbuda",
    NZ: "new-zealand",
    KR: "south-korea",
    KP: "north-korea",
    VN: "viet-nam",
    CD: "democratic-republic-of-the-congo",
    CG: "republic-of-the-congo",
    TZ: "tanzania",
    BO: "bolivia",
    VE: "venezuela",
    RU: "russia",
    TR: "turkey",
    SY: "syria",
    IR: "iran",
    LA: "laos",
    BN: "brunei",
    TW: "taiwan",
    PS: "palestine",
    FM: "micronesia",
    MK: "north-macedonia",
    CV: "cape-verde",
    SZ: "eswatini",
    TL: "timor-leste",
    KN: "saint-kitts-and-nevis",
    LC: "saint-lucia",
    VC: "saint-vincent-and-the-grenadines",
    ST: "sao-tome-and-principe",
    TT: "trinidad-and-tobago",
    DO: "dominican-republic",
    CR: "costa-rica",
    SV: "el-salvador",
    LK: "sri-lanka",
    BA: "bosnia-and-herzegovina",
    BF: "burkina-faso",
    CF: "central-african-republic",
    PG: "papua-new-guinea",
    GW: "guinea-bissau",
    GQ: "equatorial-guinea",
  };
  const countryCodeToIvisaSlug: Record<string, string> = {};
  for (const [code, { slugs }] of Object.entries(byCode)) {
    const preferred = preferredSlugByCode[code];
    countryCodeToIvisaSlug[code] =
      (preferred && slugs.includes(preferred) ? preferred : slugs[0]) ?? code.toLowerCase();
  }

  const outDir = resolve(process.cwd(), "scripts");
  const jsonPath = resolve(outDir, "ivisa-country-map.json");
  const tsPath = resolve(outDir, "ivisa-country-map.generated.ts");

  writeFileSync(
    jsonPath,
    JSON.stringify({ slugToCountry: map, countryCodeToSlug: countryCodeToIvisaSlug }, null, 2),
    "utf-8",
  );
  console.log(`Wrote ${jsonPath}`);

  const tsContent = `/**
 * Generated by scripts/ivisa-country-map.ts — do not edit by hand.
 * Map iVisa URL slug → { name, countryCode } (our DB country id).
 * Map country code → iVisa slug for apply-now URL.
 */
export type IvisaCountryEntry = { name: string; countryCode: string };
export type IvisaCountryMap = Record<string, IvisaCountryEntry>;

export const ivisaSlugToCountry: IvisaCountryMap = ${JSON.stringify(map, null, 2)} as const;

/** Country code (e.g. "US", "AG") → iVisa apply-now slug (e.g. "usa", "antigua-barbuda"). */
export const ivisaCountryCodeToSlug: Record<string, string> = ${JSON.stringify(countryCodeToIvisaSlug, null, 2)};

/** Resolve iVisa slug (e.g. "usa", "antigua-barbuda") to our 2-letter country code, or undefined. */
export function ivisaSlugToCountryCode(slug: string): string | undefined {
  const entry = ivisaSlugToCountry[slug.toLowerCase().trim()];
  return entry?.countryCode;
}

/** Resolve country code (e.g. "US") to iVisa apply-now slug (e.g. "usa"), or undefined. */
export function ivisaCountryCodeToSlugFn(code: string): string | undefined {
  return ivisaCountryCodeToSlug[code.toUpperCase().trim()];
}
`;

  writeFileSync(tsPath, tsContent, "utf-8");
  console.log(`Wrote ${tsPath}`);

  if (unmatched.length > 0) {
    console.log(`\nUnmatched slugs (${unmatched.length}):`);
    unmatched.sort();
    for (const s of unmatched.slice(0, 50)) console.log(`  ${s}`);
    if (unmatched.length > 50) console.log(`  ... and ${unmatched.length - 50} more`);
  }
  console.log(`\nMapped ${Object.keys(map).length} slugs to ${Object.keys(byCode).length} countries.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
