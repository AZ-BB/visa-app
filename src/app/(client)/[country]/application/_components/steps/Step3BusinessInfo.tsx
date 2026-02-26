"use client";

import { useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CountryDropdown } from "@/components/ui/country-dropdown";
import { ArrowLeft, ArrowRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { TempTraveller } from "../ApplicationOrderContext";
import { useApplicationOrder } from "../ApplicationOrderContext";
import { Separator } from "@/components/ui/separator";
import TipCard from "@/components/TipCard";
import { DatePicker } from "@/components/ui/date-picker";
import { parseISO } from "date-fns";
import ArrowButton from "@/components/ArrowButton";

interface Step3BusinessInfoProps {
  onNext?: () => void;
  onBack?: () => void;
  errors?: Record<string, string> | null;
}

function ApplicationSidebar({
  travellerCount = 1,
}: {
  travellerCount?: number;
}) {
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl p-5 border border-border-default/50 shadow-sm">

        <h3 className="text-xl font-bold text-primary-copy mb-2">
          Additional costs
        </h3>

        <p className="text-base">{travellerCount} of traveller/s</p>
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
  );
}

function PassportFields({
  idPrefix,
  index,
  traveller,
  onUpdate,
  errors,
  defaultNationality,
}: {
  idPrefix: string;
  index: number;
  traveller: TempTraveller;
  onUpdate: (patch: Partial<TempTraveller>) => void;
  errors?: Record<string, string> | null;
  defaultNationality?: string;
}) {
  const field = (key: string) => errors?.[`traveller_${index}_${key}`];
  const nationalityValue =
    traveller.nationality || defaultNationality || undefined;
  return (
    <div className="space-y-5 pt-5">
      <div>
        <label
          htmlFor={`${idPrefix}-nationality`}
          className="block text-base font-semibold text-primary-copy mb-2"
        >
          Passport nationality
        </label>
        <CountryDropdown
          placeholder="Select nationality"
          value={nationalityValue}
          className="py-4"
          onValueChange={(value) => onUpdate({ nationality: value })}
        />
        {field("nationality") && (
          <p className="mt-1.5 text-sm text-red-600">{field("nationality")}</p>
        )}
      </div>
      <div>
        <label
          htmlFor={`${idPrefix}-passport-number`}
          className="block text-base font-semibold text-primary-copy mb-2"
        >
          Passport number
        </label>
        <Input
          id={`${idPrefix}-passport-number`}
          type="text"
          placeholder="12345678"
          value={traveller.passport_number}
          onChange={(e) => onUpdate({ passport_number: e.target.value })}
          className={field("passport_number") ? "border-red-500" : ""}
          aria-invalid={!!field("passport_number")}
        />
        {field("passport_number") && (
          <p className="mt-1.5 text-sm text-red-600">{field("passport_number")}</p>
        )}
      </div>
      <div>
        <label
          htmlFor={`${idPrefix}-passport-expiry-date`}
          className="block text-base font-semibold text-primary-copy mb-2"
        >
          Passport expiry date
        </label>
        <DatePicker
          id={`${idPrefix}-passport-expiry-date`}
          value={traveller.passport_expiry_date ? parseISO(traveller.passport_expiry_date) : undefined}
          onValueChange={(date) => onUpdate({ passport_expiry_date: date ? date.toISOString().split("T")[0] ?? "" : "" })}
          placeholder="DD MM YYYY"
          disableBeforeToday={true}
        />
        {field("passport_expiry_date") && (
          <p className="mt-1.5 text-sm text-red-600">{field("passport_expiry_date")}</p>
        )}
      </div>
      <div>
        <label className="block text-base font-semibold text-primary-copy mb-2">
          Country of birth
        </label>
        <CountryDropdown
          placeholder="Select country of birth"
          value={traveller.country_of_birth || undefined}
          onValueChange={(value) => onUpdate({ country_of_birth: value })}
          aria-label="Country of birth"
          className="py-4"
        />
        {field("country_of_birth") && (
          <p className="mt-1.5 text-sm text-red-600">{field("country_of_birth")}</p>
        )}
      </div>
      <div>
        <label
          htmlFor={`${idPrefix}-country-residence`}
          className="block text-base font-semibold text-primary-copy mb-2"
        >
          Country of residence
        </label>
        <CountryDropdown
          placeholder="Select country of residence"
          value={traveller.country_of_residence || undefined}
          onValueChange={(value) => onUpdate({ country_of_residence: value })}
          aria-label="Country of residence"
          className="py-4"
        />
        {field("country_of_residence") && (
          <p className="mt-1.5 text-sm text-red-600">{field("country_of_residence")}</p>
        )}
      </div>
    </div>
  );
}

export function Step3BusinessInfo({ onNext, onBack, errors }: Step3BusinessInfoProps) {
  const { order, updateOrder } = useApplicationOrder();
  const { travellers } = order;

  useEffect(() => {
    if (!order.nationality?.trim()) return;
    const needsDefault = travellers.some((t) => !t.nationality?.trim());
    if (!needsDefault) return;
    updateOrder({
      travellers: travellers.map((t) =>
        t.nationality?.trim()
          ? t
          : { ...t, nationality: order.nationality }
      ),
    });
  }, [order.nationality, travellers, updateOrder]);

  const updateTraveller = (index: number, patch: Partial<TempTraveller>) => {
    updateOrder({
      travellers: travellers.map((t, i) => (i === index ? { ...t, ...patch } : t)),
    });
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h2 className="text-2xl font-bold text-primary-copy mb-2">
          Passport info
        </h2>
        <p className="text-secondary-copy text-base mb-6">
          Add passport details for each traveller. Each section matches a traveller from the previous step.
        </p>

        <Accordion
          type="multiple"
          defaultValue={["traveller-1"]}
          className="space-y-3"
        >
          {travellers.map((traveller, index) => (
            <AccordionItem variant="variant-2" key={index} value={`traveller-${index + 1}`}>
              <AccordionTrigger className="text-primary-copy font-bold text-lg">
                {[traveller.first_name, traveller.last_name].filter(Boolean).length > 0 && (
                  <>
                    {[traveller.first_name, traveller.last_name].filter(Boolean).join(" ")}
                  </>
                )}
              </AccordionTrigger>
              <AccordionContent>
                <PassportFields
                  idPrefix={`t${index + 1}`}
                  index={index}
                  traveller={traveller}
                  onUpdate={(patch) => updateTraveller(index, patch)}
                  errors={errors}
                  defaultNationality={order.nationality}
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

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

      <ApplicationSidebar travellerCount={travellers.length} />
    </div>
  );
}
