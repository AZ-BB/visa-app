"use client"

import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { Input } from "@/components/ui/input"
import { useApplicationOrder } from "../ApplicationOrderContext"
import { getCountryNameFromCode } from "@/lib/contries-name"
import TipCard from "@/components/TipCard"
import { Separator } from "@/components/ui/separator"
import { StepActionButtons } from "../StepActionButtons"

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

  const countryName = getCountryNameFromCode(country)

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Left: main form — ~2/3 */}
      <div className="lg:col-span-2">
        <h2 className="text-xl font-bold text-primary-copy mb-8">
          Trip details
        </h2>

        <div className="space-y-6">
          <div>
            <label
              htmlFor="arrival-date"
              className="block text-base font-medium text-primary-copy mb-2"
            >
              When do you arrive in {countryName}?
            </label>
            <div className="relative">
              <DatePicker
                id="arrival-date"
                value={order.arrival_date || undefined}
                onValueChange={(date) =>
                  updateOrder({
                    arrival_date: date ? date.toISOString().split("T")[0] ?? "" : "",
                  })
                }
                placeholder="DD MM YYYY"
                disableBeforeToday={true}
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
              value={order.contact_email}
              onChange={(e) =>
                updateOrder({
                  contact_email: e.target.value,
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

        <StepActionButtons
          onBack={onBack}
          primaryLabel="Save & continue"
          primaryOnClick={onNext}
        />
      </div>

      {/* Right: sidebar — ~1/3 */}
      <div className="space-y-5">
        <div className="bg-white rounded-2xl p-5 border border-border-default/50 shadow-sm">

          <h3 className="text-xl font-bold text-primary-copy mb-2">
            Additional costs
          </h3>

          <p className="text-base">{order.travellers.length} of traveller/s</p>
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
    </div>
  )
}
