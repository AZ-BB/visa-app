"use client"

import { useTransition } from "react"
import { ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { updateAdmin } from "@/actions/admins"
import { cn } from "@/lib/utils"

type AdminRole = "ADMIN" | "SUPER_ADMIN"

const ROLE_OPTIONS: { value: AdminRole; label: string }[] = [
  { value: "ADMIN", label: "Admin" },
  { value: "SUPER_ADMIN", label: "Super Admin" },
]

const ROLE_STYLES: Record<AdminRole, string> = {
  SUPER_ADMIN:
    "bg-primary/10 text-primary ring-primary/20",
  ADMIN:
    "bg-emerald-50 text-emerald-700 ring-emerald-200/80",
}

export default function RoleDropdown({
  adminId,
  currentRole,
}: {
  adminId: string
  currentRole: AdminRole
}) {
  const [isPending, startTransition] = useTransition()

  const handleRoleChange = (newRole: AdminRole) => {
    if (newRole === currentRole) return
    startTransition(async () => {
      await updateAdmin(adminId, { role: newRole })
    })
  }

  const currentOption = ROLE_OPTIONS.find((r) => r.value === currentRole)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={isPending}
        className={cn(
          "flex justify-between w-full gap-2 items-center border-2 border-border-default/75 rounded-lg px-2 py-2 text-sm font-medium hover:border-primary/75"
        )}
      >
        {currentOption?.label ?? currentRole}
        <ChevronDown className="size-4 opacity-70" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-(--radix-dropdown-menu-trigger-width) space-y-1"
      >
        {ROLE_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleRoleChange(option.value)}
            className={cn(
              'font-medium cursor-pointer',
              option.value === currentRole && "bg-primary text-white hover:bg-primary! hover:text-white! cursor-default"
            )}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
