"use client"

import { useState } from "react"
import { ApplicationProgressBar, type StepId } from "./ApplicationProgressBar"
import { Step1TripDetails } from "./steps/Step1TripDetails"
import { Step2PersonalInfo } from "./steps/Step2PersonalInfo"
import { Step4TurnaroundTime } from "./steps/Step4TurnaroundTime"
import { Step3BusinessInfo } from "./steps/Step3BusinessInfo"
import { Step5Checkout } from "./steps/Step5Checkout"

const MIN_STEP = 1
const MAX_STEP = 5

function formatCountryDisplay(slug: string) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ")
}

export function ApplicationFlow({ country }: { country: string }) {
  const [currentStep, setCurrentStep] = useState<StepId>(1)
  const countryDisplay = formatCountryDisplay(country)

  const goNext = () => {
    setCurrentStep((s) => (s < MAX_STEP ? ((s + 1) as StepId) : s))
  }

  const goBack = () => {
    setCurrentStep((s) => (s > MIN_STEP ? ((s - 1) as StepId) : s))
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
      <div className="text-[36px] font-bold mb-10 text-primary-copy">United States Tourist eVisa</div>
      <ApplicationProgressBar currentStep={currentStep} className="mb-10" />

      <section
        aria-live="polite"
        aria-label={`Step ${currentStep} of ${MAX_STEP}`}
        >
        {currentStep === 1 && (
          <Step1TripDetails
            country={countryDisplay}
            onNext={goNext}
            onBack={goBack}
          />
        )}
        {currentStep === 2 && <Step2PersonalInfo onNext={goNext} onBack={goBack} />}
        {currentStep === 3 && (
          <Step3BusinessInfo onNext={goNext} onBack={goBack} />
        )}
        {currentStep === 4 && <Step4TurnaroundTime onNext={goNext} onBack={goBack} />}
        {currentStep === 5 && <Step5Checkout onBack={goBack} />}
      </section>
    </div>
  )
}
