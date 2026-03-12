"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_CURRENCY,
  SUPPORTED_CURRENCIES,
  SupportedCurrencyCode,
  isSupportedCurrency,
  guessCurrencyFromLocale,
  getCurrencyFromCountry,
} from "@/lib/currencies";

type FxRates = Record<string, number>;

type CurrencyContextValue = {
  currency: SupportedCurrencyCode;
  setCurrency: (code: SupportedCurrencyCode) => void;
  rates: FxRates | null;
  formatPriceFromUsd: (amountUsd: number) => string;
};

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

function readCurrencyFromCookie(): SupportedCurrencyCode | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )currency=([^;]+)/);
  if (!match) return null;
  const value = decodeURIComponent(match[1]);
  return isSupportedCurrency(value) ? value : null;
}

function writeCurrencyCookie(code: SupportedCurrencyCode) {
  if (typeof document === "undefined") return;
  const maxAgeDays = 365;
  document.cookie = `currency=${encodeURIComponent(code)}; path=/; max-age=${maxAgeDays * 24 * 60 * 60}`;
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<SupportedCurrencyCode>(DEFAULT_CURRENCY);
  const [rates, setRates] = useState<FxRates | null>(null);

  useEffect(() => {
    const fromCookie = readCurrencyFromCookie();
    if (fromCookie) {
      setCurrencyState(fromCookie);
      return;
    }
    const fromLocale = guessCurrencyFromLocale(
      typeof navigator !== "undefined" ? (navigator.languages?.[0] || navigator.language) : null
    );
    setCurrencyState(fromLocale);

    fetch("https://api.country.is/")
      .then((res) => res.json())
      .then((data: { country?: string }) => {
        if (data?.country) {
          const detected = getCurrencyFromCountry(data.country);
          if (detected) {
            setCurrencyState(detected);
            writeCurrencyCookie(detected);
          }
        }
      })
      .catch(() => {
        // Silently ignore (e.g. network, CORS)
      });
  }, []);

  useEffect(() => {
    async function fetchRates() {
      try {
        const res = await fetch("/api/fx");
        if (!res.ok) return;
        const data: { base: string; rates: FxRates } = await res.json();
        setRates(data.rates || null);
      } catch {
        setRates(null);
      }
    }
    fetchRates();
  }, []);

  const setCurrency = (code: SupportedCurrencyCode) => {
    setCurrencyState(code);
    writeCurrencyCookie(code);
  };

  const formatPriceFromUsd = (amountUsd: number): string => {
    const displayCurrency = currency || DEFAULT_CURRENCY;
    const rate = rates?.[displayCurrency] ?? (displayCurrency === "USD" ? 1 : null);
    const amount = rate ? amountUsd * rate : amountUsd;

    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: displayCurrency,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch {
      return `${amount.toFixed(2)} ${displayCurrency}`;
    }
  };

  const value = useMemo<CurrencyContextValue>(
    () => ({
      currency,
      setCurrency,
      rates,
      formatPriceFromUsd,
    }),
    [currency, rates],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return ctx;
}

