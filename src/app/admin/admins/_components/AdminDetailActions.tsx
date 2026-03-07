"use client"

import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { deleteAdmin } from "@/actions/admins"
import { useTransition } from "react"
import { useRouter } from "next/navigation"
import EditAdminModal from "./EditAdminModal"
import ChangePasswordModal from "./ChangePasswordModal"
import type { AdminWithEmail } from "@/actions/admins"

export default function AdminDetailActions({ admin }: { admin: AdminWithEmail }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm("Are you sure you want to delete this admin?")) return
    startTransition(async () => {
      await deleteAdmin(admin.id)
      router.push("/admin/admins")
    })
  }

  return (
    <div className="flex items-center gap-2">
      <ChangePasswordModal adminId={admin.id} />
      <EditAdminModal admin={admin} />
      <Button
        variant="default"
        onClick={handleDelete}
        disabled={isPending}
        className="h-9 gap-2 bg-red-600 hover:bg-red-600/80 text-white"
      >
        <Trash2 className="size-4" />
        Delete
      </Button>
    </div>
  )
}
