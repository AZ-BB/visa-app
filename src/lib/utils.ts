import { clsx, type ClassValue } from "clsx"
import { hasFlag } from "country-flag-icons";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts valid_for from {number}{d,m,y} format to human-readable text.
 * e.g. 1m -> "1 month", 2d -> "2 days", 3y -> "3 years"
 * Returns the input as-is if it doesn't match the pattern.
 */
export function formatValidFor(value: string | null | undefined): string {
  if (value == null || value.trim() === "") return "—";
  const trimmed = value.trim();
  const match = trimmed.match(/^(\d+)([dmy])$/i);
  if (!match) return trimmed;
  const num = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  const labels: Record<string, [string, string]> = {
    d: ["day", "days"],
    m: ["month", "months"],
    y: ["year", "years"],
  };
  const [singular, plural] = labels[unit];
  return `${num} ${num === 1 ? singular : plural}`;
}


