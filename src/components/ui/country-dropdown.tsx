"use client";

import { ChevronDown } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { List, useListRef } from "react-window";
import { Popover } from "radix-ui";
import { CountryFlag } from "@/components/ui/country-flag";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const LIST_HEIGHT = 240;
const ITEM_HEIGHT = 44;

type CountryRowProps = {
  options: CountryOption[];
  highlightIndex: number;
  onSelect: (id: string) => void;
  onHighlight: (index: number) => void;
};

function CountryRow({
  index,
  style,
  ariaAttributes,
  options,
  highlightIndex,
  onSelect,
  onHighlight,
}: {
  index: number;
  style: React.CSSProperties;
  ariaAttributes: { "aria-posinset": number; "aria-setsize": number; role: "listitem" };
  options: CountryOption[];
  highlightIndex: number;
  onSelect: (id: string) => void;
  onHighlight: (index: number) => void;
}) {
  const { id, name } = options[index] ?? { id: "", name: "" };
  const isHighlighted = index === highlightIndex;
  return (
    <button
      type="button"
      role="option"
      aria-selected={isHighlighted}
      aria-posinset={ariaAttributes["aria-posinset"]}
      aria-setsize={ariaAttributes["aria-setsize"]}
      onClick={() => onSelect(id)}
      onMouseEnter={() => onHighlight(index)}
      style={style}
      className={cn(
        "flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-base text-primary-copy transition-colors",
        "hover:bg-gray-100 focus:bg-gray-100 focus:outline-none",
        isHighlighted && "bg-gray-100"
      )}
    >
      <CountryFlag code={id} className="h-6 w-6 shrink-0" loading="lazy" />
      <span>{name}</span>
    </button>
  );
}

export type CountryOption = { id: string; name: string };

// Static list of 195 countries (ISO 3166-1 alpha-2) - matches DB seed
const DEFAULT_COUNTRIES: CountryOption[] = [
  { id: "AF", name: "Afghanistan" },
  { id: "AL", name: "Albania" },
  { id: "DZ", name: "Algeria" },
  { id: "AD", name: "Andorra" },
  { id: "AO", name: "Angola" },
  { id: "AG", name: "Antigua and Barbuda" },
  { id: "AR", name: "Argentina" },
  { id: "AM", name: "Armenia" },
  { id: "AU", name: "Australia" },
  { id: "AT", name: "Austria" },
  { id: "AZ", name: "Azerbaijan" },
  { id: "BS", name: "Bahamas" },
  { id: "BH", name: "Bahrain" },
  { id: "BD", name: "Bangladesh" },
  { id: "BB", name: "Barbados" },
  { id: "BY", name: "Belarus" },
  { id: "BE", name: "Belgium" },
  { id: "BZ", name: "Belize" },
  { id: "BJ", name: "Benin" },
  { id: "BT", name: "Bhutan" },
  { id: "BO", name: "Bolivia" },
  { id: "BA", name: "Bosnia and Herzegovina" },
  { id: "BW", name: "Botswana" },
  { id: "BR", name: "Brazil" },
  { id: "BN", name: "Brunei" },
  { id: "BG", name: "Bulgaria" },
  { id: "BF", name: "Burkina Faso" },
  { id: "BI", name: "Burundi" },
  { id: "CV", name: "Cabo Verde" },
  { id: "KH", name: "Cambodia" },
  { id: "CM", name: "Cameroon" },
  { id: "CA", name: "Canada" },
  { id: "CF", name: "Central African Republic" },
  { id: "TD", name: "Chad" },
  { id: "CL", name: "Chile" },
  { id: "CN", name: "China" },
  { id: "CO", name: "Colombia" },
  { id: "KM", name: "Comoros" },
  { id: "CG", name: "Congo" },
  { id: "CD", name: "Democratic Republic of the Congo" },
  { id: "CR", name: "Costa Rica" },
  { id: "CI", name: "Côte d'Ivoire" },
  { id: "HR", name: "Croatia" },
  { id: "CU", name: "Cuba" },
  { id: "CY", name: "Cyprus" },
  { id: "CZ", name: "Czechia" },
  { id: "DK", name: "Denmark" },
  { id: "DJ", name: "Djibouti" },
  { id: "DM", name: "Dominica" },
  { id: "DO", name: "Dominican Republic" },
  { id: "EC", name: "Ecuador" },
  { id: "EG", name: "Egypt" },
  { id: "SV", name: "El Salvador" },
  { id: "GQ", name: "Equatorial Guinea" },
  { id: "ER", name: "Eritrea" },
  { id: "EE", name: "Estonia" },
  { id: "SZ", name: "Eswatini" },
  { id: "ET", name: "Ethiopia" },
  { id: "FJ", name: "Fiji" },
  { id: "FI", name: "Finland" },
  { id: "FR", name: "France" },
  { id: "GA", name: "Gabon" },
  { id: "GM", name: "Gambia" },
  { id: "GE", name: "Georgia" },
  { id: "DE", name: "Germany" },
  { id: "GH", name: "Ghana" },
  { id: "GR", name: "Greece" },
  { id: "GD", name: "Grenada" },
  { id: "GT", name: "Guatemala" },
  { id: "GN", name: "Guinea" },
  { id: "GW", name: "Guinea-Bissau" },
  { id: "GY", name: "Guyana" },
  { id: "HT", name: "Haiti" },
  { id: "HN", name: "Honduras" },
  { id: "HU", name: "Hungary" },
  { id: "IS", name: "Iceland" },
  { id: "IN", name: "India" },
  { id: "ID", name: "Indonesia" },
  { id: "IR", name: "Iran" },
  { id: "IQ", name: "Iraq" },
  { id: "IE", name: "Ireland" },
  { id: "IL", name: "Israel" },
  { id: "IT", name: "Italy" },
  { id: "JM", name: "Jamaica" },
  { id: "JP", name: "Japan" },
  { id: "JO", name: "Jordan" },
  { id: "KZ", name: "Kazakhstan" },
  { id: "KE", name: "Kenya" },
  { id: "KI", name: "Kiribati" },
  { id: "KP", name: "North Korea" },
  { id: "KR", name: "South Korea" },
  { id: "KW", name: "Kuwait" },
  { id: "KG", name: "Kyrgyzstan" },
  { id: "LA", name: "Laos" },
  { id: "LV", name: "Latvia" },
  { id: "LB", name: "Lebanon" },
  { id: "LS", name: "Lesotho" },
  { id: "LR", name: "Liberia" },
  { id: "LY", name: "Libya" },
  { id: "LI", name: "Liechtenstein" },
  { id: "LT", name: "Lithuania" },
  { id: "LU", name: "Luxembourg" },
  { id: "MG", name: "Madagascar" },
  { id: "MW", name: "Malawi" },
  { id: "MY", name: "Malaysia" },
  { id: "MV", name: "Maldives" },
  { id: "ML", name: "Mali" },
  { id: "MT", name: "Malta" },
  { id: "MH", name: "Marshall Islands" },
  { id: "MR", name: "Mauritania" },
  { id: "MU", name: "Mauritius" },
  { id: "MX", name: "Mexico" },
  { id: "FM", name: "Micronesia" },
  { id: "MD", name: "Moldova" },
  { id: "MC", name: "Monaco" },
  { id: "MN", name: "Mongolia" },
  { id: "ME", name: "Montenegro" },
  { id: "MA", name: "Morocco" },
  { id: "MZ", name: "Mozambique" },
  { id: "MM", name: "Myanmar" },
  { id: "NA", name: "Namibia" },
  { id: "NR", name: "Nauru" },
  { id: "NP", name: "Nepal" },
  { id: "NL", name: "Netherlands" },
  { id: "NZ", name: "New Zealand" },
  { id: "NI", name: "Nicaragua" },
  { id: "NE", name: "Niger" },
  { id: "NG", name: "Nigeria" },
  { id: "MK", name: "North Macedonia" },
  { id: "NO", name: "Norway" },
  { id: "OM", name: "Oman" },
  { id: "PK", name: "Pakistan" },
  { id: "PW", name: "Palau" },
  { id: "PS", name: "Palestine" },
  { id: "PA", name: "Panama" },
  { id: "PG", name: "Papua New Guinea" },
  { id: "PY", name: "Paraguay" },
  { id: "PE", name: "Peru" },
  { id: "PH", name: "Philippines" },
  { id: "PL", name: "Poland" },
  { id: "PT", name: "Portugal" },
  { id: "QA", name: "Qatar" },
  { id: "RO", name: "Romania" },
  { id: "RU", name: "Russia" },
  { id: "RW", name: "Rwanda" },
  { id: "KN", name: "Saint Kitts and Nevis" },
  { id: "LC", name: "Saint Lucia" },
  { id: "VC", name: "Saint Vincent and the Grenadines" },
  { id: "WS", name: "Samoa" },
  { id: "SM", name: "San Marino" },
  { id: "ST", name: "Sao Tome and Principe" },
  { id: "SA", name: "Saudi Arabia" },
  { id: "SN", name: "Senegal" },
  { id: "RS", name: "Serbia" },
  { id: "SC", name: "Seychelles" },
  { id: "SL", name: "Sierra Leone" },
  { id: "SG", name: "Singapore" },
  { id: "SK", name: "Slovakia" },
  { id: "SI", name: "Slovenia" },
  { id: "SB", name: "Solomon Islands" },
  { id: "SO", name: "Somalia" },
  { id: "ZA", name: "South Africa" },
  { id: "SS", name: "South Sudan" },
  { id: "ES", name: "Spain" },
  { id: "LK", name: "Sri Lanka" },
  { id: "SD", name: "Sudan" },
  { id: "SR", name: "Suriname" },
  { id: "SE", name: "Sweden" },
  { id: "CH", name: "Switzerland" },
  { id: "SY", name: "Syria" },
  { id: "TW", name: "Taiwan" },
  { id: "TJ", name: "Tajikistan" },
  { id: "TZ", name: "Tanzania" },
  { id: "TH", name: "Thailand" },
  { id: "TL", name: "Timor-Leste" },
  { id: "TG", name: "Togo" },
  { id: "TO", name: "Tonga" },
  { id: "TT", name: "Trinidad and Tobago" },
  { id: "TN", name: "Tunisia" },
  { id: "TR", name: "Turkey" },
  { id: "TM", name: "Turkmenistan" },
  { id: "TV", name: "Tuvalu" },
  { id: "UG", name: "Uganda" },
  { id: "UA", name: "Ukraine" },
  { id: "AE", name: "United Arab Emirates" },
  { id: "GB", name: "United Kingdom" },
  { id: "US", name: "United States" },
  { id: "UY", name: "Uruguay" },
  { id: "UZ", name: "Uzbekistan" },
  { id: "VU", name: "Vanuatu" },
  { id: "VE", name: "Venezuela" },
  { id: "VN", name: "Vietnam" },
  { id: "YE", name: "Yemen" },
  { id: "ZM", name: "Zambia" },
  { id: "ZW", name: "Zimbabwe" },
];

type CountryDropdownProps = {
  /** Array of countries with id (alpha2) and name. When omitted, uses static list of 195 countries. */
  values?: CountryOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  "aria-label"?: string;
  className?: string;
  contentClassName?: string;
};

export function CountryDropdown({
  values: valuesProp,
  value,
  onValueChange,
  placeholder = "Choose location",
  label,
  "aria-label": ariaLabel,
  className,
  contentClassName,
}: CountryDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useListRef(null);
  const scrollFromKeyboardRef = useRef(false);

  const options = valuesProp ?? DEFAULT_COUNTRIES;

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.trim().toLowerCase();
    return options.filter(
      ({ id, name }) =>
        name.toLowerCase().includes(q) || id.toLowerCase().includes(q)
    );
  }, [options, search]);

  const selectedOption = value ? options.find((o) => o.id === value) : null;

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
    if (!open || highlightIndex < 0 || highlightIndex >= filteredOptions.length || !scrollFromKeyboardRef.current) return;
    scrollFromKeyboardRef.current = false;
    listRef.current?.scrollToRow({ index: highlightIndex, align: "smart", behavior: "smooth" });
  }, [highlightIndex, filteredOptions.length, open]);

  const handleSelect = useCallback(
    (id: string) => {
      onValueChange?.(id);
      setOpen(false);
    },
    [onValueChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        scrollFromKeyboardRef.current = true;
        setHighlightIndex((i) => (i < filteredOptions.length - 1 ? i + 1 : i));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        scrollFromKeyboardRef.current = true;
        setHighlightIndex((i) => (i > 0 ? i - 1 : 0));
      } else if (e.key === "Enter" && filteredOptions[highlightIndex]) {
        e.preventDefault();
        handleSelect(filteredOptions[highlightIndex].id);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    },
    [filteredOptions, highlightIndex, handleSelect]
  );

  return (
    <div className={cn("flex flex-col", contentClassName)}>
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
              "h-auto min-h-12 w-full rounded-2xl border border-[#DAE0E5] bg-white px-4 py-2.5 shadow-[0px_2px_4px_0px_#0000000A]",
              "flex items-center justify-between gap-3 text-base text-primary-copy text-left",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0",
              "hover:border-gray-300 transition-colors",
              className
            )}
            aria-label={ariaLabel ?? label}
            aria-haspopup="listbox"
            aria-expanded={open}
          >
            {selectedOption ? (
              <span className="flex items-center gap-3 min-w-0">
                <CountryFlag code={selectedOption.id} className="h-6 w-6 shrink-0" />
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
            className="z-50 rounded-xl border border-[#DAE0E5]/50 bg-white p-2 shadow-lg focus:outline-none"
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
            {filteredOptions.length === 0 ? (
              <div className="py-4 text-center text-sm text-secondary-copy">
                No countries found
              </div>
            ) : (
              <div role="listbox" className="rounded-lg" aria-label="Countries">
                <List<CountryRowProps>
                  listRef={listRef}
                  rowCount={filteredOptions.length}
                  rowHeight={ITEM_HEIGHT}
                  rowComponent={CountryRow}
                  rowProps={{
                    options: filteredOptions,
                    highlightIndex,
                    onSelect: handleSelect,
                    onHighlight: setHighlightIndex,
                  }}
                  style={{ height: LIST_HEIGHT, width: "100%" }}
                  overscanCount={5}
                />
              </div>
            )}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
