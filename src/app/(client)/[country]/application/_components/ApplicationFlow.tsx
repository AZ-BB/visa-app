"use client"

import { useEffect, useState } from "react"
import { ApplicationOrderProvider, useApplicationOrder } from "./ApplicationOrderContext"
import { ApplicationProgressBar, type StepId } from "./ApplicationProgressBar"
import { Step1TripDetails } from "./steps/Step1TripDetails"
import { Step2PersonalInfo } from "./steps/Step2PersonalInfo"
import { Step4TurnaroundTime } from "./steps/Step4TurnaroundTime"
import { Step3BusinessInfo } from "./steps/Step3BusinessInfo"
import { Step5Checkout } from "./steps/Step5Checkout"
import { validateStep, type StepId as ValidationStepId } from "./applicationStepValidation"
import { AuthUser } from "@/lib/get-user"
import { Tables } from "@/database.types"
import { getCountryNameFromCode } from "@/lib/contries-name"

const MIN_STEP = 1
const MAX_STEP = 5

function formatCountryDisplay(slug: string) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ")
}

export type StepValidationErrors = Record<string, string> | null

function ApplicationFlowContent({
  country,
  isAuthenticated,
}: {
  country: string;
  isAuthenticated: boolean;
}) {
  const { order, updateOrder, travellerVisaErrors } = useApplicationOrder()

  const [currentStep, setCurrentStep] = useState<StepId>(() => {
    const step = order.currentStep || 1
    return Math.min(MAX_STEP, Math.max(MIN_STEP, step)) as StepId
  })
  const [validationErrors, setValidationErrors] = useState<StepValidationErrors>(null)
  const countryDisplay = getCountryNameFromCode(country)

  useEffect(() => {
    if (Object.keys(travellerVisaErrors ?? {}).length > 0) {
      const errors: StepValidationErrors = {}
      for (const [index, error] of Object.entries(travellerVisaErrors ?? {})) {
        errors[`traveller_${index}_nationality`] = error
      }
      setValidationErrors(errors)
    }
  }, [travellerVisaErrors])

  useEffect(() => {
    updateOrder({ currentStep })
  }, [currentStep, updateOrder])

  const handleNext = async () => {
    const errors = await validateStep(currentStep as ValidationStepId, order)
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
    } else {
      setValidationErrors(null)
      setCurrentStep((s) => (s < MAX_STEP ? ((s + 1) as StepId) : s))
    }
  }

  const handleBack = () => {
    setValidationErrors(null)
    setCurrentStep((s) => (s > MIN_STEP ? ((s - 1) as StepId) : s))
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
      <div className="text-[36px] font-bold mb-10 text-primary-copy">{countryDisplay} {order.visa_name}</div>
      <ApplicationProgressBar currentStep={currentStep} className="mb-10 sm:block hidden" />

      <section
        aria-live="polite"
        aria-label={`Step ${currentStep} of ${MAX_STEP}`}
      >
        {currentStep === 1 && (
          <Step1TripDetails
            country={countryDisplay}
            onNext={handleNext}
            errors={validationErrors}
          />
        )}
        {currentStep === 2 && (
          <Step2PersonalInfo
            onNext={handleNext}
            onBack={handleBack}
            errors={validationErrors}
          />
        )}
        {currentStep === 3 && (
          <Step3BusinessInfo
            onNext={handleNext}
            onBack={handleBack}
            errors={validationErrors}
          />
        )}
        {currentStep === 4 && (
          <Step4TurnaroundTime onNext={handleNext} onBack={handleBack} />
        )}
        {currentStep === 5 && (
          <Step5Checkout
            country={countryDisplay}
            visaName={order.visa_name}
            onBack={handleBack}
            onContinueToPayment={handleNext}
            isAuthenticated={isAuthenticated}
          />
        )}
      </section>
    </div>
  )
}

export function ApplicationFlow({
  country,
  turnaroundTimes,
  isAuthenticated,
}: {
  country: string;
  turnaroundTimes: Tables<"turnaround_times">[];
  isAuthenticated: boolean;
}) {
  return (
    <ApplicationOrderProvider turnaroundTimes={turnaroundTimes}>
      <ApplicationFlowContent country={country} isAuthenticated={isAuthenticated} />
    </ApplicationOrderProvider>
  )
}
