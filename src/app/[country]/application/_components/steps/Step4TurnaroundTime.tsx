"use client";

import { ArrowLeft, ArrowRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TurnaroundTimeId } from "../ApplicationOrderContext";
import { useApplicationOrder } from "../ApplicationOrderContext";

interface Step4TurnaroundTimeProps {
  onNext?: () => void;
  onBack?: () => void;
}

const TURNAROUND_OPTIONS = [
  {
    id: "standard",
    label: "Standard",
    description: "Takes 2 days",
    cost: "£—",
  },
  {
    id: "fast",
    label: "Fast",
    description: "Takes 24 hours",
    cost: "£—",
  },
  {
    id: "superfast",
    label: "Super Fast",
    description: "Takes 12 hours",
    cost: "£—",
  },
] as const;

export function Step4TurnaroundTime({ onNext, onBack }: Step4TurnaroundTimeProps) {
  const { order, updateOrder } = useApplicationOrder();
  const selected = order.turnaroundTime;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h2 className="text-2xl font-bold text-primary-copy mb-8">
          Turnaround time
        </h2>

        <fieldset className="space-y-3" role="radiogroup" aria-label="Turnaround time">
          {TURNAROUND_OPTIONS.map((option) => {
            const isSelected = selected === option.id;
            return (
              <label
                key={option.id}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-4 rounded-xl border-2 px-5 py-4 transition-colors",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border-default bg-white hover:border-gray-300"
                )}
              >
                <div className="min-w-0">
                  <p className="font-bold text-primary-copy">
                    {option.cost} – {option.label}
                  </p>
                  <p className="text-sm text-secondary-copy mt-0.5">
                    {option.description}
                  </p>
                </div>
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                    isSelected
                      ? "border-primary bg-primary"
                      : "border-gray-300 bg-white"
                  )}
                  aria-hidden
                >
                  {isSelected && (
                    <span className="h-2 w-2 rounded-full bg-white" />
                  )}
                </span>
                <input
                  type="radio"
                  name="turnaround"
                  value={option.id}
                  checked={isSelected}
                  onChange={() => updateOrder({ turnaroundTime: option.id as TurnaroundTimeId })}
                  className="sr-only"
                />
              </label>
            );
          })}
        </fieldset>

        <div className="mt-10 flex items-center justify-between">
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
          {onNext && (
            <Button
              type="button"
              onClick={onNext}
              className="rounded-xl px-6 py-3 gap-2"
            >
              Save & continue
              <ArrowRight className="size-5" aria-hidden />
            </Button>
          )}
        </div>
      </div>

      {/* Sidebar - Additional costs */}
      <div className="lg:col-span-1">
        <div className="rounded-xl border border-border-default bg-white p-6 shadow-sm">
          <h3 className="text-2xl font-bold text-primary-copy mb-6">
            Additional costs
          </h3>
          <div className="space-y-2 text-primary-copy">
            <p className="text-base">1 of traveller/s</p>
            <div className="flex justify-between text-base">
              <span className="text-secondary-copy">Visa fee</span>
              <span className="font-medium">£—</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-secondary-copy">Turnaround time</span>
              <span className="font-medium">£—</span>
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
              <span className="text-xl font-bold text-primary-copy">£—</span>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "mt-6 flex gap-3 rounded-xl border-2 border-primary/30",
            "bg-primary/5 px-4 py-4"
          )}
        >
          <Info className="size-5 shrink-0 text-primary mt-0.5" aria-hidden />
          <p className="text-sm text-primary-copy">
            <a
              href="#"
              className="font-semibold text-primary underline-offset-2 hover:underline"
            >
              Find out more
            </a>{" "}
            about how we keep your information safe.
          </p>
        </div>
      </div>
    </div>
  );
}
