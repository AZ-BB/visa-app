"use client";

import { useEffect, useState } from "react";
import { Separator } from "../ui/separator"
import { CountryDropdown } from "../ui/country-dropdown"
import { cn } from "@/lib/utils"
import { fetchAllCountriesList } from "@/actions/countries";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function VisaSelector({ rounded = true, shadow = true }: { rounded?: boolean; shadow?: boolean }) {
  const t = useTranslations("visaSelector");
  const [fromCountry, setFromCountry] = useState<string | undefined>(undefined);
  const [toCountry, setToCountry] = useState<string | undefined>(undefined);
  const [countries, setCountries] = useState<{ id: string; name: string; is_disabled: boolean }[]>([]);

  useEffect(() => {
    fetchAllCountriesList().then((res) => {
      if (res.data) setCountries(res.data);
    });
  }, []);

  useEffect(() => {
    fetch("https://api.country.is/")
      .then((res) => res.json())
      .then((data: { country?: string }) => {
        if (data.country) {
          setFromCountry(data.country);
        }
      })
      .catch(() => {
        // Silently ignore geolocation errors (e.g. network)
      });
  }, []);

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
            label={t("whereAmIFrom")}
            value={fromCountry ?? ""}
            onValueChange={(v) => setFromCountry(v || undefined)}
            placeholder={t("chooseCountry")}
            aria-label="Country of origin"
            className=""
            contentClassName="w-full"
          />
        </div>

        <Separator orientation="vertical" className="h-[70%]! md:block hidden" />
        <Separator orientation="horizontal" className="w-[95%]! block md:hidden" />

        {/* Where am I travelling? */}
        <div className="w-full flex flex-1 p-5 items-stretch justify-between">
          <CountryDropdown
            values={countries.filter((c) => !c.is_disabled).map((c) => ({ id: c.id, name: c.name }))}
            label={t("whereAmITravelling")}
            value={toCountry ?? ""}
            onValueChange={(v) => setToCountry(v || undefined)}
            placeholder={t("chooseLocation")}
            aria-label="Destination country"
            className=""
            contentClassName="w-full"
          />
        </div>

        <Separator orientation="vertical" className="h-[70%]! md:block hidden" />
        <Separator orientation="horizontal" className="w-[95%]! block md:hidden" />

        {/* Choose your visa button */}
        <div className="shrink-0 p-3 md:w-fit w-full">
          <Link
            href={toCountry && fromCountry ? `/${toCountry}/apply?from=${fromCountry}` : "#"}
            className="flex items-center justify-between gap-3 rounded-full bg-primary px-6 py-4 text-base font-medium text-white transition hover:bg-primary-dark "
          >
            <span className="w-8 block md:hidden"></span>
            <span>{t("chooseYourVisa")}</span>
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
          </Link>
        </div>
      </div>
    </div>
  )
}
