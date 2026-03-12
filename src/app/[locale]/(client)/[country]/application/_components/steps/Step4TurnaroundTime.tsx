"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useApplicationOrder } from "../ApplicationOrderContext";
import { Separator } from "@/components/ui/separator";
import TipCard from "@/components/TipCard";
import { StepActionButtons } from "../StepActionButtons";

interface Step4TurnaroundTimeProps {
  onNext?: () => void;
  onBack?: () => void;
}

export function Step4TurnaroundTime({ onNext, onBack }: Step4TurnaroundTimeProps) {
  const t = useTranslations("application.step4");
  const tSidebar = useTranslations("application.step1");
  const { order, updateOrder, turnaroundTimes } = useApplicationOrder();

  function formatTurnaroundDescription(hours: number): string {
    if (hours < 24) return t("takesHours", { hours });
    const days = Math.round(hours / 24);
    return days === 1 ? t("takes1Day") : t("takesDays", { days });
  }
  const selected = order.turnaround_time_id;
  const options = turnaroundTimes.filter((tt) => !tt.is_disabled);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h2 className="text-2xl font-bold text-primary-copy mb-8">
          {t("title")}
        </h2>

        <fieldset className="space-y-3" role="radiogroup" aria-label={t("title")}>
          {options.map((option) => {
            const isSelected = selected === option.id;
            const hours = (option as { turnaround_time_hours?: number }).turnaround_time_hours ?? 24;
            const description = formatTurnaroundDescription(hours);
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
                  <p className="font-bold text-primary-copy text-xl">
                    {option.name}
                  </p>
                  <p className="text-base text-secondary-copy font-medium mt-0.5">
                    {description}
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
                  onChange={() => updateOrder({ turnaround_time_id: option.id })}
                  className="sr-only"
                />
              </label>
            );
          })}
        </fieldset>

        <StepActionButtons
          onBack={onBack}
          primaryLabel={t("saveContinue")}
          primaryOnClick={onNext}
          primaryDisabled={selected == null}
        />
      </div>

      {/* Sidebar - Additional costs */}
      <div className="space-y-5">
        <div className="bg-white rounded-2xl p-5 border border-border-default/50 shadow-sm">

          <h3 className="text-xl font-bold text-primary-copy mb-2">
            {tSidebar("additionalCosts")}
          </h3>

          <p className="text-base">{tSidebar("ofTravellers", { count: order.travellers.length })}</p>
          <Separator className="mt-2 mb-4" />

          <div className="flex justify-between text-base">
            <span className="text-secondary-copy">{tSidebar("total")}</span>
            <span className="font-medium">{t("calculatedOnCheckout")}</span>
          </div>
        </div>

        <TipCard>
          <p className="text-sm text-primary-copy">
            <a
              href="#"
              className="font-semibold text-primary underline-offset-2 hover:underline"
            >
              {tSidebar("findOutMore")}
            </a>{" "}
            {tSidebar("privacyTip")}
          </p>
        </TipCard>
      </div>
    </div>
  );
}
