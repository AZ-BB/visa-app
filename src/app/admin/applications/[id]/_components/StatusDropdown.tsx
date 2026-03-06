"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, Loader2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { updateApplicationStatus } from "@/actions/applications"
import { ApplicationStatus } from "@/enums"
import { cn } from "@/lib/utils"

const statusConfig: Record<ApplicationStatus, { label: string; triggerClass: string }> = {
  [ApplicationStatus.NOT_STARTED]: {
    label: "Not Started",
    triggerClass: "bg-gray-500/20 text-black border-gray-500/50 hover:bg-gray-500/30",
  },
  [ApplicationStatus.IN_PROGRESS]: {
    label: "In Progress",
    triggerClass: "bg-amber-100 text-black border-amber-500 hover:bg-amber-200",
  },
  [ApplicationStatus.COMPLETED]: {
    label: "Completed",
    triggerClass: "bg-emerald-100 text-black border-emerald-500 hover:bg-emerald-200",
  },
  [ApplicationStatus.REJECTED]: {
    label: "Rejected",
    triggerClass: "bg-red-100 text-black border-red-500 hover:bg-red-200",
  },
}

interface StatusDropdownProps {
  applicationId: string
  status: ApplicationStatus
  amountRefundedCents?: number
  className?: string
}

export function StatusDropdown({ applicationId, status, amountRefundedCents = 0, className }: StatusDropdownProps) {
  const [isPending, startTransition] = useTransition()
  const [showRejectWarning, setShowRejectWarning] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<ApplicationStatus | null>(null)
  const router = useRouter()
  const config = statusConfig[status]

  const applyStatusChange = (newStatus: ApplicationStatus) => {
    startTransition(async () => {
      const res = await updateApplicationStatus(applicationId, newStatus)
      if (res.status) {
        router.refresh()
      }
      setShowRejectWarning(false)
      setPendingStatus(null)
    })
  }

  const handleChange = (newStatus: string) => {
    if (newStatus === status) return
    const asStatus = newStatus as ApplicationStatus
    if (asStatus === ApplicationStatus.REJECTED && amountRefundedCents === 0) {
      setPendingStatus(asStatus)
      setShowRejectWarning(true)
      return
    }
    applyStatusChange(asStatus)
  }

  return (
    <>
      <Select value={status} onValueChange={handleChange} disabled={isPending}>
        <SelectTrigger
          className={cn(
            "!min-h-0 h-10 w-auto gap-1 border-2 px-2.5 rounded-lg text-base font-semibold shadow-none opacity-75 focus:ring-0",
            config.triggerClass,
            isPending && "opacity-50 cursor-not-allowed",
            className
          )}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          {Object.values(ApplicationStatus).map((s) => (
            <SelectItem key={s} value={s}>
              {statusConfig[s].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={showRejectWarning} onOpenChange={setShowRejectWarning}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-red-50 sm:mx-0">
              <AlertTriangle className="size-6 text-red-600" />
            </div>
            <DialogTitle>Reject without refund?</DialogTitle>
            <DialogDescription>
              This application will be rejected but no refund has been done. The
              customer will not receive a refund for this application.
              <br />
              Are you sure you want to continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectWarning(false)
                setPendingStatus(null)
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => pendingStatus && applyStatusChange(pendingStatus)}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Rejecting…
                </>
              ) : (
                "Yes, reject"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
