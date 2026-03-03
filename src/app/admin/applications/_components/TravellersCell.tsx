"use client"

import { CountryFlag } from "@/components/ui/country-flag"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"

interface Traveller {
  first_name: string
  last_name: string
  nationality: string
}

interface TravellersCellProps {
  travellers: Traveller[]
}

export function TravellersCell({ travellers }: TravellersCellProps) {
  const uniqueNationalities = [...new Set(travellers.map((t) => t.nationality))]

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <div className="cursor-pointer">
          <div className="text-sm font-medium text-primary-copy">
            {travellers.length} traveller{travellers.length !== 1 ? "s" : ""}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-0.5">
            {uniqueNationalities.slice(0, 3).map((code) => (
              <CountryFlag key={code} code={code} className="size-5" loading="lazy" />
            ))}
            {uniqueNationalities.length > 3 && (
              <span className="text-xs font-semibold text-muted-foreground">(+{uniqueNationalities.length - 3})</span>
            )}
          </div>
        </div>
      </HoverCardTrigger>
      <HoverCardContent align="start" className="w-56">
        <ul className="space-y-2 text-sm">
          {travellers.map((t, i) => (
            <li key={i} className="flex items-center gap-2">
              <CountryFlag code={t.nationality} className="size-4 shrink-0" loading="lazy" />
              <span className="text-primary-copy">
                {t.first_name} {t.last_name}
              </span>
            </li>
          ))}
        </ul>
      </HoverCardContent>
    </HoverCard>
  )
}
