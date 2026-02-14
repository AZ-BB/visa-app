"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CountryDropdown } from "@/components/ui/country-dropdown";
import { ArrowLeft, ArrowRight, Info, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Step3BusinessInfoProps {
  onNext?: () => void;
  onBack?: () => void;
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

const BUSINESS_TYPES = [
  "Limited company",
  "Sole trader",
  "Partnership",
  "PLC",
  "Other",
];

function BusinessFields({ idPrefix }: { idPrefix: string }) {
  return (
    <div className="space-y-5 pt-2">
      <div>
        <label
          htmlFor={`${idPrefix}-passport-destination`}
          className="block text-base font-medium text-primary-copy mb-2"
        >
          Passport destination
        </label>
        <CountryDropdown placeholder="Select destination"  />  
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
        />
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
          placeholder="12345678"
        />
      </div>
      <div>
        <label className="block text-base font-medium text-primary-copy mb-2">
          Country of birth
        </label>
        <CountryDropdown
          placeholder="Select country of birth"
          aria-label="Country of birth"
        />
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
          aria-label="Country of residence"
        />
      </div>
    </div>
  );
}

export function Step3BusinessInfo({ onNext, onBack }: Step3BusinessInfoProps) {
  const [businessCount, setBusinessCount] = useState(2);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h2 className="text-2xl font-bold text-primary-copy mb-2">
          Business info
        </h2>
        <p className="text-secondary-copy text-base mb-6">
          Add business details for each traveller applying.
        </p>

        <Accordion
          type="single"
          defaultValue="business-1"
          collapsible
          className="space-y-3"
        >
          <AccordionItem value="business-1">
            <AccordionTrigger className="text-primary-copy font-bold">
              Traveller #1
            </AccordionTrigger>
            <AccordionContent>
              <BusinessFields idPrefix="b1" />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="business-2">
            <AccordionTrigger className="text-primary-copy font-bold">
              Traveller #2
            </AccordionTrigger>
            <AccordionContent>
              <BusinessFields idPrefix="b2" />
            </AccordionContent>
          </AccordionItem>
          {businessCount > 2 &&
            Array.from({ length: businessCount - 2 }, (_, i) => i + 3).map(
              (n) => (
                <AccordionItem key={n} value={`business-${n}`}>
                  <AccordionTrigger className="text-primary-copy font-bold">
                    Traveller #{n}
                  </AccordionTrigger>
                  <AccordionContent>
                    <BusinessFields idPrefix={`b${n}`} />
                  </AccordionContent>
                </AccordionItem>
              )
            )}
        </Accordion>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setBusinessCount((c) => c + 1)}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-primary px-4 py-3 text-primary font-semibold hover:bg-primary/5 transition-colors"
          >
            Add Traveller
          </button>
          <button
            type="button"
            onClick={() => setBusinessCount((c) => c + 1)}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-white hover:bg-primary-dark/90 transition-colors"
            aria-label="Add business"
          >
            <Plus className="size-6" aria-hidden />
          </button>
        </div>

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

      <ApplicationSidebar travellerCount={businessCount} />
    </div>
  );
}
