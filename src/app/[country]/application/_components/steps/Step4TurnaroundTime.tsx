"use client";

import { ArrowLeft, ArrowRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TurnaroundTimeId } from "../ApplicationOrderContext";
import { useApplicationOrder } from "../ApplicationOrderContext";
import { Separator } from "@/components/ui/separator";
import TipCard from "@/components/TipCard";
import ArrowButton from "@/components/ArrowButton";

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
                  <p className="font-bold text-primary-copy text-lg">
                    {option.cost} – {option.label}
                  </p>
                  <p className="text-base text-secondary-copy font-medium mt-0.5">
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
            <ArrowButton
              variant="default"
              className="text-base"
              onClick={onNext}
            >
              Save & continue
            </ArrowButton>
          )}
        </div>
      </div>

      {/* Sidebar - Additional costs */}
      <div className="space-y-5">
        <div className="bg-white rounded-2xl p-5 border border-border-default/50 shadow-sm">

          <h3 className="text-xl font-bold text-primary-copy mb-2">
            Additional costs
          </h3>

          <p className="text-base">{'{number}'} of traveller/s</p>
          <Separator className="mt-2 mb-4" />

          <div className="flex justify-between text-base">
            <span className="text-secondary-copy">{'{fee-detail}'}</span>
            <span className="font-medium">£{'{cost}'}</span>
          </div>
        </div>

        <TipCard>
          <p className="text-sm text-primary-copy">
            <a
              href="#"
              className="font-semibold text-primary underline-offset-2 hover:underline"
            >
              Find out more
            </a>{" "}
            about how we keep your information safe.
          </p>
        </TipCard>
      </div>
    </div>
  );
}
