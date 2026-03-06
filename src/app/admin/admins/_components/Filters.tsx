"use client"

import { usePathname, useSearchParams, useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCallback, useEffect, useRef, useState, useTransition } from "react"

const DEBOUNCE_MS = 100

export default function Filters() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [, startTransition] = useTransition()

  const search = searchParams.get("search") ?? ""
  const role = searchParams.get("role") ?? ""
  const [searchValue, setSearchValue] = useState(search)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    setSearchValue(search)
  }, [search])

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString())
        Object.entries(updates).forEach(([key, value]) => {
          if (value) {
            params.set(key, value)
          } else {
            params.delete(key)
          }
        })
        params.set("page", "1")
        router.push(`${pathname}?${params.toString()}`)
      })
    },
    [pathname, router, searchParams]
  )

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const trimmed = searchValue.trim()
      if (trimmed !== search) {
        updateParams({ search: trimmed })
      }
      debounceRef.current = undefined
    }, DEBOUNCE_MS)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchValue, search, updateParams])

  const handleRoleChange = (value: string) => {
    updateParams({ role: value })
  }

  return (
    <div className="flex flex-1 flex-wrap items-center gap-3 font-medium">
      <div className="relative sm:min-w-[400px] max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search"
          aria-label="Search admins"
          className="h-10 pl-9 rounded-lg"
        />
      </div>

      <Select
        value={role || "all"}
        onValueChange={(v) => handleRoleChange(v === "all" ? "" : v)}
      >
        <SelectTrigger className="h-9 w-[140px] rounded-lg shadow-none" size="sm">
          <SelectValue placeholder="All roles" />
        </SelectTrigger>
        <SelectContent align="start">
          <SelectGroup>
            <SelectItem className="font-medium" value="all">All roles</SelectItem>
            <SelectItem className="font-medium" value="ADMIN">Admin</SelectItem>
            <SelectItem className="font-medium" value="SUPER_ADMIN">Super Admin</SelectItem>
            <SelectItem className="font-medium" value="SUPERVISOR">Supervisor</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
