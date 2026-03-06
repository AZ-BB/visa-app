"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn, formatValidFor } from "@/lib/utils";
import { useApplicationOrder } from "../ApplicationOrderContext";
import type { TempTraveller } from "../ApplicationOrderContext";
import TipCard from "@/components/TipCard";
import ArrowButton from "@/components/ArrowButton";
import { getCountryNameFromCode } from "@/lib/contries-name";
import { Separator } from "@/components/ui/separator";
import InfoIcon from "@/components/svgs/info";
import { checkEmailExists } from "@/actions/auth";
import { CheckoutAuthModal } from "../CheckoutAuthModal";
import Link from "next/link";
import type { Tables } from "@/database.types";

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
function getGovFee(traveller: TempTraveller, visaType: { gov_fee?: number } | null): number {
  const override = traveller.product?.gov_fee_override;
  if (override != null) return override;
  return visaType?.gov_fee ?? 0;
}

/** Get processing fee: product override if set, else visaType default */
function getProcessingFee(traveller: TempTraveller, visaType: { processing_fee?: number } | null): number {
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
  onContinueToPayment
}: Step5CheckoutProps) {
  const { order, turnaroundTimes, visaType, handleCheckoutApplication } = useApplicationOrder();
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

  const selectedTurnaround = turnaroundTimes.find((tt) => tt.id === turnaround_time_id);
  const turnaroundHours = (selectedTurnaround as { turnaround_time_hours?: number } | undefined)?.turnaround_time_hours ?? 24;

  // Fee breakdown: per-traveller gov + processing, plus turnaround fee
  const visaTypeWithFees = visaType as Tables<"visa_types"> | null;
  const travellerFees = useMemo(() => travellers.map((t) => ({
    govFee: getGovFee(t, visaTypeWithFees),
    processingFee: getProcessingFee(t, visaTypeWithFees),
    subtotal: getGovFee(t, visaTypeWithFees) + getProcessingFee(t, visaTypeWithFees),
  })), [travellers, visaTypeWithFees]);

  const turnaroundFee = (selectedTurnaround as { fee?: number } | undefined)?.fee ?? 0;
  const travellersSubtotal = travellerFees.reduce((sum, f) => sum + f.subtotal, 0);
  const totalAmount = travellersSubtotal + turnaroundFee;

  const readyByDate = (() => {
    const ready = new Date();
    ready.setTime(ready.getTime() + turnaroundHours * 60 * 60 * 1000);
    return ready.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
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
    if (!result.status || !result.data) {
      setIsSubmitting(false);
      setCheckoutError(result.error ?? "Failed to create application");
      return;
    }

    const applicationId = result.data;
    const res = await fetch("/api/stripe/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId }),
    });

    const data = (await res.json()) as { url?: string; error?: string };
    setIsSubmitting(false);

    if (!res.ok || !data.url) {
      setCheckoutError(data.error ?? "Failed to create checkout session");
      return;
    }

    onContinueToPayment?.();
    window.location.href = data.url;
  };

  const countryName = getCountryNameFromCode(country || "");

  return (
    <div className="max-w-2xl mx-auto space-y-5 min-h-screen">
      <h2 className="text-2xl font-bold text-primary-copy">
        Checkout
      </h2>

      {/* Application readiness */}
      <TipCard>
        <p className="text-base">
          Your application will be ready by the{" "}
          <strong>{readyByDate}</strong>{" "}
          <span className="text-secondary-copy">(in {turnaroundHours} hours)</span>. We&apos;ll make sure to
          contact you and let you know.
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
              {turnaroundTimes.find((tt) => tt.id === turnaround_time_id)?.name ?? "—"}
            </span>
          </div>

          <Separator className="my-4" />

          <dl className="space-y-2 text-primary-copy">
            <div className="flex justify-between gap-4">
              <dt className="text-secondary-copy">Valid for</dt>
              <dd className="font-semibold">{formatValidFor(visaType?.valid_for)} after issue</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-secondary-copy">Number of entries</dt>
              <dd className="font-semibold">{visaType?.number_of_entries ?? "—"} entries</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-secondary-copy">Max stay</dt>
              <dd className="font-semibold">{visaType?.max_stay ?? "—"} days per entry</dd>
            </div>
          </dl>
        </section>

        <Separator className="my-4" />

        {/* Travellers */}
        <section className="mb-8">
          <h3 className="text-xl font-bold text-primary-copy mb-3">
            Travellers
          </h3>
          <ul className="space-y-2 text-primary-copy">
            {travellers.map((t, i) => {
              const fees = travellerFees[i];
              return (
                <li key={i}>
                  <div className="flex justify-between items-center">
                    <div className="text-secondary-copy">
                      Traveller #{i + 1}
                    </div>
                    <div className="font-semibold">
                      {[t.first_name, t.last_name].filter(Boolean).join(" ") || "—"}
                    </div>
                  </div>
                  <div className="space-y-2 mt-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-secondary-copy">Governmental Fee</span>
                      <span className="font-semibold">{formatCost(fees?.govFee ?? 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-copy">Processing Fee</span>
                      <span className="font-semibold">{formatCost(fees?.processingFee ?? 0)}</span>
                    </div>
                  </div>
                  {i < travellers.length - 1 && <Separator className="my-4" />}
                </li>
              );
            })}
          </ul>
        </section>

        <Separator className="my-4" />

        {/* Additional costs */}
        <section className="mb-8">
          <h3 className="text-xl font-bold text-primary-copy mb-4">
            Additional costs
          </h3>
          <div className="space-y-2 text-primary-copy">
            <div className="flex justify-between">
              <span className="text-secondary-copy">Turnaround time</span>
              <span className="font-semibold">{formatCost(turnaroundFee)}</span>
            </div>
          </div>
          <div className="mt-4 pt-4">
            <div className="flex justify-between items-baseline">
              <div>
                <p className="font-semibold text-primary-copy">Total</p>
                <p className="text-sm text-secondary-copy">
                  Including taxes & fees
                </p>
              </div>
              <span className="text-xl font-bold text-primary-copy">{formatCost(totalAmount)}</span>
            </div>
          </div>
        </section>

        <Separator className="my-4" />

        {/* Privacy link */}
        <p className="text-base text-primary-copy flex items-center gap-2">
          <InfoIcon className="inline-block size-5 fill-primary" aria-hidden />
          <Link
            href="/terms"
            className="font-semibold underline underline-offset-2 hover:text-primary"
          >
            Find out more
          </Link>{" "}
          about how we keep your information safe.
        </p>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className={cn(
              "inline-flex items-center gap-2 text-primary font-semibold",
              "hover:text-primary-dark transition-colors"
            )}
          >
            <ArrowLeft className="size-5" aria-hidden />
            Previous step
          </button>
        ) : (
          <span />
        )}
        {onContinueToPayment && (
          <div className="flex flex-col items-end gap-2">
            {checkoutError && (
              <p className="text-sm text-red-600">{checkoutError}</p>
            )}
            <ArrowButton
              variant="default"
              className="text-base"
              onClick={handleContinueClick}
              isLoading={isSubmitting}
            >
              Continue to payment
            </ArrowButton>
          </div>
        )}
      </div>

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
