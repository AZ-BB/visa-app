"use client"

import CheckMark from "@/components/svgs/check-mark"
import { cn } from "@/lib/utils"
import { Fragment } from "react"
import { useTranslations } from "next-intl"

export const APPLICATION_STEP_IDS = [1, 2, 3, 4, 5] as const
const STEP_LABEL_KEYS = ["tripDetails", "personalInfo", "passportInfo", "turnaroundTime", "checkout"] as const

export type StepId = (typeof APPLICATION_STEP_IDS)[number]

interface ApplicationProgressBarProps {
  currentStep: StepId
  className?: string
}

export function ApplicationProgressBar({
  currentStep,
  className,
}: ApplicationProgressBarProps) {
  const t = useTranslations("application.progress")
  return (
    <nav aria-label={t("ariaLabel")} className={cn("w-full", className)}>
      <ol className="flex w-full items-center">
        {APPLICATION_STEP_IDS.map((stepId, index) => {
          const isActive = stepId === currentStep
          const isPast = stepId < currentStep
          const isLast = index === APPLICATION_STEP_IDS.length - 1
          const lineIsPast = stepId < currentStep
          const label = t(STEP_LABEL_KEYS[index])

          return (
            <Fragment key={stepId}>
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
                  {isPast ? <CheckMark /> : stepId}
                </div>
                <span
                  className={cn(
                    "ml-2 shrink-0 text-[16px] font-semibold whitespace-nowrap hidden sm:inline",
                    isActive || isPast ? "text-primary-copy" : "text-gray-400",
                  )}
                >
                  {label}
                </span>
              </li>
              {!isLast && (
                <li className="flex flex-1 items-center" aria-hidden>
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
