"use client";

import { useState } from "react";
import { Separator } from "../ui/separator"
import { CountryDropdown } from "../ui/country-dropdown"
import { cn } from "@/lib/utils"

export function VisaSelector({ rounded = true, shadow = true }: { rounded?: boolean; shadow?: boolean }) {
  const [fromCountry, setFromCountry] = useState("GB");
  const [toCountry, setToCountry] = useState<string | undefined>(undefined);

  return (
    <div
      className={cn(
        "flex flex-col sm:mt-0 md:w-full w-full overflow-hidden bg-white sm:flex-row py-1.5",
        rounded && "rounded-xl",
        shadow && "shadow-[0_24px_48px_0_rgba(0,0,0,0.08)]"
      )}
    >
      <div className="flex flex-col md:flex-row w-full items-center">
        {/* Where am I from? */}
        <div className="w-full flex flex-1 p-5 items-stretch justify-between">
          <CountryDropdown
            label="Where am I from?"
            value={fromCountry}
            onValueChange={setFromCountry}
            placeholder="Choose country"
            aria-label="Country of origin"
            className="w-full"
          />
        </div>

        <Separator orientation="vertical" className="h-[70%]! md:block hidden" />
        <Separator orientation="horizontal" className="w-[95%]! block md:hidden" />

        {/* Where am I travelling? */}
        <div className="w-full flex flex-1 p-5 items-stretch justify-between">
          <CountryDropdown
            label="Where am I travelling?"
            value={toCountry ?? ""}
            onValueChange={(v) => setToCountry(v || undefined)}
            placeholder="Choose location"
            aria-label="Destination country"
            className="w-full"
          />
        </div>

        <Separator orientation="vertical" className="h-[70%]! md:block hidden" />
        <Separator orientation="horizontal" className="w-[95%]! block md:hidden" />

        {/* Choose your visa button */}
        <div className="shrink-0 p-3 md:w-fit w-full">
          <a
            href={`/${toCountry}/apply?from=${fromCountry}`}
            className="flex items-center justify-between gap-3 rounded-full bg-primary px-6 py-4 text-base font-medium text-white transition hover:bg-primary-dark "
          >
            <span className="w-8 block md:hidden"></span>
            <span>Choose your visa</span>
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0A8EFF]"
              aria-hidden
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
              >
                <title>Next</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </span>
          </a>
        </div>
      </div>
    </div>
  )
}
