"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowLeft, ArrowRight, Calendar, Info, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  defaultTraveller,
  useApplicationOrder,
  type Traveller as TravellerType,
} from "../ApplicationOrderContext";

interface Step2PersonalInfoProps {
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

function TravellerFields({
  idPrefix,
  index,
  traveller,
  onUpdate,
  errors,
}: {
  idPrefix: string;
  index: number;
  traveller: TravellerType;
  onUpdate: (patch: Partial<TravellerType>) => void;
  errors?: Record<string, string> | null;
}) {
  const field = (key: string) => errors?.[`traveller_${index}_${key}`];
  return (
    <div className="space-y-5 pt-2">
      <div>
        <label
          htmlFor={`${idPrefix}-first-name`}
          className="block text-base font-medium text-primary-copy mb-2"
        >
          First and middle name
        </label>
        <Input
          id={`${idPrefix}-first-name`}
          type="text"
          placeholder="Josh"
          value={traveller.firstName}
          onChange={(e) => onUpdate({ firstName: e.target.value })}
          className={field("firstName") ? "border-red-500" : ""}
          aria-invalid={!!field("firstName")}
        />
        {field("firstName") && (
          <p className="mt-1.5 text-sm text-red-600">{field("firstName")}</p>
        )}
      </div>
      <div>
        <label
          htmlFor={`${idPrefix}-last-name`}
          className="block text-base font-medium text-primary-copy mb-2"
        >
          Last name
        </label>
        <Input
          id={`${idPrefix}-last-name`}
          type="text"
          placeholder="Hadley"
          value={traveller.lastName}
          onChange={(e) => onUpdate({ lastName: e.target.value })}
          className={field("lastName") ? "border-red-500" : ""}
          aria-invalid={!!field("lastName")}
        />
        {field("lastName") && (
          <p className="mt-1.5 text-sm text-red-600">{field("lastName")}</p>
        )}
      </div>
      <div>
        <label
          htmlFor={`${idPrefix}-dob`}
          className="block text-base font-medium text-primary-copy mb-2"
        >
          Date of birth
        </label>
        <div className="relative">
          <Input
            id={`${idPrefix}-dob`}
            type="text"
            placeholder="09 Jun 1997"
            value={traveller.dateOfBirth}
            onChange={(e) => onUpdate({ dateOfBirth: e.target.value })}
            className={cn("pr-12", field("dateOfBirth") && "border-red-500")}
            aria-invalid={!!field("dateOfBirth")}
          />
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-secondary-copy">
            <Calendar className="size-5" aria-hidden />
          </div>
        </div>
        {field("dateOfBirth") && (
          <p className="mt-1.5 text-sm text-red-600">{field("dateOfBirth")}</p>
        )}
      </div>
      <div>
        <p className="block text-base font-medium text-primary-copy mb-3">
          Have you been denied a visa in the last 6 months?
        </p>
        <fieldset className="flex gap-6" role="radiogroup" aria-label="Visa denial in last 6 months">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name={`${idPrefix}-denied`}
              value="yes"
              checked={traveller.deniedVisaLast6Months === "yes"}
              onChange={() => onUpdate({ deniedVisaLast6Months: "yes" })}
              className="size-4 border-2 border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-primary-copy">Yes</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name={`${idPrefix}-denied`}
              value="no"
              checked={traveller.deniedVisaLast6Months === "no"}
              onChange={() => onUpdate({ deniedVisaLast6Months: "no" })}
              className="size-4 border-2 border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-primary-copy">No</span>
          </label>
        </fieldset>
      </div>
    </div>
  );
}

export function Step2PersonalInfo({ onNext, onBack, errors }: Step2PersonalInfoProps) {
  const { order, updateOrder } = useApplicationOrder();
  const { travellers } = order;

  const updateTraveller = (index: number, patch: Partial<TravellerType>) => {
    updateOrder({
      travellers: travellers.map((t, i) => (i === index ? { ...t, ...patch } : t)),
    });
  };

  const addTraveller = () => {
    updateOrder({
      travellers: [...travellers, { ...defaultTraveller }],
    });
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h2 className="text-2xl font-bold text-primary-copy mb-2">
          Personal info
        </h2>
        <p className="text-secondary-copy text-base mb-6">
          Each travellers&apos; details must match the passport they&apos;ll be
          travelling with.
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
              </AccordionTrigger>
              <AccordionContent>
                <TravellerFields
                  idPrefix={`t${index + 1}`}
                  index={index}
                  traveller={traveller}
                  onUpdate={(patch) => updateTraveller(index, patch)}
                  errors={errors}
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={addTraveller}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-primary px-4 py-3 text-primary font-semibold hover:bg-primary/5 transition-colors"
          >
            Add traveller
          </button>
          <button
            type="button"
            onClick={addTraveller}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-white hover:bg-primary-dark/90 transition-colors"
            aria-label="Add traveller"
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

      <ApplicationSidebar travellerCount={travellers.length} />
    </div>
  );
}
