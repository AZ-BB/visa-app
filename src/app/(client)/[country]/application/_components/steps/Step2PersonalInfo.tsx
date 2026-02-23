"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowLeft, ArrowRight, Calendar, Info, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  defaultTraveller,
  useApplicationOrder,
  type Traveller as TravellerType,
} from "../ApplicationOrderContext";
import { DatePicker } from "@/components/ui/date-picker";
import { parseISO } from "date-fns";
import { YesNoRadioGroup } from "@/components/YesNoRadioGroup";
import TipCard from "@/components/TipCard";
import { Separator } from "@/components/ui/separator";
import ArrowButton from "@/components/ArrowButton";

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
          placeholder="Joe"
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
          placeholder="Smith"
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
          <DatePicker
            id={`${idPrefix}-dob`}
            value={traveller.dateOfBirth ? parseISO(traveller.dateOfBirth) : undefined}
            onValueChange={(date) => onUpdate({ dateOfBirth: date ? date.toISOString() : "" })}
            placeholder="DD MM YYYY"
            disableAfterToday={true}
          />
        </div>
        {field("dateOfBirth") && (
          <p className="mt-1.5 text-sm text-red-600">{field("dateOfBirth")}</p>
        )}
      </div>
      <div>
        <p className="block text-base font-medium text-primary-copy mb-3">
          Have you been denied a visa in the last 6 months?
        </p>
        <YesNoRadioGroup
          value={traveller.deniedVisaLast6Months}
          onChange={(value) => onUpdate({ deniedVisaLast6Months: value })}
        />
        {field("deniedVisaLast6Months") && (
          <p className="mt-1.5 text-sm text-red-600">{field("deniedVisaLast6Months")}</p>
        )}
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

  const removeTraveller = (index: number) => {
    updateOrder({
      travellers: travellers.filter((_, i) => i !== index),
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
          type="multiple"
          defaultValue={["traveller-1"]}
          className="space-y-3"
        >
          {travellers.map((traveller, index) => (
            <AccordionItem variant="variant-2" key={index} value={`traveller-${index + 1}`}>
              <AccordionTrigger className="text-lg text-primary-copy font-bold">
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
                {
                  index > 0 && (
                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeTraveller(index)}
                        disabled={index === 0}
                        className="flex text-red-500 items-center gap-2 hover:underline"
                        aria-label="Remove traveller"
                      >
                        <Trash2 className="size-4" aria-hidden />
                        Remove traveller
                      </button>
                    </div>
                  )
                }
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <button
          type="button"
          onClick={addTraveller}
          className="inline-flex items-center bg-[#F0FAFF] justify-between gap-2 mt-3 rounded-xl border-3 border-dashed px-4 py-3 text-primary font-semibold hover:bg-primary/5 transition-colors w-full"
        >
          <span className="text-primary-copy font-bold text-lg">Add traveller</span>
          <div className="flex items-center justify-center bg-primary rounded-lg size-10">
            <Plus className="size-6 text-white" aria-hidden />
          </div>
        </button>

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
