"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  className?: string
}

export function StatusDropdown({ applicationId, status, className }: StatusDropdownProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const config = statusConfig[status]

  const handleChange = (newStatus: string) => {
    if (newStatus === status) return
    startTransition(async () => {
      const res = await updateApplicationStatus(applicationId, newStatus as ApplicationStatus)
      if (res.status) {
        router.refresh()
      }
    })
  }

  return (
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
  )
}
