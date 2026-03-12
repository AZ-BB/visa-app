type FxRates = Record<string, number>;

let cachedRates: FxRates | null = null;
let lastFetchedAt: number | null = null;

const CACHE_TTL_MS = 3 * 60 * 60 * 1000; // 3 hours

const EXCHANGERATE_OPEN_URL = "https://open.er-api.com/v6/latest/USD";
const EXCHANGERATE_API_URL = "https://v6.exchangerate-api.com/v6";

export async function getUsdExchangeRates(): Promise<FxRates> {
  const now = Date.now();

  if (cachedRates && lastFetchedAt && now - lastFetchedAt < CACHE_TTL_MS) {
    return cachedRates;
  }

  try {
    const apiKey = process.env.EXCHANGERATE_API_KEY;
    const url = apiKey
      ? `${EXCHANGERATE_API_URL}/${apiKey}/latest/USD`
      : EXCHANGERATE_OPEN_URL;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`ExchangeRate-API returned ${res.status}`);
    }

    const data = (await res.json()) as {
      result?: string;
      rates?: FxRates;
    };

    if (data.result === "error") {
      throw new Error((data as { "error-type"?: string })["error-type"] ?? "Unknown error");
    }

    cachedRates = data.rates ?? {};
    lastFetchedAt = now;

    return cachedRates;
  } catch (error) {
    console.error("Failed to fetch FX rates from ExchangeRate-API:", error);
    cachedRates = {};
    lastFetchedAt = now;
    return cachedRates;
  }
}
