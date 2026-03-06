"use client"

import { useEffect, useState } from "react"
import { useActionState } from "react"
import { Pencil } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateAdmin } from "@/actions/admins"
import type GeneralResponse from "@/types/general"
import type { AdminWithEmail } from "@/actions/admins"

function editAdminAction(
  adminId: string,
  _prevState: GeneralResponse<null> | null,
  formData: FormData
): Promise<GeneralResponse<null>> {
  return updateAdmin(adminId, {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    phone: formData.get("phone") as string,
    role: (formData.get("role") as "ADMIN" | "SUPER_ADMIN") || "ADMIN",
  })
}

export default function EditAdminModal({
  admin,
  children,
}: {
  admin: AdminWithEmail
  children?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  function formAction(prevState: GeneralResponse<null> | null, formData: FormData) {
    return editAdminAction(admin.id, prevState, formData)
  }

  const [state, formActionBound, isPending] = useActionState(formAction, null)

  useEffect(() => {
    if (state?.status === true) {
      setOpen(false)
    }
  }, [state])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? (
          <Button variant="default" size="sm" className="h-9 gap-2">
            <Pencil className="size-4" />
            Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit admin</DialogTitle>
          <DialogDescription className="text-secondary-copy">
            Update admin profile. Email cannot be changed.
          </DialogDescription>
        </DialogHeader>
        <form action={formActionBound} className="space-y-4">
          {state?.error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            >
              {state.error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-admin-first_name">First name</Label>
              <Input
                id="edit-admin-first_name"
                name="first_name"
                defaultValue={admin.first_name}
                placeholder="First name"
                required
                disabled={isPending}
                className="rounded-xl px-4 py-3"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-admin-last_name">Last name</Label>
              <Input
                id="edit-admin-last_name"
                name="last_name"
                defaultValue={admin.last_name}
                placeholder="Last name"
                required
                disabled={isPending}
                className="rounded-xl px-4 py-3"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-admin-phone">Phone</Label>
            <Input
              id="edit-admin-phone"
              name="phone"
              type="tel"
              defaultValue={admin.phone}
              placeholder="+1234567890"
              required
              disabled={isPending}
              className="rounded-xl px-4 py-3"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-admin-role">Role</Label>
            <Select name="role" defaultValue={admin.role} disabled={isPending}>
              <SelectTrigger id="edit-admin-role" className="rounded-xl px-4 py-3 h-auto min-h-0">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
