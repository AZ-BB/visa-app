"use client";

import { useTranslations } from "next-intl";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  defaultTraveller,
  useApplicationOrder,
  type TempTraveller,
} from "../ApplicationOrderContext";
import { DatePicker } from "@/components/ui/date-picker";
import TipCard from "@/components/TipCard";
import { Separator } from "@/components/ui/separator";
import { StepActionButtons } from "../StepActionButtons";
import { YesNoRadioGroup } from "@/components/YesNoRadioGroup";

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
  const t = useTranslations("application.step1");
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl p-5 border border-border-default/50 shadow-sm">

        <h3 className="text-xl font-bold text-primary-copy mb-2">
          {t("additionalCosts")}
        </h3>

        <p className="text-base">{t("ofTravellers", { count: travellerCount })}</p>
        <Separator className="mt-2 mb-4" />

        <div className="flex justify-between text-base">
          <span className="text-secondary-copy">{t("total")}</span>
          <span className="font-medium">{t("calculatedAtCheckout")}</span>
        </div>
      </div>

      <TipCard>
        <p className="text-sm text-primary-copy">
          <a
            href="#"
            className="font-semibold text-primary underline-offset-2 hover:underline"
          >
            {t("findOutMore")}
          </a>{" "}
          {t("privacyTip")}
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
  visaName,
  t,
}: {
  idPrefix: string;
  index: number;
  traveller: TempTraveller;
  onUpdate: (patch: Partial<TempTraveller>) => void;
  errors?: Record<string, string> | null;
  visaName: string;
  t: (key: string, values?: Record<string, string | number>) => string;
}) {
  const field = (key: string) => errors?.[`traveller_${index}_${key}`];
  return (
    <div className="space-y-5 pt-2">
      <div>
        <label
          htmlFor={`${idPrefix}-first-name`}
          className="block text-base font-medium text-primary-copy mb-2"
        >
          {t("firstName")}
        </label>
        <Input
          id={`${idPrefix}-first-name`}
          type="text"
          placeholder={t("firstNamePlaceholder")}
          value={traveller.first_name}
          onChange={(e) => onUpdate({ first_name: e.target.value })}
          className={field("first_name") ? "border-red-500" : ""}
          aria-invalid={!!field("first_name")}
        />
        {field("first_name") && (
          <p className="mt-1.5 text-sm text-red-600">{field("first_name")}</p>
        )}
      </div>
      <div>
        <label
          htmlFor={`${idPrefix}-last-name`}
          className="block text-base font-medium text-primary-copy mb-2"
        >
          {t("lastName")}
        </label>
        <Input
          id={`${idPrefix}-last-name`}
          type="text"
          placeholder={t("lastNamePlaceholder")}
          value={traveller.last_name}
          onChange={(e) => onUpdate({ last_name: e.target.value })}
          className={field("last_name") ? "border-red-500" : ""}
          aria-invalid={!!field("last_name")}
        />
        {field("last_name") && (
          <p className="mt-1.5 text-sm text-red-600">{field("last_name")}</p>
        )}
      </div>
      <div>
        <label
          htmlFor={`${idPrefix}-dob`}
          className="block text-base font-medium text-primary-copy mb-2"
        >
          {t("dob")}
        </label>
        <div className="relative">
          <DatePicker
            id={`${idPrefix}-dob`}
            value={traveller.date_of_birth || undefined}
            onValueChange={(date) => onUpdate({ date_of_birth: date ? date.toISOString().split("T")[0] ?? "" : "" })}
            placeholder={t("dobPlaceholder")}
            disableAfterToday={true}
          />
        </div>
        {field("date_of_birth") && (
          <p className="mt-1.5 text-sm text-red-600">{field("date_of_birth")}</p>
        )}
      </div>
      <div>
        <label
          htmlFor={`${idPrefix}-denied-visa`}
          className="block text-base font-medium text-primary-copy mb-2"
        >
          {t("deniedVisa", { visa: visaName || "visa" })}
        </label>
        <YesNoRadioGroup
          id={`${idPrefix}-denied-visa`}
          value={traveller.denied_visa_last_6_months}
          onChange={(value) => onUpdate({ denied_visa_last_6_months: value })}
          aria-label={t("deniedVisa", { visa: visaName || "visa" })}
          aria-invalid={traveller.denied_visa_last_6_months === true}
        />
        {traveller.denied_visa_last_6_months === true && (
          <p className="mt-1.5 text-sm text-red-600">{t("deniedVisaError")}</p>
        )}
      </div>
    </div>
  );
}

export function Step2PersonalInfo({ onNext, onBack, errors }: Step2PersonalInfoProps) {
  const t = useTranslations("application.step2");
  const { order, updateOrder } = useApplicationOrder();
  const { travellers, visa_name } = order;
  const hasAnyDeniedVisa = travellers.some((t) => t.denied_visa_last_6_months === true);

  const updateTraveller = (index: number, patch: Partial<TempTraveller>) => {
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
          {t("title")}
        </h2>
        <p className="text-secondary-copy text-base mb-6">
          {t("intro")}
        </p>

        <Accordion
          type="multiple"
          defaultValue={["traveller-1"]}
          className="space-y-3"
        >
          {travellers.map((traveller, index) => (
            <AccordionItem variant="variant-2" key={index} value={`traveller-${index + 1}`}>
              <AccordionTrigger className="text-lg text-primary-copy font-bold">
                {t("travellerNum", { num: index + 1 })}
              </AccordionTrigger>
              <AccordionContent>
                <TravellerFields
                  idPrefix={`t${index + 1}`}
                  index={index}
                  traveller={traveller}
                  onUpdate={(patch) => updateTraveller(index, patch)}
                  errors={errors}
                  visaName={visa_name}
                  t={t}
                />
                {
                  index > 0 && (
                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeTraveller(index)}
                        disabled={index === 0}
                        className="flex text-red-500 items-center gap-2 hover:underline"
                        aria-label={t("removeTraveller")}
                      >
                        <Trash2 className="size-4" aria-hidden />
                        {t("removeTraveller")}
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
          <span className="text-primary-copy font-bold text-lg">{t("addTraveller")}</span>
          <div className="flex items-center justify-center bg-primary rounded-lg size-10">
            <Plus className="size-6 text-white" aria-hidden />
          </div>
        </button>

        <StepActionButtons
          onBack={onBack}
          primaryLabel={t("saveContinue")}
          primaryOnClick={onNext}
          primaryDisabled={hasAnyDeniedVisa}
        />
      </div>

      <ApplicationSidebar travellerCount={travellers.length} />
    </div>
  );
}
