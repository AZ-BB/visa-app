"use client";

import { ArrowLeft, ArrowRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useApplicationOrder } from "../ApplicationOrderContext";
import TipCard from "@/components/TipCard";
import ArrowButton from "@/components/ArrowButton";
import { getCountryNameFromCode } from "@/lib/contries-name";
import { Separator } from "@/components/ui/separator";
import InfoIcon from "@/components/svgs/info";

const TURNAROUND_LABELS: Record<string, string> = {
  standard: "Standard",
  fast: "Fast",
  superfast: "Super Fast",
};

function formatCost(value: number | null): string {
  if (value === null) return "£—";
  return `£${value.toFixed(2)}`;
}

interface Step5CheckoutProps {
  country?: string;
  visaType?: string;
  onBack?: () => void;
  onContinueToPayment?: () => void;
}

export function Step5Checkout({
  country,
  visaType,
  onBack,
  onContinueToPayment,
}: Step5CheckoutProps) {
  const { order } = useApplicationOrder();
  const { readyByDate, travellers, turnaroundTime, costs } = order;

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
          <strong>{readyByDate || "{date}"}</strong>. We&apos;ll make sure to
          contact you and let you know.
        </p>
      </TipCard>

      <div className="bg-white rounded-2xl p-5 border border-border-default shadow-sm">
        {/* Visa details summary */}
        <section className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h3 className="text-xl font-bold text-primary-copy">
              {countryName} {visaType}
            </h3>
            <span className="rounded-full text-primary bg-primary/5 px-3 py-1 text-base font-semibold">
              {TURNAROUND_LABELS[turnaroundTime] ?? turnaroundTime}
            </span>
          </div>


          <Separator className="my-4" />

          <dl className="space-y-2 text-primary-copy">
            <div className="flex justify-between gap-4">
              <dt className="text-secondary-copy">Valid for</dt>
              <dd className="font-semibold">3 months after issue</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-secondary-copy">Number of entries</dt>
              <dd className="font-semibold">Single entry</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-secondary-copy">Max stay</dt>
              <dd className="font-semibold">30 days per entry</dd>
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
            {travellers.map((t, i) => (
              <li key={i} className="flex justify-between items-center">
                <div className="text-secondary-copy">
                  Traveller #{i + 1}
                </div>
                <div className="font-semibold">
                  {[t.firstName, t.lastName].filter(Boolean).join(" ") || "—"}
                </div>
              </li>
            ))}
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
              <span className="text-secondary-copy">Visa fee</span>
              <span className="font-semibold">{formatCost(costs.visaFee)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-copy">Turnaround time</span>
              <span className="font-semibold">{formatCost(costs.turnaroundCost)}</span>
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
              <span className="text-xl font-bold text-primary-copy">{formatCost(costs.total)}</span>
            </div>
          </div>
        </section>

        <Separator className="my-4" />

        {/* Privacy link */}
        <p className="text-base text-primary-copy flex items-center gap-2">
          <InfoIcon className="inline-block size-5 fill-primary" aria-hidden />
          <a
            href="#"
            className="font-semibold underline underline-offset-2 hover:text-primary"
          >
            Find out more
          </a>{" "}
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
          <ArrowButton
            variant="default"
            className="text-base"
            onClick={onContinueToPayment}
          >
            Continue to payment
          </ArrowButton>
        )}
      </div>
    </div>
  );
}
