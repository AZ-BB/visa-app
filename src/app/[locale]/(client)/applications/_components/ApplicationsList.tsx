"use client";

import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { CountryFlag } from "@/components/ui/country-flag";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/StatusBadge";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { Link as I18nLink } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

function formatCreatedAt(dateStr: string | undefined) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

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

interface ApplicationsListProps {
  applications: AppItem[];
}

export function ApplicationsList({ applications }: ApplicationsListProps) {
  const { formatPriceFromUsd } = useCurrency();
  const t = useTranslations("applications");

  const destinationName = (app: AppItem) => app.destination_country?.name ?? "—";
  const destinationCountryCode = (app: AppItem) => app.destination_country?.id ?? null;
  const visaTypeName = (app: AppItem) => app.visa_type?.name ?? "—";
  const travellerCount = (app: AppItem) =>
    Array.isArray(app.travellers) ? app.travellers.length : 0;
  const turnaroundTimeName = (app: AppItem) => app.turnaround_times?.name ?? "—";
  const totalCost = (app: AppItem) => app.total_fee ?? 0;
  const amountRefundedCents = (app: AppItem) => app.amount_refunded_cents ?? 0;

  return (
    <div
      className={`grid gap-4 ${applications.length === 1 ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"}`}
    >
      {applications.map((app) => (
        <I18nLink
          key={app.id}
          href={`/applications/${app.id}`}
          className="block cursor-pointer"
        >
          <Card
            className="h-full rounded-2xl transition-colors border-2 hover:border-primary/40 hover:bg-primary/2 border-border-default/50 bg-white"
          >
            <CardHeader>
              {(() => {
                const code = destinationCountryCode(app);
                return (
                  <>
                    <div className="grid grid-cols-[auto_1fr] gap-x-3 items-start sm:hidden">
                      {code ? (
                        <div className="row-span-2 pt-2">
                          <CountryFlag
                            code={code}
                            className="size-15 shrink-0 rounded-md"
                            round={false}
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="row-span-2 w-0" />
                      )}
                      <h2 className="text-xl font-bold text-primary-copy line-clamp-2 min-w-0 pt-1">
                        {destinationName(app)} - {visaTypeName(app)}
                      </h2>
                      <div className="flex flex-col items-end gap-1">
                        <StatusBadge status={app.status} />
                        {amountRefundedCents(app) > 0 && (
                          <span className="text-xs font-medium text-orange-600">
                            {t("refunded")} {formatPriceFromUsd(amountRefundedCents(app) / 100)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="hidden sm:flex sm:items-start sm:justify-between sm:gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {code ? (
                          <CountryFlag
                            code={code}
                            className="h-14 w-14 shrink-0 rounded-md"
                            round={false}
                            loading="lazy"
                          />
                        ) : null}
                        <h2 className="text-2xl font-bold text-primary-copy line-clamp-2 min-w-0">
                          {destinationName(app)} - {visaTypeName(app)}
                        </h2>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <StatusBadge status={app.status} />
                        {amountRefundedCents(app) > 0 && (
                          <span className="text-xs font-medium text-orange-600">
                            {t("refunded")} {formatPriceFromUsd(amountRefundedCents(app) / 100)}
                          </span>
                        )}
                      </div>
                    </div>
                  </>
                );
              })()}
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <Separator className="mb-4" />
              <div className="flex justify-between items-center gap-4 text-base">
                <span className="text-secondary-copy shrink-0">{t("turnaroundTime")}</span>
                <span className="font-semibold text-primary-copy text-right truncate min-w-0">
                  {turnaroundTimeName(app)}
                </span>
              </div>
              <div className="flex justify-between items-center gap-4 text-base">
                <span className="text-secondary-copy shrink-0">{t("travellers")}</span>
                <span className="font-semibold text-primary-copy text-right truncate min-w-0">
                  {travellerCount(app)}
                </span>
              </div>
              <div className="flex justify-between items-center gap-4 text-base">
                <span className="text-secondary-copy shrink-0">{t("created")}</span>
                <span className="font-semibold text-primary-copy text-right truncate min-w-0">
                  {formatCreatedAt(app.created_at)}
                </span>
              </div>
              <div className="flex justify-between items-center gap-4 text-base">
                <span className="text-secondary-copy shrink-0">{t("cost")}</span>
                <span className="font-semibold text-primary-copy text-right truncate min-w-0">
                  {formatPriceFromUsd(totalCost(app))}
                </span>
              </div>
              {amountRefundedCents(app) > 0 && (
                <div className="flex justify-between items-center gap-4 text-base">
                  <span className="text-secondary-copy shrink-0">{t("refunded")}</span>
                  <span className="font-semibold text-orange-600 text-right truncate min-w-0">
                    {formatPriceFromUsd(amountRefundedCents(app) / 100)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </I18nLink>
      ))}
    </div>
  );
}
