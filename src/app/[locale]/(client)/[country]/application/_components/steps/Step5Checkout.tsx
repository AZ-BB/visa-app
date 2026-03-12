"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { formatValidFor } from "@/lib/utils";
import { useApplicationOrder } from "../ApplicationOrderContext";
import type { TempTraveller } from "../ApplicationOrderContext";
import TipCard from "@/components/TipCard";
import { StepActionButtons } from "../StepActionButtons";
import { getCountryNameFromCode } from "@/lib/contries-name";
import { Separator } from "@/components/ui/separator";
import InfoIcon from "@/components/svgs/info";
import { checkEmailExists } from "@/actions/auth";
import { CheckoutAuthModal } from "../CheckoutAuthModal";
import { Link } from "@/i18n/navigation";
import type { Tables } from "@/database.types";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { useTranslations } from "next-intl";

const TURNAROUND_LABELS: Record<number, string> = {
  1: "Standard",
  2: "Fast",
  3: "Super Fast",
};

function formatCost(value: number | null): string {
  if (value === null) return "$—";
  return `$${value.toFixed(2)}`;
}

/** Get governmental fee: product override if set, else visaType default */
function getGovFee(
  traveller: TempTraveller,
  visaType: { gov_fee?: number } | null,
): number {
  const override = traveller.product?.gov_fee_override;
  if (override != null) return override;
  return visaType?.gov_fee ?? 0;
}

/** Get processing fee: product override if set, else visaType default */
function getProcessingFee(
  traveller: TempTraveller,
  visaType: { processing_fee?: number } | null,
): number {
  const override = traveller.product?.processing_fee_override;
  if (override != null) return override;
  return visaType?.processing_fee ?? 0;
}

interface Step5CheckoutProps {
  country: string;
  visaName: string;
  isAuthenticated: boolean;
  onBack?: () => void;
  onContinueToPayment?: () => void;
}

export function Step5Checkout({
  country,
  visaName,
  isAuthenticated,
  onBack,
  onContinueToPayment,
}: Step5CheckoutProps) {
  const { order, turnaroundTimes, visaType, handleCheckoutApplication } =
    useApplicationOrder();
  const { travellers, turnaround_time_id, destination_country } = order;
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [emailExists, setEmailExists] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated && order.contact_email) {
      checkEmailExists(order.contact_email).then((result) => {
        if ("exists" in result) {
          setEmailExists(result.exists);
        } else {
          setEmailExists(false);
        }
      });
    }
  }, [isAuthenticated, order.contact_email]);

  const selectedTurnaround = turnaroundTimes.find(
    (tt) => tt.id === turnaround_time_id,
  );
  const turnaroundHours =
    (selectedTurnaround as { turnaround_time_hours?: number } | undefined)
      ?.turnaround_time_hours ?? 24;

  // Fee breakdown: per-traveller gov + processing, plus turnaround fee
  const visaTypeWithFees = visaType as Tables<"visa_types"> | null;
  const travellerFees = useMemo(
    () =>
      travellers.map((t) => ({
        govFee: getGovFee(t, visaTypeWithFees),
        processingFee: getProcessingFee(t, visaTypeWithFees),
        subtotal:
          getGovFee(t, visaTypeWithFees) +
          getProcessingFee(t, visaTypeWithFees),
      })),
    [travellers, visaTypeWithFees],
  );

  const turnaroundFee =
    (selectedTurnaround as { fee?: number } | undefined)?.fee ?? 0;
  const travellersSubtotal = travellerFees.reduce(
    (sum, f) => sum + f.subtotal,
    0,
  );
  const totalAmount = travellersSubtotal + turnaroundFee;

  const readyByDate = (() => {
    const ready = new Date();
    ready.setTime(ready.getTime() + turnaroundHours * 60 * 60 * 1000);
    return ready.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  })();
  const redirectUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  const handleContinueClick = async () => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }
    setCheckoutError(null);
    setIsSubmitting(true);

    const result = await handleCheckoutApplication();
    setIsSubmitting(false);

    if (result.status && result.data) {
      localStorage.removeItem("visa-application-order");
      const applicationId = result.data;
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId }),
      });

      const data = (await res.json()) as { url?: string; error?: string };
      setIsSubmitting(false);

      if (!res.ok || !data.url) {
        setCheckoutError(data.error ?? tErrors("checkoutSession"));
        return;
      }

      onContinueToPayment?.();
      window.location.href = data.url;
    } else {
      setCheckoutError(result.error ?? tErrors("createApplication"));
      return;
    }
  };

  const t = useTranslations("application.step5");
  const tApply = useTranslations("apply");
  const tErrors = useTranslations("application.errors");
  const countryName = getCountryNameFromCode(country || "");
  const { formatPriceFromUsd } = useCurrency();
  return (
    <div className="max-w-2xl mx-auto space-y-5 min-h-screen">
      <h2 className="text-2xl font-bold text-primary-copy">{t("title")}</h2>

      {/* Application readiness */}
      <TipCard>
        <p className="text-base">
          {t("readyBy", { date: readyByDate, hours: turnaroundHours })}
        </p>
      </TipCard>

      <div className="bg-white rounded-2xl p-5 border border-border-default shadow-sm">
        {/* Visa details summary */}
        <section className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h3 className="text-xl font-bold text-primary-copy">
              {countryName} {visaName}
            </h3>
            <span className="rounded-full text-primary bg-primary/5 px-3 py-1 text-base font-semibold">
              {turnaroundTimes.find((tt) => tt.id === turnaround_time_id)
                ?.name ?? "—"}
            </span>
          </div>

          <Separator className="my-4" />

          <dl className="space-y-2 text-primary-copy">
            <div className="flex justify-between gap-4">
              <dt className="text-secondary-copy">{tApply("validFor")}</dt>
              <dd className="font-semibold">
                {formatValidFor(visaType?.valid_for)} {tApply("afterIssue")}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-secondary-copy">{tApply("numberOfEntries")}</dt>
              <dd className="font-semibold">
                {(visaType?.number_of_entries === -1 ? tApply("multiple") : visaType?.number_of_entries) ?? "—"} {t("entries")}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-secondary-copy">{tApply("maxStay")}</dt>
              <dd className="font-semibold">
                {visaType?.max_stay ?? "—"} {tApply("daysPerEntry")}
              </dd>
            </div>
          </dl>
        </section>

        <Separator className="my-4" />

        {/* Travellers */}
        <section className="mb-8">
          <h3 className="text-xl font-bold text-primary-copy mb-3">
            {t("travellers")}
          </h3>
          <ul className="space-y-2 text-primary-copy">
            {travellers.map((tr, i) => {
              const fees = travellerFees[i];
              return (
                <li key={i}>
                  <div className="flex justify-between items-center">
                    <div className="text-secondary-copy">
                      {t("travellerNum", { num: i + 1 })}
                    </div>
                    <div className="font-semibold">
                      {[tr.first_name, tr.last_name].filter(Boolean).join(" ") ||
                        "—"}
                    </div>
                  </div>
                  <div className="space-y-2 mt-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-secondary-copy">
                        {t("governmentalFee")}
                      </span>
                      <span className="font-semibold">
                        {formatPriceFromUsd(fees?.govFee ?? 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-copy">
                        {t("processingFee")}
                      </span>
                      <span className="font-semibold">
                        {formatPriceFromUsd(fees?.processingFee ?? 0)}
                      </span>
                    </div>
                  </div>
                  {i < travellers.length - 1 && <Separator className="my-4" key={`sep-${i}`} />}
                </li>
              );
            })}
          </ul>
        </section>

        <Separator className="my-4" />

        {/* Additional costs */}
        <section className="mb-8">
          <h3 className="text-xl font-bold text-primary-copy mb-4">
            {t("additionalCosts")}
          </h3>
          <div className="space-y-2 text-primary-copy">
            <div className="flex justify-between">
              <span className="text-secondary-copy">{t("turnaroundTime")}</span>
              <span className="font-semibold">{formatPriceFromUsd(turnaroundFee)}</span>
            </div>
          </div>
          <div className="mt-4 pt-4">
            <div className="flex justify-between items-baseline">
              <div>
                <p className="font-semibold text-primary-copy">{t("total")}</p>
                <p className="text-sm text-secondary-copy">
                  {t("includingTaxes")}
                </p>
              </div>
              <span className="text-xl font-bold text-primary-copy">
                {formatPriceFromUsd(totalAmount)}
              </span>
            </div>
          </div>
        </section>

        <Separator className="my-4" />

        {/* Privacy link */}
        <p className="text-base text-primary-copy flex items-center gap-2">
          <InfoIcon
            className="inline-block size-5 fill-primary"
            aria-hidden
          />
          <Link
            href="/terms"
            className="font-semibold underline underline-offset-2 hover:text-primary"
          >
            {t("findOutMore")}
          </Link>{" "}
          {t("privacyTip")}
        </p>
      </div>

      <StepActionButtons
        onBack={onBack}
        primaryLabel={t("continueToPayment")}
        primaryOnClick={onContinueToPayment ? handleContinueClick : undefined}
        primaryLoading={isSubmitting}
        errorMessage={checkoutError}
      />

      {!isAuthenticated && (
        <CheckoutAuthModal
          open={authModalOpen}
          onOpenChange={setAuthModalOpen}
          order={order}
          redirectUrl={redirectUrl}
          emailExists={emailExists}
        />
      )}
    </div>
  );
}
