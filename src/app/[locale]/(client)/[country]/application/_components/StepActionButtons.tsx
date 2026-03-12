"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import ArrowButton from "@/components/ArrowButton"
import { useTranslations } from "next-intl"

interface StepActionButtonsProps {
  onBack?: () => void
  primaryLabel: string
  primaryOnClick?: () => void
  primaryDisabled?: boolean
  primaryLoading?: boolean
  errorMessage?: string | null
}

export function StepActionButtons({
  onBack,
  primaryLabel,
  primaryOnClick,
  primaryDisabled = false,
  primaryLoading = false,
  errorMessage,
}: StepActionButtonsProps) {
  const t = useTranslations("application.buttons")
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [showFixedButton, setShowFixedButton] = useState(true)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const FIXED_BAR_HEIGHT = 140

    const checkVisibility = () => {
      const rect = sentinel.getBoundingClientRect()
      const visibleThreshold = window.innerHeight - FIXED_BAR_HEIGHT
      const isInView = rect.top < visibleThreshold && rect.bottom > 0
      setShowFixedButton(!isInView)
    }

    checkVisibility()
    window.addEventListener("scroll", checkVisibility, { passive: true })
    window.addEventListener("resize", checkVisibility)
    return () => {
      window.removeEventListener("scroll", checkVisibility)
      window.removeEventListener("resize", checkVisibility)
    }
  }, [])

  const primaryButton = primaryOnClick ? (
    <ArrowButton
      variant="default"
      className="text-xl sm:text-base w-full md:w-auto"
      onClick={primaryOnClick}
      disabled={primaryDisabled}
      isLoading={primaryLoading}
    >
      {primaryLabel}
    </ArrowButton>
  ) : null

  return (
    <>
      <div
        className={cn(
          "mt-10",
          showFixedButton && "pb-32 md:pb-0"
        )}
      >
        {/* Desktop: unchanged layout - flex justify-between */}
        <div className="hidden md:flex items-center justify-between">
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
              {t("previousStep")}
            </button>
          ) : (
            <span />
          )}
          {primaryOnClick && (
            <div className="flex flex-col items-end gap-2">
              {errorMessage && (
                <p className="text-sm text-red-600">{errorMessage}</p>
              )}
              {primaryButton}
            </div>
          )}
        </div>

        {/* Mobile: primary first, Previous as text link below */}
        <div className="flex flex-col gap-6 md:hidden">
          <div ref={sentinelRef} className="flex flex-col gap-2">
            {errorMessage && (
              <p className="text-sm text-red-600">{errorMessage}</p>
            )}
            {primaryButton}
          </div>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className={cn(
                "inline-flex items-center justify-center gap-2 text-primary font-semibold text-xl",
                "hover:text-primary-dark transition-colors"
              )}
            >
              <ArrowLeft className="size-6" aria-hidden />
              {t("previousStep")}
            </button>
          )}
        </div>
      </div>

      {/* Mobile fixed bar */}
      {showFixedButton && (primaryOnClick || onBack) && (
        <div className="fixed bottom-0 left-0 right-0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 border-t border-border-default z-50 md:hidden">
          <div className="flex flex-col gap-4">
            {primaryOnClick && (
              <ArrowButton
                className="w-full text-xl py-9!"
                type="button"
                onClick={primaryOnClick}
                disabled={primaryDisabled}
                isLoading={primaryLoading}
              >
                {primaryLabel}
              </ArrowButton>
            )}
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className={cn(
                  "inline-flex items-center justify-center gap-2 text-primary text-lg font-semibold",
                  "hover:text-primary-dark transition-colors"
                )}
              >
                <ArrowLeft className="size-5" aria-hidden />
                {t("previousStep")}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}
