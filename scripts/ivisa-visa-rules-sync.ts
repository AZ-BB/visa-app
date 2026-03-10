/**
 * iVisa visa rules sync: updates visa_rules using product-availability-results API.
 * Runs all countries against each other and updates visa_rules (visa_required, is_supported).
 * Uses multiple workers in parallel for faster execution.
 *
 * Run: npm run sync:ivisa-rules
 * Optional: WORKERS=10 npm run sync:ivisa-rules (default: 5)
 * Requires: .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY
 * Logs: logs/ivisa-visa-rules-{timestamp}.log
 */

import { mkdirSync, appendFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { config } from "dotenv";

config({ path: resolve(process.cwd(), ".env.local") });

import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/database.types";
import {
  fetchProductAvailability,
  type ProductAvailabilityOutcome,
} from "./ivisa-api";

type Country = { id: string; name: string };

const WORKERS = Math.max(1, parseInt(process.env.WORKERS ?? "5", 10) || 5);

const LOG_DIR = join(process.cwd(), "logs");
const LOG_FILE = join(
  LOG_DIR,
  `ivisa-visa-rules-${new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)}.log`,
);

let processedCount = 0;
let logLock: Promise<void> = Promise.resolve();

function log(msg: string, alsoConsole = true) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  logLock = logLock.then(() => {
    mkdirSync(LOG_DIR, { recursive: true });
    appendFileSync(LOG_FILE, line, "utf8");
    if (alsoConsole) console.log(msg);
  });
}

function outcomeToVisaRule(outcome: ProductAvailabilityOutcome): {
  visa_required: boolean;
  is_supported: boolean;
} {
  switch (outcome) {
    case "visa_needed_but_unsupported":
      return { visa_required: true, is_supported: false };
    case "no_visa_needed":
      return { visa_required: false, is_supported: true };
    case "visa_supported":
      return { visa_required: true, is_supported: true };
    default:
      return { visa_required: true, is_supported: false };
  }
}

function outcomeToLabel(outcome: ProductAvailabilityOutcome): string {
  switch (outcome) {
    case "visa_supported":
      return "visa required, supported by iVisa";
    case "visa_needed_but_unsupported":
      return "visa required, not supported by iVisa";
    case "no_visa_needed":
      return "no visa required";
    default:
      return outcome;
  }
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

  const countryList = countries.slice(14) as Country[];

  const pairs: { nationality: Country; destination: Country }[] = [];
  for (const nationality of countryList) {
    for (const destination of countryList) {
      if (nationality.id !== destination.id) {
        pairs.push({ nationality, destination });
      }
    }
  }

  const total = pairs.length;
  log(`=== iVisa Visa Rules Sync ===`, true);
  log(`Starting: ${countryList.length} countries, ${total} pairs, ${WORKERS} workers`, true);
  log(`Log file: ${LOG_FILE}`, true);

  let processed = 0;
  let updated = 0;
  let errors = 0;
  const errorLog: { nationality: string; destination: string; message: string }[] = [];

  function chunk<T>(arr: T[], n: number): T[][] {
    const chunks: T[][] = Array.from({ length: n }, () => []);
    arr.forEach((item, i) => chunks[i % n].push(item));
    return chunks;
  }

  const chunks = chunk(pairs, WORKERS);

  async function runWorker(
    workerId: number,
    workerPairs: { nationality: Country; destination: Country }[],
  ) {
    let workerProcessed = 0;

    for (const { nationality, destination } of workerPairs) {
      try {
        const res = await fetchProductAvailability(
          nationality.id,
          destination.id,
          "USD",
        );

        const { visa_required, is_supported } = outcomeToVisaRule(res.outcome);
        const outcomeLabel = outcomeToLabel(res.outcome);

        const { error: upsertErr } = await supabase
          .from("visa_rules")
          .upsert(
            {
              nationality: nationality.id,
              destination_country: destination.id,
              is_visa_required: visa_required,
              is_supported,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "nationality,destination_country" },
          );

        if (upsertErr) {
          errors++;
          errorLog.push({
            nationality: nationality.id,
            destination: destination.id,
            message: upsertErr.message,
          });
          log(
            `  [W${workerId}] ERROR ${nationality.name} (${nationality.id}) → ${destination.name} (${destination.id}): ${upsertErr.message}`,
            true,
          );
        } else {
          updated++;
        }
        processed++;
        workerProcessed++;

        if (workerProcessed % 10 === 0) {
          const pct = ((processed / total) * 100).toFixed(1);
          log(
            `[W${workerId}] [${processed}/${total}] ${pct}% | ${nationality.name} (${nationality.id}) → ${destination.name} (${destination.id}) | ${outcomeLabel} | visa_required=${visa_required} is_supported=${is_supported}`,
            true,
          );
        }

        await new Promise((r) => setTimeout(r, 200));
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        errors++;
        processed++;
        errorLog.push({
          nationality: nationality.id,
          destination: destination.id,
          message: msg,
        });
        log(
          `  [W${workerId}] ERROR ${nationality.name} (${nationality.id}) → ${destination.name} (${destination.id}): ${msg}`,
          true,
        );
      }
    }
  }

  await Promise.all(chunks.map((c, i) => runWorker(i + 1, c)));

  await logLock;

  log("", true);
  log("=== Summary ===", true);
  log(`Processed: ${processed} pairs`, true);
  log(`Updated: ${updated}`, true);
  log(`Errors: ${errors}`, true);
  if (errorLog.length > 0) {
    log("", true);
    log("=== Errors ===", true);
    for (const e of errorLog) {
      const nat = countryList.find((c) => c.id === e.nationality);
      const dest = countryList.find((c) => c.id === e.destination);
      log(
        `  ${nat?.name ?? e.nationality} (${e.nationality}) → ${dest?.name ?? e.destination} (${e.destination}): ${e.message}`,
        true,
      );
    }
  }
  log(`Log written to ${LOG_FILE}`, true);
  log("Done.", true);
  await logLock;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
