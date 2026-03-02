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
      <Button variant="default" size="icon" asChild>
        <Link href={`/admin/admins/${adminId}`} aria-label="View">
          <Eye className="size-4" />
        </Link>
      </Button>

      <Button
        variant="default"
        size="icon"
        onClick={handleDelete}
        disabled={isPending}
        aria-label="Delete"
        className="bg-red-600 hover:bg-red-600/80 text-white"
      >
        <Trash2 className="size-5" />
      </Button>
    </div>
  )
}
