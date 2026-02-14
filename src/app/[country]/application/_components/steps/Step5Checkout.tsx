"use client";

import { ArrowLeft, ArrowRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useApplicationOrder } from "../ApplicationOrderContext";

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
  country = "United States",
  visaType = "Tourist eVisa",
  onBack,
  onContinueToPayment,
}: Step5CheckoutProps) {
  const { order } = useApplicationOrder();
  const { readyByDate, travellers, turnaroundTime, costs } = order;

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-primary-copy mb-6">
        Checkout
      </h2>

      {/* Application readiness */}
      <div
        className={cn(
          "mb-8 flex gap-3 rounded-xl border-2 border-primary/30",
          "bg-primary/5 px-4 py-4"
        )}
      >
        <Info className="size-5 shrink-0 text-primary mt-0.5" aria-hidden />
        <p className="text-sm text-primary-copy">
          Your application will be ready by the{" "}
          <strong>{readyByDate || "—"}</strong>. We&apos;ll make sure to
          contact you and let you know.
        </p>
      </div>

      {/* Visa details summary */}
      <section className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h3 className="text-xl font-bold text-primary-copy">
            {country} {visaType}
          </h3>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-secondary-copy">
            {TURNAROUND_LABELS[turnaroundTime] ?? turnaroundTime}
          </span>
        </div>
        <dl className="space-y-2 text-primary-copy">
          <div className="flex justify-between gap-4">
            <dt className="text-secondary-copy">Valid for</dt>
            <dd className="font-medium">3 months after issue</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-secondary-copy">Number of entries</dt>
            <dd className="font-medium">Single entry</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-secondary-copy">Max stay</dt>
            <dd className="font-medium">30 days per entry</dd>
          </div>
        </dl>
      </section>

      {/* Travellers */}
      <section className="mb-8">
        <h3 className="text-xl font-bold text-primary-copy mb-3">
          Travellers
        </h3>
        <ul className="space-y-2 text-primary-copy">
          {travellers.map((t, i) => (
            <li key={i}>
              Traveller #{i + 1}: {[t.firstName, t.lastName].filter(Boolean).join(" ") || "—"}
            </li>
          ))}
        </ul>
      </section>

      {/* Additional costs */}
      <section className="mb-8">
        <h3 className="text-xl font-bold text-primary-copy mb-4">
          Additional costs
        </h3>
        <div className="space-y-2 text-primary-copy">
          <div className="flex justify-between">
            <span className="text-secondary-copy">Visa fee</span>
            <span className="font-medium">{formatCost(costs.visaFee)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-secondary-copy">Turnaround time</span>
            <span className="font-medium">{formatCost(costs.turnaroundCost)}</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-border-default">
          <div className="flex justify-between items-baseline">
            <div>
              <p className="font-bold text-primary-copy">Total</p>
              <p className="text-sm text-secondary-copy">
                Including taxes & fees
              </p>
            </div>
            <span className="text-xl font-bold text-primary-copy">{formatCost(costs.total)}</span>
          </div>
        </div>
      </section>

      {/* Privacy link */}
      <p className="text-sm text-primary-copy mb-10">
        <Info className="inline-block size-4 text-primary align-middle mr-1.5" aria-hidden />
        <a
          href="#"
          className="font-semibold text-primary underline-offset-2 hover:underline"
        >
          Find out more
        </a>{" "}
        about how we keep your information safe.
      </p>

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
          <Button
            type="button"
            onClick={onContinueToPayment}
            className="rounded-xl px-6 py-3 gap-2"
          >
            Continue to payment
            <ArrowRight className="size-5" aria-hidden />
          </Button>
        )}
      </div>
    </div>
  );
}
