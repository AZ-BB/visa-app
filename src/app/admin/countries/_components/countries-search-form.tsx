"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CountriesSearchFormProps {
  defaultValue?: string
  className?: string
}

export function CountriesSearchForm({
  defaultValue = "",
  className,
}: CountriesSearchFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(defaultValue)

  const submit = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (value.trim()) {
      params.set("search", value.trim())
    } else {
      params.delete("search")
    }
    router.push(`/admin/countries?${params.toString()}`)
  }, [value, router, searchParams])

  return (
    <form
      className={cn("flex gap-2", className)}
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
    >
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search by name or code..."
          aria-label="Search countries"
          className="h-9 pl-9"
        />
      </div>
      <Button type="submit" size="sm">
        Search
      </Button>
    </form>
  )
}
