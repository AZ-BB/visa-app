"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CountryDropdown } from "@/components/ui/country-dropdown";
import { DatePicker } from "@/components/ui/date-picker";
import { CountryFlag } from "@/components/ui/country-flag";
import isVisaAvailable from "@/actions/visas";
import { updateApplicationAdmin } from "@/actions/applications";
import type { Application } from "@/actions/applications";
import { Tables } from "@/database.types";

type TravellerWithProduct = Tables<"travellers"> & {
  product: Tables<"products">;
};

type EditTraveller = {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  passport_number: string;
  passport_expiry_date: string;
  country_of_birth: string;
  country_of_residence: string;
  nationality: string;
  gov_fee: number;
  processing_fee: number;
  product_id: number;
};

type EditFormState = {
  contact_email: string;
  arrival_date: string;
  travellers: EditTraveller[];
};

function toEditTraveller(t: TravellerWithProduct): EditTraveller {
  return {
    id: t.id,
    first_name: t.first_name,
    last_name: t.last_name,
    date_of_birth: t.date_of_birth,
    passport_number: t.passport_number,
    passport_expiry_date: t.passport_expiry_date,
    country_of_birth: t.country_of_birth,
    country_of_residence: t.country_of_residence,
    nationality: t.nationality,
    gov_fee: Number(t.gov_fee),
    processing_fee: Number(t.processing_fee),
    product_id: t.product_id,
  };
}

export function EditApplicationModal({
  application,
  open,
  onOpenChange,
}: {
  application: Application;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const travellers = (application.travellers ?? []) as unknown as TravellerWithProduct[];
  const tt = application.turnaround_time ?? (application as Record<string, unknown>).turnaround_times;
  const turnaroundFee = application.turnaround_fee ?? 0;
  const destCountry = application.destination_country?.id ?? application.destination_country_id;
  const visaTypeId = application.visa_type_id;
  const isPaid = application.is_paid ?? false;
  const amountPaidCents = (application as { amount_paid_cents?: number | null }).amount_paid_cents;
  const paidAmount =
    amountPaidCents != null ? amountPaidCents / 100 : application.total_fee ?? 0;

  const [form, setForm] = useState<EditFormState>(() => ({
    contact_email: application.contact_email ?? "",
    arrival_date: application.arrival_date ?? "",
    travellers: travellers.map(toEditTraveller),
  }));

  const [nationalityErrors, setNationalityErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showFeeWarning, setShowFeeWarning] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);

  const updateTraveller = useCallback((index: number, patch: Partial<EditTraveller>) => {
    setForm((prev) => ({
      ...prev,
      travellers: prev.travellers.map((t, i) =>
        i === index ? { ...t, ...patch } : t
      ),
    }));
  }, []);

  const handleNationalityChange = useCallback(
    async (index: number, nationality: string) => {
      setNationalityErrors((prev) => {
        const next = { ...prev };
        delete next[`${index}`];
        return next;
      });
      updateTraveller(index, { nationality });
      if (!nationality?.trim()) return;
      const res = await isVisaAvailable(destCountry, nationality, visaTypeId);
      if (!res.status || !res.data) {
        setNationalityErrors((prev) => ({ ...prev, [index]: res.error ?? "Not eligible" }));
        return;
      }
      const product = res.data;
      const vt = application.visa_type;
      const baseGov = vt ? Number(vt.gov_fee) : 0;
      const baseProc = vt ? Number(vt.processing_fee) : 0;
      updateTraveller(index, {
        product_id: product.id,
        gov_fee: Number(product.gov_fee_override ?? baseGov),
        processing_fee: Number(product.processing_fee_override ?? baseProc),
      });
    },
    [destCountry, visaTypeId, application.visa_type, updateTraveller]
  );

  const newTotalFee =
    form.travellers.reduce((s, t) => s + t.gov_fee + t.processing_fee, 0) + turnaroundFee;
  const feeDiffers = isPaid && Math.abs(newTotalFee - paidAmount) > 0.001;

  const doSubmit = useCallback(async () => {
    setSubmitError(null);
    setIsSubmitting(true);
    const res = await updateApplicationAdmin(application.id, {
      contact_email: form.contact_email,
      arrival_date: form.arrival_date,
      travellers: form.travellers.map((t) => ({
        id: t.id,
        first_name: t.first_name,
        last_name: t.last_name,
        date_of_birth: t.date_of_birth,
        passport_number: t.passport_number,
        passport_expiry_date: t.passport_expiry_date,
        country_of_birth: t.country_of_birth,
        country_of_residence: t.country_of_residence,
        nationality: t.nationality,
      })),
    });
    setIsSubmitting(false);
    setPendingSubmit(false);
    setShowFeeWarning(false);
    if (!res.status) {
      setSubmitError(res.error ?? "Failed to update");
      return;
    }
    onOpenChange(false);
    window.location.reload();
  }, [application.id, form, onOpenChange]);

  const handleSave = useCallback(() => {
    const hasNationalityError = Object.keys(nationalityErrors).length > 0;
    if (hasNationalityError) return;
    if (feeDiffers) {
      setShowFeeWarning(true);
      setPendingSubmit(true);
    } else {
      doSubmit();
    }
  }, [nationalityErrors, feeDiffers, doSubmit]);

  const handleConfirmFeeWarning = useCallback(() => {
    setShowFeeWarning(false);
    doSubmit();
  }, [doSubmit]);

  const hasErrors = Object.keys(nationalityErrors).length > 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit application</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="contact_email">Contact email</Label>
              <Input
                id="contact_email"
                type="email"
                value={form.contact_email}
                onChange={(e) => setForm((p) => ({ ...p, contact_email: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Arrival date</Label>
              <DatePicker
                value={form.arrival_date || undefined}
                onValueChange={(d) =>
                  setForm((p) => ({ ...p, arrival_date: d ? d.toISOString().split("T")[0] ?? "" : "" }))
                }
                placeholder="DD MM YYYY"
              />
            </div>

            <div className="space-y-4">
              <p className="text-sm font-medium">Travellers</p>
              {form.travellers.map((t, i) => (
                <div
                  key={t.id}
                  className="rounded-xl border border-border-default bg-white p-4 space-y-4"
                >
                  <p className="font-semibold text-primary-copy">
                    Traveller {i + 1}: {t.first_name} {t.last_name}
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>First name</Label>
                      <Input
                        value={t.first_name}
                        onChange={(e) => updateTraveller(i, { first_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Last name</Label>
                      <Input
                        value={t.last_name}
                        onChange={(e) => updateTraveller(i, { last_name: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Date of birth</Label>
                    <DatePicker
                      value={t.date_of_birth || undefined}
                      onValueChange={(d) =>
                        updateTraveller(i, {
                          date_of_birth: d ? d.toISOString().split("T")[0] ?? "" : "",
                        })
                      }
                      placeholder="DD MM YYYY"
                      disableAfterToday
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Passport number</Label>
                    <Input
                      value={t.passport_number}
                      onChange={(e) => updateTraveller(i, { passport_number: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Passport expiry</Label>
                    <DatePicker
                      value={t.passport_expiry_date || undefined}
                      onValueChange={(d) =>
                        updateTraveller(i, {
                          passport_expiry_date: d ? d.toISOString().split("T")[0] ?? "" : "",
                        })
                      }
                      placeholder="DD MM YYYY"
                      disableBeforeToday
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nationality</Label>
                    <CountryDropdown
                      value={t.nationality || undefined}
                      onValueChange={(v) => handleNationalityChange(i, v ?? "")}
                      placeholder="Select nationality"
                    />
                    {nationalityErrors[`${i}`] && (
                      <p className="text-sm text-red-600">{nationalityErrors[`${i}`]}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Country of birth</Label>
                    <CountryDropdown
                      value={t.country_of_birth || undefined}
                      onValueChange={(v) => updateTraveller(i, { country_of_birth: v ?? "" })}
                      placeholder="Select country"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Country of residence</Label>
                    <CountryDropdown
                      value={t.country_of_residence || undefined}
                      onValueChange={(v) => updateTraveller(i, { country_of_residence: v ?? "" })}
                      placeholder="Select country"
                    />
                  </div>
                  <div className="flex gap-4 text-sm text-secondary-copy">
                    <span>Gov fee: ${t.gov_fee.toFixed(2)}</span>
                    <span>Processing: ${t.processing_fee.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            {feeDiffers && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                <p className="font-medium">Fee change detected</p>
                <p>
                  Client paid: ${paidAmount.toFixed(2)} → New total: ${newTotalFee.toFixed(2)}.
                  Amount paid will remain tracked.
                </p>
              </div>
            )}

            {submitError && (
              <p className="text-sm text-red-600">{submitError}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting || hasErrors}>
              {isSubmitting ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showFeeWarning} onOpenChange={() => !pendingSubmit && setShowFeeWarning(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fee change warning</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-primary-copy">
            The fees have changed. The client paid ${paidAmount.toFixed(2)}. The new total is $
            {newTotalFee.toFixed(2)}. The paid amount will remain tracked. Do you want to proceed?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFeeWarning(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmFeeWarning} disabled={isSubmitting}>
              Proceed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
