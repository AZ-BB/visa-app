"use client";

import { useEffect, useRef, useState } from "react";
import isVisaAvailable from "@/actions/visas";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CountryDropdown } from "@/components/ui/country-dropdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { TempTraveller } from "../ApplicationOrderContext";
import { useApplicationOrder } from "../ApplicationOrderContext";
import { Separator } from "@/components/ui/separator";
import TipCard from "@/components/TipCard";
import { DatePicker } from "@/components/ui/date-picker";
import { StepActionButtons } from "../StepActionButtons";

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
          <span className="text-secondary-copy">Total</span>
          <span className="font-medium">Calculated at checkout</span>
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
  onNationalityChange,
  errors,
  defaultNationality,
}: {
  idPrefix: string;
  index: number;
  traveller: TempTraveller;
  onUpdate: (patch: Partial<TempTraveller>) => void;
  onNationalityChange?: (value: string) => void;
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
          onValueChange={(value) => {
            onUpdate({ nationality: value });
            onNationalityChange?.(value ?? "");
          }}
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
          value={traveller.passport_expiry_date || undefined}
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
  const [isValidatingNationality, setIsValidatingNationality] = useState(false);
  const [nationalityVisaErrors, setNationalityVisaErrors] = useState<Record<number, string>>({});
  const validationRequestId = useRef(0);

  const handleNationalityChange = (index: number, value: string) => {
    setNationalityVisaErrors((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
    if (!value) {
      setIsValidatingNationality(false);
      return;
    }
    const requestId = ++validationRequestId.current;
    setIsValidatingNationality(true);
    isVisaAvailable(order.destination_country, value, order.visa_type_id).then((res) => {
      if (requestId !== validationRequestId.current) return;
      setIsValidatingNationality(false);
      if (!res.status && res.error) {
        setNationalityVisaErrors((prev) => ({ ...prev, [index]: res.error! }));
        updateOrder((prev) => ({
          travellers: prev.travellers.map((t, i) =>
            i === index ? { ...t, product: null } : t
          ),
        }));
      }
      if (res.status && res.data) {
        const product = res.data;
        updateOrder((prev) => ({
          travellers: prev.travellers.map((t, i) =>
            i === index ? { ...t, product } : t
          ),
        }));
        setNationalityVisaErrors((prev) => {
          const next = { ...prev };
          delete next[index];
          return next;
        });
      }
    });
  };

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

  // Verify visa for all travellers when step renders
  useEffect(() => {
    const dest = order.destination_country?.trim();
    const visaTypeId = order.visa_type_id;
    if (!dest || !visaTypeId) return;

    const toVerify = travellers
      .map((t, i) => ({ traveller: t, index: i }))
      .filter(({ traveller }) => traveller.nationality?.trim());

    if (toVerify.length === 0) return;

    // Skip if all travellers with nationality already have a valid product
    const needsVerification = toVerify.some(({ traveller }) => !traveller.product);
    if (!needsVerification) return;

    const requestId = ++validationRequestId.current;
    setIsValidatingNationality(true);
    setNationalityVisaErrors({});

    Promise.all(
      toVerify.map(({ traveller, index }) =>
        isVisaAvailable(dest, traveller.nationality!, visaTypeId).then((res) => ({
          index,
          res,
        }))
      )
    ).then((results) => {
      if (requestId !== validationRequestId.current) return;
      setIsValidatingNationality(false);

      const errors: Record<number, string> = {};
      let hasUpdates = false;
      const nextTravellers = [...travellers];

      for (const { index, res } of results) {
        if (!res.status && res.error) {
          errors[index] = res.error;
          nextTravellers[index] = { ...nextTravellers[index], product: null };
          hasUpdates = true;
        } else if (res.status && res.data) {
          nextTravellers[index] = { ...nextTravellers[index], product: res.data };
          hasUpdates = true;
        }
      }

      setNationalityVisaErrors(errors);
      if (hasUpdates) {
        updateOrder({ travellers: nextTravellers });
      }
    });
  }, []);

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
                  onNationalityChange={(value) => handleNationalityChange(index, value)}
                  errors={{
                    ...(errors ?? {}),
                    ...Object.fromEntries(
                      Object.entries(nationalityVisaErrors).map(([i, msg]) => [
                        `traveller_${i}_nationality`,
                        msg,
                      ])
                    ),
                  }}
                  defaultNationality={order.nationality}
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <StepActionButtons
          onBack={onBack}
          primaryLabel="Save & continue"
          primaryOnClick={onNext}
          primaryDisabled={isValidatingNationality || Object.keys(nationalityVisaErrors).length > 0}
        />
      </div>

      <ApplicationSidebar travellerCount={travellers.length} />
    </div>
  );
}
