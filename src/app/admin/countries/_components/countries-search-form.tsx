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
    const queryString = params.toString()
    router.push(queryString ? `/admin/countries?${queryString}` : "/admin/countries")
  }, [value, router, searchParams])

  return (
    <form
      className={cn("flex flex-col gap-3 sm:flex-row sm:items-center", className)}
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
    >
      <div className="relative flex-1 sm:max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search by name or code..."
          aria-label="Search countries"
          className="h-10 rounded-lg border-slate-200 bg-white pl-9 shadow-sm transition focus-visible:border-primary/60 focus-visible:ring-primary/20"
        />
      </div>
      <Button
        type="submit"
        className="h-10 rounded-lg bg-slate-900 px-4 text-white shadow-sm transition hover:bg-slate-800"
      >
        Search
      </Button>
      {value ? (
        <Button
          type="button"
          variant="ghost"
          className="h-10 rounded-lg px-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          onClick={() => {
            setValue("")
            const params = new URLSearchParams(searchParams.toString())
            params.delete("search")
            const queryString = params.toString()
            router.push(queryString ? `/admin/countries?${queryString}` : "/admin/countries")
          }}
        >
          Clear
        </Button>
      ) : null}
    </form>
  )
}
