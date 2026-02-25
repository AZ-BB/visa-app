import { clsx, type ClassValue } from "clsx"
import { hasFlag } from "country-flag-icons";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


