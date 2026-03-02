"use client"

import { useTransition } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateApplicationAssignee } from "@/actions/applications"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

const UNASSIGNED_VALUE = "__unassigned__"

interface AdminOption {
  id: string
  first_name: string
  last_name: string
}

interface AssigneeDropdownProps {
  applicationId: string
  assignedToId: string | null
  admins: AdminOption[]
  className?: string
}

export function AssigneeDropdown({
  applicationId,
  assignedToId,
  admins,
  className,
}: AssigneeDropdownProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const value = assignedToId ?? UNASSIGNED_VALUE

  const handleChange = (newValue: string) => {
    const newAssignedToId = newValue === UNASSIGNED_VALUE ? null : newValue
    if (newAssignedToId === assignedToId) return

    startTransition(async () => {
      const res = await updateApplicationAssignee(applicationId, newAssignedToId)
      if (res.status) {
        router.refresh()
      }
    })
  }

  return (
    <Select
      value={value}
      onValueChange={handleChange}
      disabled={isPending}
    >
      <SelectTrigger
        className={cn(
          "h-9 w-full min-w-0 rounded-lg border-2 border-border-default/75 px-2 py-1.5 text-base shadow-none hover:border-primary/75",
          !assignedToId && "text-secondary-copy",
          className
        )}
        size="sm"
      >
        <SelectValue placeholder="Unassigned" />
      </SelectTrigger>
      <SelectContent align="start">
        <SelectItem value={UNASSIGNED_VALUE} className="font-medium text-secondary-copy">
          Unassigned
        </SelectItem>
        {admins.map((admin) => (
          <SelectItem key={admin.id} value={admin.id} className="font-medium">
            {admin.first_name} {admin.last_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
