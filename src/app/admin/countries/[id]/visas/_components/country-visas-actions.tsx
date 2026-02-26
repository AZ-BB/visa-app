"use client"

import Link from "next/link"
import { MoreHorizontal, Pencil, Power, Trash2 } from "lucide-react"
import type { VisaType } from "@/lib/admin-types"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { disableVisaAction, deleteVisaAction } from "@/actions/admin"

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
    <div className="flex items-center justify-end gap-1">
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/admin/visas/${visa.id}`}>View</Link>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => handleDisable()} className="text-amber-600">
            <Power className="mr-2 size-4" />
            Disable
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleDelete()} variant="destructive">
            <Trash2 className="mr-2 size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
