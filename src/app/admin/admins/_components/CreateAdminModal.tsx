"use client"

import { useEffect, useState } from "react"
import { useActionState } from "react"
import { Plus } from "lucide-react"
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
import { createAdmin } from "@/actions/admins"
import type GeneralResponse from "@/types/general"

function createAdminAction(
  _prevState: GeneralResponse<null> | null,
  formData: FormData
): Promise<GeneralResponse<null>> {
  return createAdmin({
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    password: formData.get("password") as string,
    confirm_password: formData.get("confirm_password") as string,
    role: (formData.get("role") as "ADMIN" | "SUPER_ADMIN") || "ADMIN",
  })
}

export default function CreateAdminModal() {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(createAdminAction, null)

  useEffect(() => {
    if (state?.status === true) {
      setOpen(false)
    }
  }, [state])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="size-4" />
          Create
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create admin</DialogTitle>
          <DialogDescription className="text-secondary-copy">
            Add a new admin user. They will be able to sign in with the email and password you provide.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
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
              <Label htmlFor="create-admin-first_name">First name</Label>
              <Input
                id="create-admin-first_name"
                name="first_name"
                placeholder="First name"
                required
                disabled={isPending}
                className="rounded-xl px-4 py-3"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="create-admin-last_name">Last name</Label>
              <Input
                id="create-admin-last_name"
                name="last_name"
                placeholder="Last name"
                required
                disabled={isPending}
                className="rounded-xl px-4 py-3"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="create-admin-email">Email</Label>
            <Input
              id="create-admin-email"
              name="email"
              type="email"
              placeholder="admin@example.com"
              required
              disabled={isPending}
              className="rounded-xl px-4 py-3"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="create-admin-phone">Phone</Label>
            <Input
              id="create-admin-phone"
              name="phone"
              type="tel"
              placeholder="+1234567890"
              required
              disabled={isPending}
              className="rounded-xl px-4 py-3"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="create-admin-role">Role</Label>
            <Select name="role" defaultValue="ADMIN" disabled={isPending}>
              <SelectTrigger id="create-admin-role" className="rounded-xl px-4 py-3 h-auto min-h-0">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="create-admin-password">Password</Label>
            <Input
              id="create-admin-password"
              name="password"
              type="password"
              placeholder="At least 8 characters"
              minLength={8}
              required
              disabled={isPending}
              className="rounded-xl px-4 py-3"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="create-admin-confirm_password">Confirm password</Label>
            <Input
              id="create-admin-confirm_password"
              name="confirm_password"
              type="password"
              placeholder="Confirm your password"
              minLength={8}
              required
              disabled={isPending}
              className="rounded-xl px-4 py-3"
            />
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
              {isPending ? "Creating…" : "Create admin"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
