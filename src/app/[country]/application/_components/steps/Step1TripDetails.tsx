"use client"

import { ArrowLeft, ArrowRight, Info } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useApplicationOrder } from "../ApplicationOrderContext"

interface Step1TripDetailsProps {
  country: string
  onNext?: () => void
  onBack?: () => void
  errors?: Record<string, string> | null
}

export function Step1TripDetails({
  country,
  onNext,
  onBack,
  errors,
}: Step1TripDetailsProps) {
  const { order, updateOrder } = useApplicationOrder()
  const { tripDetails } = order

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Left: main form — ~2/3 */}
      <div className="lg:col-span-2">
        <h2 className="text-2xl font-bold text-primary-copy mb-8">
          Trip details
        </h2>

        <div className="space-y-6">
          <div>
            <label
              htmlFor="arrival-date"
              className="block text-base font-medium text-primary-copy mb-2"
            >
              When do you arrive in {country}?
            </label>
            <div className="relative">
              <DatePicker
                id="arrival-date"
                value={new Date()}
                onValueChange={() => {}}
                placeholder="DD MM YYYY"
              />
            </div>
            {errors?.arrivalDate && (
              <p
                id="arrival-date-error"
                className="mt-1.5 text-sm text-red-600"
              >
                {errors.arrivalDate}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-base font-medium text-primary-copy mb-1"
            >
              What is your email address?
            </label>
            <p className="text-sm text-secondary-copy mb-2">
              We&apos;ll let you know when your visa is ready
            </p>
            <Input
              id="email"
              type="email"
              placeholder="josh.hadley@company.co.uk"
              value={tripDetails.email}
              onChange={(e) =>
                updateOrder({
                  tripDetails: { ...tripDetails, email: e.target.value },
                })
              }
              className={errors?.email ? "border-red-500" : ""}
              aria-invalid={!!errors?.email}
              aria-describedby={errors?.email ? "email-error" : undefined}
            />
            {errors?.email && (
              <p id="email-error" className="mt-1.5 text-sm text-red-600">
                {errors.email}
              </p>
            )}
          </div>
        </div>

        <div className="mt-10 flex items-center justify-between">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className={cn(
                "inline-flex items-center gap-2 text-primary font-semibold",
                "hover:text-primary-dark transition-colors",
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

      {/* Right: sidebar — ~1/3 */}
      <div className="lg:col-span-1">
        <h3 className="text-2xl font-bold text-primary-copy mb-6">
          Additional costs
        </h3>
        <div className="space-y-2 text-primary-copy">
          <p className="text-base">1 of traveller/s</p>
          <div className="flex justify-between text-base">
            <span className="text-secondary-copy">Visa fee</span>
            <span className="font-medium">£—</span>
          </div>
        </div>

        <div
          className={cn(
            "mt-6 flex gap-3 rounded-xl border-2 border-primary/30",
            "bg-primary/5 px-4 py-4",
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
    </div>
  )
}
