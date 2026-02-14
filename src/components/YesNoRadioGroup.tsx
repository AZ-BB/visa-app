"use client";

import { cn } from "@/lib/utils";

interface YesNoRadioGroupProps {
    value: boolean | undefined;
    onChange: (value: boolean) => void;
    name?: string;
    disabled?: boolean;
    "aria-label"?: string;
    "aria-describedby"?: string;
    "aria-invalid"?: boolean;
    className?: string;
}

export function YesNoRadioGroup({
    value,
    onChange,
    name,
    disabled = false,
    "aria-label": ariaLabel = "Yes or No",
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    className,
}: YesNoRadioGroupProps) {
    return (
        <fieldset
            role="radiogroup"
            aria-label={ariaLabel}
            aria-describedby={ariaDescribedBy}
            aria-invalid={ariaInvalid}
            className={cn("flex gap-2", className)}
        >
            {([true, false] as const).map((option) => {
                const isSelected = value === option;
                return (
                    <label
                        key={String(option)}
                        className={cn(
                            "flex flex-1 group cursor-pointer items-center justify-between gap-2 rounded-[14px] bg-white px-4 py-3 text-base font-medium text-primary-copy transition-colors",
                            isSelected
                                ? "border-3 border-primary"
                                : "border-2 border-border-default/75 hover:border-primary/40",
                            disabled && "pointer-events-none opacity-50"
                        )}
                    >
                        <span>{option ? "Yes" : "No"}</span>
                        <div className={
                            cn("flex justify-center  items-center size-7 shrink-0 rounded-full transition-colors",
                                isSelected
                                    ? "border-3 border-primary"
                                    : "border-2 border-border-default/75 group-hover:border-primary/40"
                            )}>
                            <span
                                className={cn(
                                    "flex size-3.5 shrink-0 rounded-full transition-colors",
                                    isSelected
                                        ? "bg-primary"
                                        : "bg-transparent"
                                )}
                                aria-hidden
                            />
                        </div>
                        <input
                            type="radio"
                            name={name}
                            value={String(option)}
                            checked={isSelected}
                            onChange={() => onChange(option)}
                            disabled={disabled}
                            className="sr-only"
                        />
                    </label>
                );
            })}
        </fieldset>
    );
}