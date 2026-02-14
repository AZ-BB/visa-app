"use client";

import { hasFlag } from "country-flag-icons";
import { cn } from "@/lib/utils";

const FLAG_CDN = "https://catamphetamine.github.io/country-flag-icons/3x2";

type CountryFlagProps = {
  code: string;
  className?: string;
  round?: boolean;
  /** Use "lazy" in long lists to speed up opening */
  loading?: "lazy" | "eager";
};

export function CountryFlag({ code, className, round = true, loading = "eager" }: CountryFlagProps) {
  const upper = code.toUpperCase();
  if (!hasFlag(upper)) return null;

  return (
    <span
      className={cn("inline-block shrink-0 overflow-hidden bg-gray-100", round && "rounded-full", className)}
      style={round ? { aspectRatio: "1" } : { aspectRatio: "3/2" }}
    >
      <img
        src={`${FLAG_CDN}/${upper}.svg`}
        alt=""
        loading={loading}
        decoding={loading === "lazy" ? "async" : undefined}
        className={cn("h-full w-full object-cover", round && "object-cover")}
      />
    </span>
  );
}
