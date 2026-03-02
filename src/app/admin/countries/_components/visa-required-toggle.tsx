"use client"

import { useState, useTransition } from "react"
import {
  ChevronDown,
  CheckCircle2,
  XCircle,
  AlertTriangle,
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
import { updateVisaRuleVisaRequiredStatus } from "@/actions/visa_rules"
import { cn } from "@/lib/utils"

interface VisaRequiredToggleProps {
  ruleId: number
  isVisaRequired: boolean
  activeProductCount: number
  nationalityName: string
  destinationName: string
}

export function VisaRequiredToggle({
  ruleId,
  isVisaRequired,
  activeProductCount,
  nationalityName,
  destinationName,
}: VisaRequiredToggleProps) {
  const [showWarning, setShowWarning] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleStatusChange = (required: boolean) => {
    if (!required && isVisaRequired && activeProductCount > 0) {
      setShowWarning(true)
      return
    }
    applyChange(required)
  }

  const applyChange = (required: boolean) => {
    startTransition(async () => {
      await updateVisaRuleVisaRequiredStatus(ruleId, required)
      setShowWarning(false)
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
            isVisaRequired
              ? "bg-amber-50 text-amber-700 ring-amber-200/80 hover:bg-amber-100"
              : "bg-emerald-50 text-emerald-700 ring-emerald-200/80 hover:bg-emerald-100"
          )}
        >
          {isPending ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <span
              className={cn(
                "size-1.5 rounded-full",
                isVisaRequired ? "bg-amber-500" : "bg-emerald-500"
              )}
            />
          )}
          {isVisaRequired ? "Required" : "Not required"}
          <ChevronDown className="size-3 opacity-50" />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          className="z-[60] min-w-[180px] border-border-default bg-white text-primary-copy shadow-lg"
        >
          <DropdownMenuItem
            onClick={() => handleStatusChange(true)}
            disabled={isVisaRequired}
            className="gap-2"
          >
            <CheckCircle2 className="size-4 text-amber-600" />
            <span>Required</span>
            {isVisaRequired && (
              <span className="ml-auto text-[10px] text-secondary-copy">
                Current
              </span>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleStatusChange(false)}
            disabled={!isVisaRequired}
            className="gap-2"
          >
            <XCircle className="size-4 text-emerald-600" />
            <span>Not required</span>
            {!isVisaRequired && (
              <span className="ml-auto text-[10px] text-secondary-copy">
                Current
              </span>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showWarning} onOpenChange={setShowWarning}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-amber-50 sm:mx-0">
              <AlertTriangle className="size-6 text-amber-600" />
            </div>
            <DialogTitle>Remove visa requirement?</DialogTitle>
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
              . These visas will be ignored once the route is marked as not
              requiring a visa.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowWarning(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              className="bg-amber-600 text-white hover:bg-amber-700"
              onClick={() => applyChange(false)}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Updating…
                </>
              ) : (
                "Yes, mark not required"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
