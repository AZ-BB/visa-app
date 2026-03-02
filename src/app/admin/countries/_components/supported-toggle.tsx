"use client"

import { useState, useTransition } from "react"
import {
  ChevronDown,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Loader2,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { updateVisaRuleSupportStatus } from "@/actions/visa_rules"
import { cn } from "@/lib/utils"

interface SupportedToggleProps {
  ruleId: number
  isSupported: boolean
  activeProductCount: number
  nationalityName: string
  destinationName: string
}

type WarningType = "disable" | "no-products" | null

export function SupportedToggle({
  ruleId,
  isSupported,
  activeProductCount,
  nationalityName,
  destinationName,
}: SupportedToggleProps) {
  const [warningType, setWarningType] = useState<WarningType>(null)
  const [isPending, startTransition] = useTransition()

  const handleStatusChange = (supported: boolean) => {
    if (!supported && isSupported && activeProductCount > 0) {
      setWarningType("disable")
      return
    }
    if (supported && !isSupported && activeProductCount === 0) {
      setWarningType("no-products")
      return
    }
    applyChange(supported)
  }

  const applyChange = (supported: boolean) => {
    startTransition(async () => {
      await updateVisaRuleSupportStatus(ruleId, supported)
      setWarningType(null)
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={isPending}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors outline-none",
            "ring-1 ring-inset",
            isPending && "opacity-60",
            isSupported
              ? "bg-emerald-50 text-emerald-700 ring-emerald-200/80 hover:bg-emerald-100"
              : "bg-red-50 text-red-600 ring-red-200/80 hover:bg-red-100"
          )}
        >
          {isPending ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <span
              className={cn(
                "size-1.5 rounded-full",
                isSupported ? "bg-emerald-500" : "bg-red-500"
              )}
            />
          )}
          {isSupported ? "Yes" : "No"}
          <ChevronDown className="size-3 opacity-50" />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          className="z-[60] min-w-[180px] border-border-default bg-white text-primary-copy shadow-lg"
        >
          <DropdownMenuItem
            onClick={() => handleStatusChange(true)}
            disabled={isSupported}
            className="gap-2"
          >
            <CheckCircle2 className="size-4 text-emerald-600" />
            <span>Supported</span>
            {isSupported && (
              <span className="ml-auto text-[10px] text-secondary-copy">
                Current
              </span>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleStatusChange(false)}
            disabled={!isSupported}
            className="gap-2"
          >
            <XCircle className="size-4 text-red-600" />
            <span>Not supported</span>
            {!isSupported && (
              <span className="ml-auto text-[10px] text-secondary-copy">
                Current
              </span>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Warning: marking not supported with active products */}
      <Dialog
        open={warningType === "disable"}
        onOpenChange={(open) => !open && setWarningType(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-red-50 sm:mx-0">
              <AlertTriangle className="size-6 text-red-600" />
            </div>
            <DialogTitle>Mark as not supported?</DialogTitle>
            <DialogDescription>
              There {activeProductCount === 1 ? "is" : "are"} currently{" "}
              <span className="font-semibold text-primary-copy">
                {activeProductCount}
              </span>{" "}
              active visa{" "}
              {activeProductCount === 1 ? "product" : "products"} for{" "}
              <span className="font-medium text-primary-copy">
                {nationalityName}
              </span>{" "}
              →{" "}
              <span className="font-medium text-primary-copy">
                {destinationName}
              </span>
              . These visas will be ignored if you mark this route as not
              supported.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setWarningType(null)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => applyChange(false)}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Updating…
                </>
              ) : (
                "Yes, mark not supported"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Info: no products when enabling support */}
      <Dialog
        open={warningType === "no-products"}
        onOpenChange={(open) => !open && setWarningType(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 sm:mx-0">
              <Info className="size-6 text-primary" />
            </div>
            <DialogTitle>No visa products defined</DialogTitle>
            <DialogDescription>
              There are no visa products defined between{" "}
              <span className="font-medium text-primary-copy">
                {nationalityName}
              </span>{" "}
              and{" "}
              <span className="font-medium text-primary-copy">
                {destinationName}
              </span>{" "}
              yet. You can still mark it as supported, but you&apos;ll need to
              create a visa product for it to appear to users.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setWarningType(null)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              className="bg-primary text-white hover:bg-primary-dark/70"
              onClick={() => applyChange(true)}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Updating…
                </>
              ) : (
                "Mark as supported"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
