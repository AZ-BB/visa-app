"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface AdminSearchInputProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  "aria-label"?: string
}

export function AdminSearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className,
  "aria-label": ariaLabel = "Search",
}: AdminSearchInputProps) {
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="h-9 pl-9 pr-4"
      />
    </div>
  )
}
