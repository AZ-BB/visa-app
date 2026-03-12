"use client";

import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CountryFlag } from "@/components/ui/country-flag";
import { StatusBadge } from "@/components/StatusBadge";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { useTranslations } from "next-intl";
import { getCountryNameFromCode } from "@/lib/contries-name";

type ApplicationWithRelations = {
  id: string;
  status: string;
  total_fee: number;
  contact_email: string;
  arrival_date: string;
  amount_refunded_cents?: number;
  destination_country?: { id?: string; name?: string };
  visa_type?: { id?: number; name?: string };
  turnaround_times?: { name?: string };
  turnaround_fee?: number;
  travellers?: Array<{
    first_name: string;
    last_name: string;
    date_of_birth: string;
    nationality: string;
    country_of_birth: string;
    country_of_residence: string;
    passport_number: string;
    passport_expiry_date: string;
    gov_fee?: number;
    processing_fee?: number;
  }>;
};

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

interface ApplicationDetailContentProps {
  application: ApplicationWithRelations;
  showPaymentSuccess: boolean;
}

export function ApplicationDetailContent({
  application,
  showPaymentSuccess,
}: ApplicationDetailContentProps) {
  const { formatPriceFromUsd } = useCurrency();
  const t = useTranslations("applications");
  const tDetail = useTranslations("applications.detail");

  const destinationName = application?.destination_country?.name ?? "—";
  const destinationCountryCode = application?.destination_country?.id ?? null;
  const visaTypeName = application?.visa_type?.name ?? "—";
  const turnaroundTimeName = application?.turnaround_times?.name ?? "—";
  const totalCost = application?.total_fee ?? 0;
  const turnaroundFee = application?.turnaround_fee ?? 0;
  const travellers = application?.travellers ?? [];
  const amountRefundedCents = application?.amount_refunded_cents ?? 0;

  return (
    <div className="min-h-screen bg-bg-light-grey pt-6 sm:pt-12 pb-12 px-4 sm:px-6">
      {showPaymentSuccess && (
        <div className="max-w-3xl mx-auto mb-6 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-green-800">
          {tDetail("paymentSuccess")}
        </div>
      )}
      <div className="max-w-3xl mx-auto">
        <Link
          href="/applications"
          className="inline-flex items-center gap-2 text-primary-copy hover:text-primary font-medium mb-6 sm:mb-8 transition-colors"
        >
          <ArrowLeft className="size-5" aria-hidden />
          {t("backToApplications")}
        </Link>

        <div className="space-y-6">
          <Card className="rounded-2xl border-2 border-border-default/50 bg-white">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {destinationCountryCode && (
                    <CountryFlag
                      code={destinationCountryCode}
                      className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 rounded-md"
                      round={false}
                    />
                  )}
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-primary-copy">
                      {destinationName} - {visaTypeName}
                    </h1>
                  </div>
                </div>
                <StatusBadge status={application.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-secondary-copy text-sm">
                    {tDetail("contactEmail")}
                  </p>
                  <p className="font-semibold text-primary-copy">
                    {application.contact_email}
                  </p>
                </div>
                <div>
                  <p className="text-secondary-copy text-sm">
                    {tDetail("arrivalDate")}
                  </p>
                  <p className="font-semibold text-primary-copy">
                    {formatDate(application.arrival_date)}
                  </p>
                </div>
                <div>
                  <p className="text-secondary-copy text-sm">
                    {t("turnaroundTime")}
                  </p>
                  <p className="font-semibold text-primary-copy">
                    {turnaroundTimeName}
                  </p>
                </div>
                <div>
                  <p className="text-secondary-copy text-sm">
                    {tDetail("totalCost")}
                  </p>
                  <p className="font-semibold text-primary-copy">
                    {formatPriceFromUsd(totalCost)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-2 border-border-default/50 bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-bold">
                {tDetail("invoice")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              {travellers.map((traveller, index) => {
                const govFee = traveller.gov_fee ?? 0;
                const proFee = traveller.processing_fee ?? 0;
                const travellerTotal = govFee + proFee;
                return (
                  <div key={index} className="space-y-2">
                    <h3 className="font-semibold text-primary-copy">
                      {traveller.first_name} {traveller.last_name}
                    </h3>
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary-copy">
                        {tDetail("govFee")}
                      </span>
                      <span className="font-semibold text-primary-copy">
                        {formatPriceFromUsd(govFee)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary-copy">
                        {tDetail("proFee")}
                      </span>
                      <span className="font-semibold text-primary-copy">
                        {formatPriceFromUsd(proFee)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm pt-1 border-t border-border-default/50">
                      <span className="text-secondary-copy">
                        {tDetail("subtotal")}
                      </span>
                      <span className="font-semibold text-primary-copy">
                        {formatPriceFromUsd(travellerTotal)}
                      </span>
                    </div>
                  </div>
                );
              })}
              {turnaroundFee !== 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-primary-copy">
                    {tDetail("additionalCost")}
                  </h3>
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-copy">
                      {tDetail("turnaround")}
                    </span>
                    <span className="font-semibold text-primary-copy">
                      {formatPriceFromUsd(turnaroundFee)}
                    </span>
                  </div>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t-2 border-border-default">
                <span className="text-lg font-bold text-primary-copy">
                  {tDetail("total")}
                </span>
                <span className="text-lg font-bold text-primary-copy">
                  {formatPriceFromUsd(totalCost)}
                </span>
              </div>
              {amountRefundedCents > 0 && (
                <>
                  <div className="flex justify-between items-center pt-2 text-orange-600">
                    <span className="font-semibold text-primary-copy">
                      {t("refunded")}
                    </span>
                    <span className="font-semibold">
                      -{formatPriceFromUsd(amountRefundedCents / 100)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1 text-sm">
                    <span className="text-secondary-copy">
                      {tDetail("netAmount")}
                    </span>
                    <span className="font-semibold text-primary-copy">
                      {formatPriceFromUsd(
                        totalCost - amountRefundedCents / 100
                      )}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-2 border-border-default/50 bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-bold">
                {tDetail("travellersCount", { count: travellers.length })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 pt-0">
              {travellers.map((traveller, index) => (
                <div
                  key={index}
                  className={
                    index > 0
                      ? "space-y-3 pt-6 border-t border-border-default/50"
                      : "space-y-3"
                  }
                >
                  <h3 className="font-semibold text-primary-copy text-lg">
                    {traveller.first_name} {traveller.last_name}
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2 text-sm">
                    <div className="space-y-3">
                      <div>
                        <p className="text-secondary-copy text-xs">
                          {tDetail("passportNumber")}
                        </p>
                        <p className="font-semibold text-primary-copy font-mono">
                          {traveller.passport_number}
                        </p>
                      </div>
                      <div>
                        <p className="text-secondary-copy text-xs">
                          {tDetail("passportExpiry")}
                        </p>
                        <p className="font-semibold text-primary-copy">
                          {formatDate(traveller.passport_expiry_date)}
                        </p>
                      </div>
                      <div>
                        <p className="text-secondary-copy text-xs">
                          {tDetail("dateOfBirth")}
                        </p>
                        <p className="font-semibold text-primary-copy">
                          {formatDate(traveller.date_of_birth)}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <CountryFlag
                          code={traveller.nationality}
                          className="h-6 w-6 shrink-0 rounded-md"
                          round={false}
                        />
                        <div>
                          <p className="text-secondary-copy text-xs">
                            {tDetail("nationality")}
                          </p>
                          <p className="font-semibold text-primary-copy">
                            {getCountryNameFromCode(traveller.nationality)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <CountryFlag
                          code={traveller.country_of_birth}
                          className="h-6 w-6 shrink-0 rounded-md"
                          round={false}
                        />
                        <div>
                          <p className="text-secondary-copy text-xs">
                            {tDetail("countryOfBirth")}
                          </p>
                          <p className="font-semibold text-primary-copy">
                            {getCountryNameFromCode(traveller.country_of_birth)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <CountryFlag
                          code={traveller.country_of_residence}
                          className="h-6 w-6 shrink-0 rounded-md"
                          round={false}
                        />
                        <div>
                          <p className="text-secondary-copy text-xs">
                            {tDetail("countryOfResidence")}
                          </p>
                          <p className="font-semibold text-primary-copy">
                            {getCountryNameFromCode(
                              traveller.country_of_residence
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
