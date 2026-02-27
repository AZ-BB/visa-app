"use client"

import Link from "next/link"
import { MoreHorizontal, Eye, Power, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { disableVisaAction, deleteVisaAction } from "@/actions/admin"
import { VisaType } from "@/actions/visas"

interface CountryVisasActionsProps {
  visa: VisaType
}

export function CountryVisasActions({ visa }: CountryVisasActionsProps) {
  async function handleDisable() {
    await disableVisaAction(visa.id)
  }

  async function handleDelete() {
    await deleteVisaAction(visa.id)
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Link
        href={`/admin/visas/${visa.id}`}
        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border-default bg-white px-3 text-xs font-medium text-primary-copy shadow-sm transition-all hover:border-primary/40 hover:text-primary group-hover:border-primary/30"
      >
        <Eye className="size-3.5" />
        View
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex size-8 items-center justify-center rounded-lg border border-border-default bg-white text-secondary-copy shadow-sm transition-all outline-none hover:border-primary/30 hover:text-primary-copy">
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Actions</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="z-[60] min-w-[150px] border-border-default bg-white text-primary-copy shadow-lg"
        >
          <DropdownMenuItem onSelect={() => handleDisable()} className="gap-2">
            <Power className="size-4 text-amber-600" />
            {visa.is_disabled ? "Enable" : "Disable"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => handleDelete()}
            variant="destructive"
            className="gap-2"
          >
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
