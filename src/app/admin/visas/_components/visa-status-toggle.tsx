"use client"

import { useState, useTransition } from "react"
import { ChevronDown, CheckCircle2, XCircle, AlertTriangle, Loader2 } from "lucide-react"
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
import { updateVisaTypeDisabledStatus } from "@/actions/visas"
import { cn } from "@/lib/utils"

interface VisaStatusToggleProps {
  visaId: number
  visaName: string
  isDisabled: boolean
}

export function VisaStatusToggle({
  visaId,
  visaName,
  isDisabled,
}: VisaStatusToggleProps) {
  const [showWarning, setShowWarning] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleStatusChange = (disable: boolean) => {
    if (disable && !isDisabled) {
      setShowWarning(true)
      return
    }
    applyChange(disable)
  }

  const applyChange = (disable: boolean) => {
    startTransition(async () => {
      await updateVisaTypeDisabledStatus(visaId, disable)
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
            isDisabled
              ? "bg-red-50 text-red-700 ring-red-200/80 hover:bg-red-100"
              : "bg-emerald-50 text-emerald-700 ring-emerald-200/80 hover:bg-emerald-100"
          )}
        >
          {isPending ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <span
              className={cn(
                "size-1.5 rounded-full",
                isDisabled ? "bg-red-500" : "bg-emerald-500"
              )}
            />
          )}
          {isDisabled ? "Disabled" : "Active"}
          <ChevronDown className="size-3 opacity-50" />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          className="z-[60] min-w-[160px] border-border-default bg-white text-primary-copy shadow-lg"
        >
          <DropdownMenuItem
            onClick={() => handleStatusChange(false)}
            disabled={!isDisabled}
            className="gap-2"
          >
            <CheckCircle2 className="size-4 text-emerald-600" />
            <span>Active</span>
            {!isDisabled && (
              <span className="ml-auto text-[10px] text-secondary-copy">Current</span>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleStatusChange(true)}
            disabled={isDisabled}
            className="gap-2"
          >
            <XCircle className="size-4 text-red-600" />
            <span>Disabled</span>
            {isDisabled && (
              <span className="ml-auto text-[10px] text-secondary-copy">Current</span>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showWarning} onOpenChange={setShowWarning}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-red-50 sm:mx-0">
              <AlertTriangle className="size-6 text-red-600" />
            </div>
            <DialogTitle>Disable &ldquo;{visaName}&rdquo;?</DialogTitle>
            <DialogDescription>
              Disabling this visa type will prevent new applications from
              selecting it. Existing applications will not be affected. You can
              re-enable it at any time.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-4 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setShowWarning(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => applyChange(true)}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Disabling…
                </>
              ) : (
                "Yes, disable"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
