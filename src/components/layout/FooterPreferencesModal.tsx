"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { CountryFlag } from "@/components/ui/country-flag";
import { SUPPORTED_CURRENCIES } from "@/lib/currencies";
import type { SupportedCurrencyCode } from "@/lib/currencies";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const LOCALE_TO_COUNTRY: Record<string, string> = {
  en: "GB",
  es: "ES",
  fr: "FR",
  de: "DE",
  it: "IT",
};

const LANGUAGES = [
  { code: "en", labelKey: "english" },
  { code: "es", labelKey: "spanish" },
  { code: "fr", labelKey: "french" },
  { code: "de", labelKey: "german" },
  { code: "it", labelKey: "italian" },
] as const;

interface FooterPreferencesModalProps {
  trigger: React.ReactNode;
}

export function FooterPreferencesModal({ trigger }: FooterPreferencesModalProps) {
  const [open, setOpen] = useState(false);
  const locale = useLocale();
  const { currency, setCurrency } = useCurrency();
  const router = useRouter();
  const pathname = usePathname();

  const [selectedLocale, setSelectedLocale] = useState(locale);
  const [selectedCurrency, setSelectedCurrency] = useState<SupportedCurrencyCode>(currency);

  useEffect(() => {
    if (open) {
      setSelectedLocale(locale);
      setSelectedCurrency(currency);
    }
  }, [open, locale, currency]);

  const t = useTranslations("common");
  const tFooter = useTranslations("footer");

  const handleSavePreferences = () => {
    if (selectedLocale !== locale) {
      router.replace(pathname, { locale: selectedLocale });
    }
    if (selectedCurrency !== currency) {
      setCurrency(selectedCurrency);
    }
    setOpen(false);
  };

  const hasChanges = selectedLocale !== locale || selectedCurrency !== currency;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md" showCloseButton={true}>
        <DialogHeader>
          <DialogTitle>{tFooter("preferencesTitle")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 pt-2">
          <div>
            <h3 className="text-sm font-semibold text-primary-copy mb-3">
              {tFooter("language")}
            </h3>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setSelectedLocale(lang.code)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-sm font-medium transition-colors",
                    selectedLocale === lang.code
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border-default bg-white hover:border-primary/50 hover:bg-primary/5 text-primary-copy"
                  )}
                >
                  <CountryFlag
                    code={LOCALE_TO_COUNTRY[lang.code] ?? lang.code}
                    className="size-5 shrink-0"
                    round={true}
                  />
                  {t(lang.labelKey)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-primary-copy mb-3">
              {tFooter("currency")}
            </h3>
            <div className="max-h-48 overflow-y-auto flex flex-wrap gap-2">
              {SUPPORTED_CURRENCIES.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setSelectedCurrency(c.code)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-sm font-medium transition-colors",
                    selectedCurrency === c.code
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border-default bg-white hover:border-primary/50 hover:bg-primary/5 text-primary-copy"
                  )}
                >
                  <span>{c.symbol}</span>
                  <span>{c.code}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4">
          <Button
            onClick={handleSavePreferences}
            disabled={!hasChanges}
            className="w-full sm:w-auto"
          >
            {tFooter("savePreferences")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
