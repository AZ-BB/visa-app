"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUPPORTED_CURRENCIES } from "@/lib/currencies";
import { useCurrency } from "@/components/providers/CurrencyProvider";

export function FooterCurrency() {
  const { currency, setCurrency } = useCurrency();

  return (
    <Select value={currency} onValueChange={(value) => setCurrency(value as any)}>
      <SelectTrigger className="h-auto min-h-0 w-auto min-w-0 gap-1.5 rounded-none border-0 bg-transparent px-0 py-0 shadow-none hover:bg-transparent focus:ring-0 text-sm font-normal text-white [&_svg]:text-white">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-64 w-64 min-w-64 text-xs" isContentMenuFullWidth={false}>
        {SUPPORTED_CURRENCIES.map((c) => (
          <SelectItem key={c.code} value={c.code} className="py-1.5">
            {c.symbol} {c.code}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

