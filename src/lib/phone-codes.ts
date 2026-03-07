import { customArray } from "country-codes-list";

const allCodes = customArray(
  {
    code: "+{countryCallingCode}",
    label: "{countryNameEn} (+{countryCallingCode})",
    countryCode: "{countryCode}",
  },
  {
    sortDataBy: "countryNameEn",
    filter: (c) => !!c.countryCallingCode?.trim(),
  }
) as { code: string; label: string; countryCode: string }[];

const seenCodes = new Set<string>();
export const PHONE_DIAL_CODES = allCodes.filter((item) => {
  if (seenCodes.has(item.code)) {
    return false;
  }
  seenCodes.add(item.code);
  return true;
});
