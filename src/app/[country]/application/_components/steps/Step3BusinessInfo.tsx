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
import type { Traveller } from "../ApplicationOrderContext";
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
  defaultPassportDestination,
}: {
  idPrefix: string;
  index: number;
  traveller: Traveller;
  onUpdate: (patch: Partial<Traveller>) => void;
  errors?: Record<string, string> | null;
  defaultPassportDestination?: string;
}) {
  const field = (key: string) => errors?.[`traveller_${index}_${key}`];
  const passportDestinationValue =
    traveller.passportDestination || defaultPassportDestination || undefined;
  return (
    <div className="space-y-5 pt-5">
      <div>
        <label
          htmlFor={`${idPrefix}-passport-destination`}
          className="block text-base font-semibold text-primary-copy mb-2"
        >
          Passport destination
        </label>
        <CountryDropdown
          placeholder="Select destination"
          value={passportDestinationValue}
          className="py-4"
          onValueChange={(value) => onUpdate({ passportDestination: value })}
        />
        {field("passportDestination") && (
          <p className="mt-1.5 text-sm text-red-600">{field("passportDestination")}</p>
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
          value={traveller.passportNumber}
          onChange={(e) => onUpdate({ passportNumber: e.target.value })}
          className={field("passportNumber") ? "border-red-500" : ""}
          aria-invalid={!!field("passportNumber")}
        />
        {field("passportNumber") && (
          <p className="mt-1.5 text-sm text-red-600">{field("passportNumber")}</p>
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
          value={traveller.passportExpiryDate ? parseISO(traveller.passportExpiryDate) : undefined}
          onValueChange={(date) => onUpdate({ passportExpiryDate: date ? date.toISOString() : "" })}
          placeholder="DD MM YYYY"
          disableBeforeToday={true}
        />
        {field("passportExpiryDate") && (
          <p className="mt-1.5 text-sm text-red-600">{field("passportExpiryDate")}</p>
        )}
      </div>
      <div>
        <label className="block text-base font-semibold text-primary-copy mb-2">
          Country of birth
        </label>
        <CountryDropdown
          placeholder="Select country of birth"
          value={traveller.countryOfBirth || undefined}
          onValueChange={(value) => onUpdate({ countryOfBirth: value })}
          aria-label="Country of birth"
          className="py-4"
        />
        {field("countryOfBirth") && (
          <p className="mt-1.5 text-sm text-red-600">{field("countryOfBirth")}</p>
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
          value={traveller.countryOfResidence || undefined}
          onValueChange={(value) => onUpdate({ countryOfResidence: value })}
          aria-label="Country of residence"
          className="py-4"
        />
        {field("countryOfResidence") && (
          <p className="mt-1.5 text-sm text-red-600">{field("countryOfResidence")}</p>
        )}
      </div>
    </div>
  );
}

export function Step3BusinessInfo({ onNext, onBack, errors }: Step3BusinessInfoProps) {
  const { order, updateOrder } = useApplicationOrder();
  const { travellers, destinationCountry } = order;

  useEffect(() => {
    if (!destinationCountry?.trim()) return;
    const needsDefault = travellers.some((t) => !t.passportDestination?.trim());
    if (!needsDefault) return;
    updateOrder({
      travellers: travellers.map((t) =>
        t.passportDestination?.trim()
          ? t
          : { ...t, passportDestination: destinationCountry }
      ),
    });
  }, [destinationCountry]);

  const updateTraveller = (index: number, patch: Partial<Traveller>) => {
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
                {[traveller.firstName, traveller.lastName].filter(Boolean).length > 0 && (
                  <>
                    {[traveller.firstName, traveller.lastName].filter(Boolean).join(" ")}
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
                  defaultPassportDestination={order.destinationCountry}
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
