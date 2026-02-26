"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Globe, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

interface CountryTabsProps {
  currentView: "destination" | "nationality"
  countryId: string
}

const tabs = [
  { value: "destination" as const, label: "As Destination", icon: MapPin },
  { value: "nationality" as const, label: "As Nationality", icon: Globe },
]

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
    <div className="flex items-center gap-1 border-b border-border-default">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = currentView === tab.value
        return (
          <button
            key={tab.value}
            onClick={() => setView(tab.value)}
            className={cn(
              "relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors",
              "hover:text-primary",
              isActive
                ? "text-primary"
                : "text-secondary-copy"
            )}
          >
            <Icon className="size-4" />
            {tab.label}
            {isActive && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />
            )}
          </button>
        )
      })}
    </div>
  )
}
