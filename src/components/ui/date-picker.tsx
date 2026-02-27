"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/** Parse YYYY-MM-DD as local date at noon. Noon avoids timezone boundary shifts. */
function parseLocalDate(dateString: string): Date {
  const [y, m, d] = dateString.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

/**
 * Normalize to local date at noon. Handles:
 * - Dates from parseISO("YYYY-MM-DD") which are UTC midnight (shows as previous day in western TZ)
 * - Any Date - extracts the intended calendar day in local time
 */
function toLocalDate(date: Date): Date {
  const isUtcMidnight =
    date.getUTCHours() === 0 &&
    date.getUTCMinutes() === 0 &&
    date.getUTCSeconds() === 0 &&
    date.getUTCMilliseconds() === 0;
  const y = isUtcMidnight ? date.getUTCFullYear() : date.getFullYear();
  const m = isUtcMidnight ? date.getUTCMonth() : date.getMonth();
  const d = isUtcMidnight ? date.getUTCDate() : date.getDate();
  return new Date(y, m, d, 12, 0, 0, 0);
}

interface DatePickerProps {
  value?: Date | string;
  onValueChange?: (date: Date | undefined) => void;
  placeholder?: string;
  id?: string;
  className?: string;
  disabled?: boolean;
  disableAfterToday?: boolean;
  disableBeforeToday?: boolean;
}

export function DatePicker({
  value,
  onValueChange,
  placeholder = "05 Sep 2025",
  id,
  className,
  disabled,
  disableAfterToday = false,
  disableBeforeToday = false,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

  const localDate =
    value === undefined
      ? undefined
      : typeof value === "string"
        ? /^\d{4}-\d{2}-\d{2}$/.test(value)
          ? parseLocalDate(value)
          : undefined
        : toLocalDate(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className={cn("relative cursor-pointer", className)}>
          <Input
            id={id}
            type="text"
            placeholder={placeholder}
            className="pr-12"
            value={localDate ? format(localDate, "dd MMM yyyy") : ""}
            readOnly
            disabled={disabled}
          />
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-secondary-copy">
            <CalendarIcon className="size-5" aria-hidden />
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0 border-border-default shadow-sm">
        <Calendar
          key={open ? "open" : "closed"}
          mode="single"
          selected={localDate}
          defaultMonth={localDate ?? new Date()}
          onSelect={(date) => {
            onValueChange?.(date ? toLocalDate(date) : undefined);
            setOpen(false);
          }}
          disableAfterToday={disableAfterToday}
          disableBeforeToday={disableBeforeToday}
        />
      </PopoverContent>
    </Popover>
  );
}
