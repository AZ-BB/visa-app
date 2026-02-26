"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface CountryTabsProps {
  currentView: "destination" | "nationality"
  countryId: string
}

export function CountryTabs({ currentView, countryId }: CountryTabsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const setView = (view: "destination" | "nationality") => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("view_as", view)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <Tabs
      value={currentView}
      onValueChange={(v) => setView(v as "destination" | "nationality")}
      className="w-full"
    >
      <TabsList className="bg-muted/10 py-[28px] px-1.5 gap-1">
        <TabsTrigger className="p-5 font-semibold" value="destination">Destination</TabsTrigger>
        <TabsTrigger className="p-5 font-semibold" value="nationality">Nationality</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
