"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
] as const;

export function FooterLanguage() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (value: string) => {
    router.replace(pathname, { locale: value });
  };

  return (
    <Select value={locale} onValueChange={handleChange}>
      <SelectTrigger className="h-auto min-h-0 w-auto min-w-0 gap-1.5 rounded-none border-0 bg-transparent px-0 py-0 shadow-none hover:bg-transparent focus:ring-0 text-sm font-normal text-white [&_svg]:text-white">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-64 w-64 min-w-64 text-xs" isContentMenuFullWidth={false}>
        {LANGUAGES.map((lang) => (
          <SelectItem key={lang.code} value={lang.code} className="py-1.5">
            {lang.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
