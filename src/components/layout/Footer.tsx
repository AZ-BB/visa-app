"use client";

import { InstagramIcon, TwitterIcon, ChevronDown } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { FooterPreferencesModal } from "./FooterPreferencesModal";
import { CountryFlag } from "@/components/ui/country-flag";
import { useLocale } from "next-intl";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { useTranslations } from "next-intl";

const LOCALE_TO_COUNTRY: Record<string, string> = {
  en: "GB",
  es: "ES",
  fr: "FR",
  de: "DE",
  it: "IT",
};

export function Footer() {
  const t = useTranslations("footer");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const { currency } = useCurrency();

  const countryCode = LOCALE_TO_COUNTRY[locale] ?? "GB";

  return (
    <footer className="bg-primary-dark text-white py-8">
      <div className="max-w-7xl mx-auto space-y-6 px-4 sm:px-6">
        <div className="text-xl sm:text-2xl font-bold">
          logo <span className="text-orange-500 -ml-1">.</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <span className="font-normal text-sm sm:text-base">
            {t("copyright")}
          </span>

          <div className="flex gap-5">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <TwitterIcon />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <InstagramIcon />
            </a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
          <div className="flex flex-wrap gap-4 font-semibold text-sm sm:text-base">
            <Link href="/terms" className="hover:underline">{tCommon("termsOfService")}</Link>
            <Link href="/contact-us" className="hover:underline">{tCommon("contactUs")}</Link>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm sm:text-base">
            <FooterPreferencesModal
              trigger={
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/5 px-3 py-2 font-medium text-white transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50"
                  aria-label={t("preferencesTitle")}
                >
                  <CountryFlag
                    code={countryCode}
                    className="size-5 shrink-0"
                    round={true}
                  />
                  <span>{currency}</span>
                  <ChevronDown className="size-4 shrink-0 opacity-70" aria-hidden />
                </button>
              }
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
