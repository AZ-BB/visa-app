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

interface DatePickerProps {
  value?: Date;
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className={cn("relative cursor-pointer", className)}>
          <Input
            id={id}
            type="text"
            placeholder={placeholder}
            className="pr-12"
            value={value ? format(value, "dd MMM yyyy") : ""}
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
          mode="single"
          selected={value}
          onSelect={(date) => {
            onValueChange?.(date);
            setOpen(false);
          }}
          disableAfterToday={disableAfterToday}
          disableBeforeToday={disableBeforeToday}
        />
      </PopoverContent>
    </Popover>
  );
}
