export type SupportedCurrencyCode =
  | "AED" | "AFN" | "ALL" | "AMD" | "ANG" | "AOA" | "ARS" | "AUD" | "AWG" | "AZN"
  | "BAM" | "BBD" | "BDT" | "BIF" | "BMD" | "BND" | "BOB" | "BRL" | "BSD" | "BWP"
  | "BZD" | "CAD" | "CDF" | "CHF" | "CLP" | "CNY" | "COP" | "CRC" | "CVE" | "CZK"
  | "DJF" | "DKK" | "DOP" | "DZD" | "EGP" | "ETB" | "EUR" | "FJD" | "FKP" | "GBP"
  | "GEL" | "GIP" | "GMD" | "GNF" | "GTQ" | "GYD" | "HKD" | "HNL" | "HTG" | "HUF"
  | "IDR" | "ILS" | "INR" | "ISK" | "JMD" | "JPY" | "KES" | "KGS" | "KHR" | "KMF"
  | "KRW" | "KYD" | "KZT" | "LAK" | "LBP" | "LKR" | "LRD" | "LSL" | "MAD" | "MDL"
  | "MGA" | "MKD" | "MNT" | "MOP" | "MUR" | "MVR" | "MWK" | "MXN" | "MYR" | "MZN"
  | "NAD" | "NGN" | "NIO" | "NOK" | "NPR" | "NZD" | "PAB" | "PEN" | "PGK" | "PHP"
  | "PKR" | "PLN" | "PYG" | "QAR" | "RON" | "RSD" | "RUB" | "RWF" | "SAR" | "SBD"
  | "SCR" | "SEK" | "SGD" | "SHP" | "SOS" | "SRD" | "SZL" | "THB" | "TJS" | "TOP"
  | "TRY" | "TTD" | "TWD" | "TZS" | "UAH" | "USD" | "UYU" | "UZS" | "VND" | "VUV"
  | "WST" | "XAF" | "XCD" | "XOF" | "XPF" | "YER" | "ZAR" | "ZMW";


export type SupportedCurrency = {
  code: SupportedCurrencyCode;
  symbol: string;
  label: string;
};

export const SUPPORTED_CURRENCIES: SupportedCurrency[] = [
  { code: "AED", symbol: "د.إ", label: "AED د.إ" },
  { code: "AFN", symbol: "؋", label: "AFN ؋" },
  { code: "ALL", symbol: "Lek", label: "ALL Lek" },
  { code: "AMD", symbol: "֏", label: "AMD ֏" },
  { code: "ANG", symbol: "ƒ", label: "ANG ƒ" },
  { code: "AOA", symbol: "Kz", label: "AOA Kz" },
  { code: "ARS", symbol: "$", label: "ARS $" },
  { code: "AUD", symbol: "$", label: "AUD $" },
  { code: "AWG", symbol: "ƒ", label: "AWG ƒ" },
  { code: "AZN", symbol: "₼", label: "AZN ₼" },

  { code: "BAM", symbol: "KM", label: "BAM KM" },
  { code: "BBD", symbol: "$", label: "BBD $" },
  { code: "BDT", symbol: "৳", label: "BDT ৳" },
  { code: "BIF", symbol: "FBu", label: "BIF FBu" },
  { code: "BMD", symbol: "$", label: "BMD $" },
  { code: "BND", symbol: "$", label: "BND $" },
  { code: "BOB", symbol: "$b", label: "BOB $b" },
  { code: "BRL", symbol: "R$", label: "BRL R$" },
  { code: "BSD", symbol: "$", label: "BSD $" },
  { code: "BWP", symbol: "P", label: "BWP P" },
  { code: "BZD", symbol: "$", label: "BZD $" },

  { code: "CAD", symbol: "$", label: "CAD $" },
  { code: "CDF", symbol: "FC", label: "CDF FC" },
  { code: "CHF", symbol: "CHF", label: "CHF CHF" },
  { code: "CLP", symbol: "$", label: "CLP $" },
  { code: "CNY", symbol: "¥", label: "CNY ¥" },
  { code: "COP", symbol: "$", label: "COP $" },
  { code: "CRC", symbol: "₡", label: "CRC ₡" },
  { code: "CVE", symbol: "$", label: "CVE $" },
  { code: "CZK", symbol: "Kč", label: "CZK Kč" },

  { code: "DJF", symbol: "Fdj", label: "DJF Fdj" },
  { code: "DKK", symbol: "kr", label: "DKK kr" },
  { code: "DOP", symbol: "RD$", label: "DOP RD$" },
  { code: "DZD", symbol: "دج", label: "DZD دج" },

  { code: "EGP", symbol: "£", label: "EGP £" },
  { code: "ETB", symbol: "Br", label: "ETB Br" },
  { code: "EUR", symbol: "€", label: "EUR €" },

  { code: "FJD", symbol: "$", label: "FJD $" },
  { code: "FKP", symbol: "£", label: "FKP £" },

  { code: "GBP", symbol: "£", label: "GBP £" },
  { code: "GEL", symbol: "ლ", label: "GEL ლ" },
  { code: "GIP", symbol: "£", label: "GIP £" },
  { code: "GMD", symbol: "D", label: "GMD D" },
  { code: "GNF", symbol: "Fr", label: "GNF Fr" },
  { code: "GTQ", symbol: "Q", label: "GTQ Q" },
  { code: "GYD", symbol: "$", label: "GYD $" },

  { code: "HKD", symbol: "$", label: "HKD $" },
  { code: "HNL", symbol: "L", label: "HNL L" },
  { code: "HTG", symbol: "G", label: "HTG G" },
  { code: "HUF", symbol: "Ft", label: "HUF Ft" },

  { code: "IDR", symbol: "Rp", label: "IDR Rp" },
  { code: "ILS", symbol: "₪", label: "ILS ₪" },
  { code: "INR", symbol: "₹", label: "INR ₹" },
  { code: "ISK", symbol: "kr", label: "ISK kr" },

  { code: "JMD", symbol: "J$", label: "JMD J$" },
  { code: "JPY", symbol: "¥", label: "JPY ¥" },

  { code: "KES", symbol: "/=", label: "KES /=" },
  { code: "KGS", symbol: "лв", label: "KGS лв" },
  { code: "KHR", symbol: "៛", label: "KHR ៛" },
  { code: "KMF", symbol: "CF", label: "KMF CF" },
  { code: "KRW", symbol: "₩", label: "KRW ₩" },
  { code: "KYD", symbol: "$", label: "KYD $" },
  { code: "KZT", symbol: "лв", label: "KZT лв" },

  { code: "LAK", symbol: "₭", label: "LAK ₭" },
  { code: "LBP", symbol: "£", label: "LBP £" },
  { code: "LKR", symbol: "₨", label: "LKR ₨" },
  { code: "LRD", symbol: "$", label: "LRD $" },
  { code: "LSL", symbol: "L", label: "LSL L" },

  { code: "MAD", symbol: "DH", label: "MAD DH" },
  { code: "MDL", symbol: "L", label: "MDL L" },
  { code: "MGA", symbol: "Ar", label: "MGA Ar" },
  { code: "MKD", symbol: "ден", label: "MKD ден" },
  { code: "MNT", symbol: "₮", label: "MNT ₮" },
  { code: "MOP", symbol: "$", label: "MOP $" },
  { code: "MUR", symbol: "₨", label: "MUR ₨" },
  { code: "MVR", symbol: "Rf", label: "MVR Rf" },
  { code: "MWK", symbol: "MK", label: "MWK MK" },
  { code: "MXN", symbol: "$", label: "MXN $" },
  { code: "MYR", symbol: "RM", label: "MYR RM" },
  { code: "MZN", symbol: "MT", label: "MZN MT" },

  { code: "NAD", symbol: "$", label: "NAD $" },
  { code: "NGN", symbol: "₦", label: "NGN ₦" },
  { code: "NIO", symbol: "C$", label: "NIO C$" },
  { code: "NOK", symbol: "kr", label: "NOK kr" },
  { code: "NPR", symbol: "₨", label: "NPR ₨" },
  { code: "NZD", symbol: "$", label: "NZD $" },

  { code: "PAB", symbol: "B/.", label: "PAB B/." },
  { code: "PEN", symbol: "S/.", label: "PEN S/." },
  { code: "PGK", symbol: "K", label: "PGK K" },
  { code: "PHP", symbol: "₱", label: "PHP ₱" },
  { code: "PKR", symbol: "₨", label: "PKR ₨" },
  { code: "PLN", symbol: "zł", label: "PLN zł" },
  { code: "PYG", symbol: "Gs", label: "PYG Gs" },

  { code: "QAR", symbol: "﷼", label: "QAR ﷼" },

  { code: "RON", symbol: "lei", label: "RON lei" },
  { code: "RSD", symbol: "Дин.", label: "RSD Дин." },
  { code: "RUB", symbol: "₽", label: "RUB ₽" },
  { code: "RWF", symbol: "R₣", label: "RWF R₣" },

  { code: "SAR", symbol: "﷼", label: "SAR ﷼" },
  { code: "SBD", symbol: "$", label: "SBD $" },
  { code: "SCR", symbol: "₨", label: "SCR ₨" },
  { code: "SEK", symbol: "kr", label: "SEK kr" },
  { code: "SGD", symbol: "$", label: "SGD $" },
  { code: "SHP", symbol: "£", label: "SHP £" },
  { code: "SOS", symbol: "S", label: "SOS S" },
  { code: "SRD", symbol: "$", label: "SRD $" },
  { code: "SZL", symbol: "E", label: "SZL E" },

  { code: "THB", symbol: "฿", label: "THB ฿" },
  { code: "TJS", symbol: "SM", label: "TJS SM" },
  { code: "TOP", symbol: "£", label: "TOP £" },
  { code: "TRY", symbol: "₺", label: "TRY ₺" },
  { code: "TTD", symbol: "TT$", label: "TTD TT$" },
  { code: "TWD", symbol: "NT$", label: "TWD NT$" },
  { code: "TZS", symbol: "TSh", label: "TZS TSh" },

  { code: "UAH", symbol: "₴", label: "UAH ₴" },
  { code: "USD", symbol: "$", label: "USD $" },
  { code: "UYU", symbol: "$U", label: "UYU $U" },
  { code: "UZS", symbol: "лв", label: "UZS лв" },

  { code: "VND", symbol: "₫", label: "VND ₫" },
  { code: "VUV", symbol: "VT", label: "VUV VT" },

  { code: "WST", symbol: "WS$", label: "WST WS$" },

  { code: "XAF", symbol: "FCFA", label: "XAF FCFA" },
  { code: "XCD", symbol: "$", label: "XCD $" },
  { code: "XOF", symbol: "CFA", label: "XOF CFA" },
  { code: "XPF", symbol: "₣", label: "XPF ₣" },

  { code: "YER", symbol: "﷼", label: "YER ﷼" },

  { code: "ZAR", symbol: "R", label: "ZAR R" },
  { code: "ZMW", symbol: "ZK", label: "ZMW ZK" },
];

export const DEFAULT_CURRENCY: SupportedCurrencyCode = "USD";

/** ISO 3166-1 alpha-2 country code -> currency code. Used for geo-based currency detection. */
export const COUNTRY_TO_CURRENCY: Record<string, SupportedCurrencyCode> = {
  US: "USD", CA: "CAD", MX: "MXN", GB: "GBP", IE: "EUR",
  AU: "AUD", NZ: "NZD", JP: "JPY", CN: "CNY", HK: "HKD", SG: "SGD", KR: "KRW", IN: "INR", TH: "THB", MY: "MYR", ID: "IDR", PH: "PHP", VN: "VND",
  AE: "AED", SA: "SAR", EG: "EGP", QA: "QAR", KW: "AED", BH: "AED", OM: "AED", JO: "USD", IL: "ILS", TR: "TRY",
  DE: "EUR", FR: "EUR", IT: "EUR", ES: "EUR", NL: "EUR", BE: "EUR", AT: "EUR", PT: "EUR", PL: "PLN", CH: "CHF", SE: "SEK", NO: "NOK", DK: "DKK", CZ: "CZK", HU: "HUF", RO: "RON", BG: "EUR", GR: "EUR", HR: "EUR", SK: "EUR", SI: "EUR", FI: "EUR", EE: "EUR", LV: "EUR", LT: "EUR", LU: "EUR", MT: "EUR", CY: "EUR",
  BR: "BRL", AR: "ARS", CL: "CLP", CO: "COP", PE: "PEN", UY: "UYU", PY: "PYG", BO: "BOB", EC: "USD", VE: "USD",
  ZA: "ZAR", NG: "NGN", KE: "KES", GH: "USD", TZ: "TZS", UG: "USD", ET: "ETB", MA: "MAD", DZ: "DZD", TN: "USD",
  RU: "RUB", UA: "UAH", KZ: "KZT", BY: "USD", GE: "GEL", AZ: "AZN", AM: "AMD",
};

export function getCurrencyFromCountry(countryCode: string | null | undefined): SupportedCurrencyCode | null {
  if (!countryCode || typeof countryCode !== "string") return null;
  const code = countryCode.toUpperCase().trim();
  const currency = COUNTRY_TO_CURRENCY[code];
  return currency ?? null;
}

export function isSupportedCurrency(
  code: string | null | undefined,
): code is SupportedCurrencyCode {
  return SUPPORTED_CURRENCIES.some((c) => c.code === code);
}

export function guessCurrencyFromLocale(locale: string | null | undefined): SupportedCurrencyCode {
  if (!locale) return DEFAULT_CURRENCY;

  const lower = locale.toLowerCase();

  if (lower.includes("gb") || lower.includes("uk")) {
    return "GBP";
  }

  if (
    lower.includes("de") ||
    lower.includes("fr") ||
    lower.includes("es") ||
    lower.includes("it") ||
    lower.includes("nl") ||
    lower.includes("pt") ||
    lower.includes("be") ||
    lower.includes("at")
  ) {
    return "EUR";
  }

  if (lower.includes("ae") || lower.includes("ar-ae")) {
    return "AED";
  }

  return DEFAULT_CURRENCY;
}

