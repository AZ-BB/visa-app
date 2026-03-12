"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CountryFlag } from "@/components/ui/country-flag";
import { StatusBadge } from "@/components/StatusBadge";
import { ApplicationsList } from "./ApplicationsList";
import { cn } from "@/lib/utils";

const STATUS_VALUES = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "REJECTED"] as const;

type AppItem = {
  id: string;
  status: string;
  total_fee?: number;
  amount_refunded_cents?: number;
  destination_country?: { id?: string; name?: string };
  visa_type?: { name?: string };
  turnaround_times?: { name?: string };
  travellers?: unknown[];
  created_at?: string;
};

interface ApplicationsFilterProps {
  applications: AppItem[];
}

export function ApplicationsFilter({ applications }: ApplicationsFilterProps) {
  const t = useTranslations("applications");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [destinationFilter, setDestinationFilter] = useState<string>("all");

  const uniqueDestinations = useMemo(() => {
    const seen = new Set<string>();
    const countries: { id: string; name: string }[] = [];
    for (const app of applications) {
      const c = app.destination_country;
      if (c?.id && c?.name && !seen.has(c.id)) {
        seen.add(c.id);
        countries.push({ id: c.id, name: c.name });
      }
    }
    return countries.sort((a, b) => a.name.localeCompare(b.name));
  }, [applications]);

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesStatus = !statusFilter || statusFilter === "all" || app.status === statusFilter;
      const matchesDestination =
        !destinationFilter ||
        destinationFilter === "all" ||
        app.destination_country?.id === destinationFilter;
      return matchesStatus && matchesDestination;
    });
  }, [applications, statusFilter, destinationFilter]);

  const hasNoFilterResults = applications.length > 0 && filteredApplications.length === 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="status-filter" className="text-sm font-medium text-secondary-copy shrink-0">
          {t("filterByStatus")}
        </label>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger
            id="status-filter"
            className={cn(
              "h-10 w-full min-w-[180px] max-w-[220px] rounded-xl px-4 text-sm",
              statusFilter === "all" && "text-secondary-copy"
            )}
            size="sm"
          >
            <SelectValue placeholder={t("filterAllStatuses")} />
          </SelectTrigger>
          <SelectContent align="start" isContentMenuFullWidth={false}>
            <SelectGroup>
              <SelectItem className="font-medium" value="all">
                {t("filterAllStatuses")}
              </SelectItem>
              {STATUS_VALUES.map((status) => (
                <SelectItem key={status} className="font-medium" value={status}>
                  <StatusBadge status={status} />
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {uniqueDestinations.length > 0 && (
          <>
            <label
              htmlFor="destination-filter"
              className="text-sm font-medium text-secondary-copy shrink-0"
            >
              {t("filterByDestination")}
            </label>
            <Select value={destinationFilter} onValueChange={setDestinationFilter}>
              <SelectTrigger
                id="destination-filter"
                className={cn(
                  "h-10 w-full min-w-[180px] max-w-[220px] rounded-xl px-4 text-sm",
                  destinationFilter === "all" && "text-secondary-copy"
                )}
                size="sm"
              >
                <SelectValue placeholder={t("filterAllDestinations")} />
              </SelectTrigger>
              <SelectContent align="start" isContentMenuFullWidth={false}>
                <SelectGroup>
                  <SelectItem className="font-medium" value="all">
                    {t("filterAllDestinations")}
                  </SelectItem>
                  {uniqueDestinations.map((c) => (
                    <SelectItem key={c.id} className="font-medium" value={c.id}>
                      <span className="flex items-center gap-2">
                        <CountryFlag code={c.id} className="size-5 shrink-0" loading="lazy" />
                        {c.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </>
        )}
      </div>
      {hasNoFilterResults ? (
        <div className="rounded-2xl border border-border-default/50 bg-white p-8 sm:p-12 text-center shadow-sm">
          <p className="text-secondary-copy text-lg">{t("noFilterResults")}</p>
        </div>
      ) : (
        <ApplicationsList applications={filteredApplications} />
      )}
    </div>
  );
}
