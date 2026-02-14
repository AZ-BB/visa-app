"use client"

import CheckMark from "@/components/svgs/check-mark"
import { cn } from "@/lib/utils"
import { Fragment } from "react"

export const APPLICATION_STEPS = [
  { id: 1, label: "Trip details" },
  { id: 2, label: "Personal info" },
  { id: 3, label: "Passport info" },
  { id: 4, label: "Turnaround time" },
  { id: 5, label: "Checkout" },
] as const

export type StepId = (typeof APPLICATION_STEPS)[number]["id"]

interface ApplicationProgressBarProps {
  currentStep: StepId
  className?: string
}

export function ApplicationProgressBar({
  currentStep,
  className,
}: ApplicationProgressBarProps) {
  return (
    <nav aria-label="Application progress" className={cn("w-full", className)}>
      <ol className="flex w-full items-center">
        {APPLICATION_STEPS.map((step, index) => {
          const isActive = step.id === currentStep
          const isPast = step.id < currentStep
          const isLast = index === APPLICATION_STEPS.length - 1
          const lineIsPast = step.id < currentStep

          return (
            <Fragment key={step.id}>
              <li className="flex shrink-0 items-center">
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-[18px] font-semibold transition-colors",
                    isActive && "border-primary text-primary",
                    isPast && "border-0 bg-[#3CB179] text-white",
                    !isActive &&
                      !isPast &&
                      "border-gray-200 bg-white text-gray-400",
                  )}
                  aria-current={isActive ? "step" : undefined}
                >
                  {isPast ? <CheckMark /> : step.id}
                </div>
                <span
                  className={cn(
                    "ml-2 shrink-0 text-[16px] font-semibold whitespace-nowrap",
                    isActive || isPast ? "text-primary-copy" : "text-gray-400",
                  )}
                >
                  {step.label}
                </span>
              </li>
              {!isLast && (
                <li className="flex min-w-12 flex-1 items-center" aria-hidden>
                  <div
                    className={cn(
                      "h-[3px] mx-2 w-full rounded transition-colors",
                      lineIsPast ? "bg-primary" : "bg-border-default",
                    )}
                  />
                </li>
              )}
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
