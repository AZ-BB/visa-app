"use client"

import Link from "next/link"
import { Eye, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { deleteAdmin } from "@/actions/admins"
import { useTransition } from "react"

export default function AdminRowActions({ adminId }: { adminId: string }) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm("Are you sure you want to delete this admin?")) return
    startTransition(async () => {
      await deleteAdmin(adminId)
    })
  }

  return (
    <div className="flex items-center justify-start gap-1">
      <Link
        href={`/admin/admins/${adminId}`}
        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border-default bg-white px-3 text-xs font-medium text-primary-copy shadow-sm transition-all hover:border-primary/40 hover:text-primary group-hover:border-primary/30"
      >
        <Eye className="size-3.5" />
        View
      </Link>

      <Button
        onClick={handleDelete}
        disabled={isPending}
        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border-default bg-white px-3 text-xs font-medium text-red-600 hover:bg-white hover:text-red-600 shadow-sm transition-all hover:border-red-500/40 group-hover:border-primary/30"
      >
        <Trash2 className="size-3.5" />
        Delete
      </Button>

    </div>
  )
}
