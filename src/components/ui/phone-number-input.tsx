"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PHONE_DIAL_CODES } from "@/lib/phone-codes";
import { CountryFlag } from "@/components/ui/country-flag";

interface PhoneNumberInputProps {
  disabled?: boolean;
  defaultExtension?: string;
  defaultPhone?: string;
}

export function PhoneNumberInput({
  disabled = false,
  defaultExtension,
  defaultPhone,
}: PhoneNumberInputProps) {
  const [selectedExtension, setSelectedExtension] = useState(
    defaultExtension || PHONE_DIAL_CODES[0]?.code || "+1"
  );
  const [phoneInput, setPhoneInput] = useState(defaultPhone || "");

  useEffect(() => {
    if (phoneInput.startsWith("+")) {
      for (let i = phoneInput.length; i >= 2; i--) {
        const prefix = phoneInput.substring(0, i);
        const match = PHONE_DIAL_CODES.find((c) => c.code === prefix);
        if (match) {
          setSelectedExtension(match.code);
          setPhoneInput(phoneInput.substring(i));
          break;
        }
      }
    }
  }, [phoneInput]);

  const selectedCountry = PHONE_DIAL_CODES.find(
    (c) => c.code === selectedExtension
  );

  return (
    <div className="flex gap-2">
      <input type="hidden" name="phoneExtension" value={selectedExtension} />
      <Select
        value={selectedExtension}
        onValueChange={setSelectedExtension}
        disabled={disabled}
      >
        <SelectTrigger
          className="w-[140px] shrink-0 px-4 py-3.5 text-base rounded-xl"
          size="sm"
        >
          <SelectValue>
            {selectedCountry && (
              <>
                <CountryFlag
                  code={selectedCountry.countryCode}
                  className="w-5 h-5"
                />
                <span>{selectedCountry.code}</span>
              </>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[300px]" isContentMenuFullWidth={false} enableSearch={true}>
          {PHONE_DIAL_CODES.map(({ code, label, countryCode }, index) => (
            <SelectItem key={`${countryCode}-${index}`} value={code}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="tel"
        id="phone"
        name="phone"
        value={phoneInput}
        onChange={(e) => setPhoneInput(e.target.value)}
        placeholder="Enter your phone number"
        disabled={disabled}
        className="px-4 py-3.5 text-base rounded-xl flex-1"
      />
    </div>
  );
}
