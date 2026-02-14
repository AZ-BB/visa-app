"use client";

import { hasFlag } from "country-flag-icons";
import { ChevronDown } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Popover } from "radix-ui";
import { CountryFlag } from "@/components/ui/country-flag";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const displayNames = new Intl.DisplayNames(["en"], { type: "region" });

function getCountryName(code: string): string {
  try {
    return displayNames.of(code) ?? code;
  } catch {
    return code;
  }
}

// Curated list of common travel/visa countries (~80) so the dropdown opens fast
const COMMON_COUNTRY_CODES = [
  "GB", "US", "CA", "AU", "IE", "FR", "DE", "ES", "IT", "NL", "PT", "BE", "CH", "AT", "PL", "SE", "NO", "DK", "FI",
  "GR", "TR", "CZ", "RO", "HU", "AE", "SA", "EG", "ZA", "NG", "KE", "MA", "IN", "PK", "BD", "CN", "JP", "KR", "TH",
  "VN", "ID", "MY", "SG", "PH", "NZ", "BR", "MX", "AR", "CL", "CO", "PE", "EC", "JM", "TT", "BS", "IL", "RU", "UA",
];

const COUNTRY_OPTIONS = COMMON_COUNTRY_CODES
  .filter((code) => hasFlag(code))
  .map((code) => ({ code, name: getCountryName(code) }))
  .sort((a, b) => a.name.localeCompare(b.name));

type CountryDropdownProps = {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  "aria-label"?: string;
  className?: string;
};

export function CountryDropdown({
  value,
  onValueChange,
  placeholder = "Choose location",
  label,
  "aria-label": ariaLabel,
  className,
}: CountryDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return COUNTRY_OPTIONS;
    const q = search.trim().toLowerCase();
    return COUNTRY_OPTIONS.filter(({ name }) => name.toLowerCase().includes(q));
  }, [search]);

  const selectedOption = value ? COUNTRY_OPTIONS.find((o) => o.code === value) : null;

  const openPopover = useCallback(() => {
    setOpen(true);
    setSearch("");
    setHighlightIndex(0);
    setTimeout(() => searchInputRef.current?.focus(), 0);
  }, []);

  useEffect(() => {
    if (!open) return;
    setHighlightIndex(0);
  }, [search, open]);

  useEffect(() => {
    if (!open || highlightIndex < 0 || highlightIndex >= filteredOptions.length) return;
    const el = listRef.current?.children[highlightIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [highlightIndex, filteredOptions.length, open]);

  const handleSelect = useCallback(
    (code: string) => {
      onValueChange?.(code);
      setOpen(false);
    },
    [onValueChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightIndex((i) => (i < filteredOptions.length - 1 ? i + 1 : i));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightIndex((i) => (i > 0 ? i - 1 : 0));
      } else if (e.key === "Enter" && filteredOptions[highlightIndex]) {
        e.preventDefault();
        handleSelect(filteredOptions[highlightIndex].code);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    },
    [filteredOptions, highlightIndex, handleSelect]
  );

  return (
    <div className={cn("flex flex-col", className)}>
      {label ? (
        <span className="mb-2 block text-base font-semibold text-primary-copy">
          {label}
        </span>
      ) : null}
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            type="button"
            onClick={openPopover}
            className={cn(
              "h-auto min-h-12 w-full rounded-xl border border-[#DAE0E5] bg-white px-4 py-2.5",
              "flex items-center justify-between gap-3 text-base text-primary-copy text-left",
              "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-0",
              "hover:border-gray-300 transition-colors"
            )}
            aria-label={ariaLabel ?? label}
            aria-haspopup="listbox"
            aria-expanded={open}
          >
            {selectedOption ? (
              <span className="flex items-center gap-3 min-w-0">
                <CountryFlag code={selectedOption.code} className="h-6 w-6 shrink-0" />
                <span className="truncate">{selectedOption.name}</span>
              </span>
            ) : (
              <span className="text-secondary-copy">{placeholder}</span>
            )}
            <ChevronDown className="size-5 shrink-0 text-primary-copy" />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            sideOffset={4}
            align="start"
            className="z-50 rounded-xl border border-gray-100 bg-white p-2 shadow-lg focus:outline-none"
            style={{ width: "var(--radix-popover-trigger-width, 280px)" }}
            onOpenAutoFocus={(e) => e.preventDefault()}
            onKeyDown={handleKeyDown}
          >
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search countries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-2 h-10 rounded-lg border-gray-200 px-3 py-2 text-sm"
              aria-label="Search countries"
            />
            <div
              ref={listRef}
              role="listbox"
              className="max-h-[240px] overflow-y-auto rounded-lg"
              aria-label="Countries"
            >
              {filteredOptions.length === 0 ? (
                <div className="py-4 text-center text-sm text-secondary-copy">
                  No countries found
                </div>
              ) : (
                filteredOptions.map(({ code, name }, i) => (
                  <button
                    key={code}
                    type="button"
                    role="option"
                    aria-selected={i === highlightIndex}
                    onClick={() => handleSelect(code)}
                    onMouseEnter={() => setHighlightIndex(i)}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-base text-primary-copy transition-colors",
                      "hover:bg-gray-100 focus:bg-gray-100 focus:outline-none",
                      i === highlightIndex && "bg-gray-100"
                    )}
                  >
                    <CountryFlag code={code} className="h-6 w-6 shrink-0" loading="lazy" />
                    <span>{name}</span>
                  </button>
                ))
              )}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
