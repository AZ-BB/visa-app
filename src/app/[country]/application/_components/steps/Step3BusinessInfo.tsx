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
    <div className="lg:col-span-1">
      <h3 className="text-2xl font-bold text-primary-copy mb-6">
        Additional costs
      </h3>
      <div className="space-y-2 text-primary-copy">
        <p className="text-base">{travellerCount} of traveller/s</p>
        <div className="flex justify-between text-base">
          <span className="text-secondary-copy">Visa fee</span>
          <span className="font-medium">£—</span>
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
    <div className="space-y-5 pt-2">
      <div>
        <label
          htmlFor={`${idPrefix}-passport-destination`}
          className="block text-base font-medium text-primary-copy mb-2"
        >
          Passport destination
        </label>
        <CountryDropdown
          placeholder="Select destination"
          value={passportDestinationValue}
          onValueChange={(value) => onUpdate({ passportDestination: value })}
        />
        {field("passportDestination") && (
          <p className="mt-1.5 text-sm text-red-600">{field("passportDestination")}</p>
        )}
      </div>
      <div>
        <label
          htmlFor={`${idPrefix}-passport-number`}
          className="block text-base font-medium text-primary-copy mb-2"
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
          className="block text-base font-medium text-primary-copy mb-2"
        >
          Passport expiry date
        </label>
        <Input
          id={`${idPrefix}-passport-expiry-date`}
          type="text"
          placeholder="12 Mar 2035"
          value={traveller.passportExpiryDate}
          onChange={(e) => onUpdate({ passportExpiryDate: e.target.value })}
          className={field("passportExpiryDate") ? "border-red-500" : ""}
          aria-invalid={!!field("passportExpiryDate")}
        />
        {field("passportExpiryDate") && (
          <p className="mt-1.5 text-sm text-red-600">{field("passportExpiryDate")}</p>
        )}
      </div>
      <div>
        <label className="block text-base font-medium text-primary-copy mb-2">
          Country of birth
        </label>
        <CountryDropdown
          placeholder="Select country of birth"
          value={traveller.countryOfBirth || undefined}
          onValueChange={(value) => onUpdate({ countryOfBirth: value })}
          aria-label="Country of birth"
        />
        {field("countryOfBirth") && (
          <p className="mt-1.5 text-sm text-red-600">{field("countryOfBirth")}</p>
        )}
      </div>
      <div>
        <label
          htmlFor={`${idPrefix}-country-residence`}
          className="block text-base font-medium text-primary-copy mb-2"
        >
          Country of residence
        </label>
        <CountryDropdown
          placeholder="Select country of residence"
          value={traveller.countryOfResidence || undefined}
          onValueChange={(value) => onUpdate({ countryOfResidence: value })}
          aria-label="Country of residence"
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
          type="single"
          defaultValue="traveller-1"
          collapsible
          className="space-y-3"
        >
          {travellers.map((traveller, index) => (
            <AccordionItem key={index} value={`traveller-${index + 1}`}>
              <AccordionTrigger className="text-primary-copy font-bold">
                Traveller #{index + 1}
                {[traveller.firstName, traveller.lastName].filter(Boolean).length > 0 && (
                  <span className="font-normal text-secondary-copy ml-2">
                    — {[traveller.firstName, traveller.lastName].filter(Boolean).join(" ")}
                  </span>
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

      <ApplicationSidebar travellerCount={travellers.length} />
    </div>
  );
}
