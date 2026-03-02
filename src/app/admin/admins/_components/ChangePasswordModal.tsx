"use client"

import { useEffect, useState } from "react"
import { useActionState } from "react"
import { KeyRound } from "lucide-react"
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
import { updateAdminPassword } from "@/actions/admins"
import type GeneralResponse from "@/types/general"

function changePasswordAction(
  adminId: string,
  _prevState: GeneralResponse<null> | null,
  formData: FormData
): Promise<GeneralResponse<null>> {
  return updateAdminPassword(
    adminId,
    formData.get("password") as string,
    formData.get("confirm_password") as string
  )
}

export default function ChangePasswordModal({
  adminId,
  children,
}: {
  adminId: string
  children?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  function formAction(prevState: GeneralResponse<null> | null, formData: FormData) {
    return changePasswordAction(adminId, prevState, formData)
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
          <Button variant="outline" className="h-9 shadow-none gap-2">
            <KeyRound className="size-4" />
            Change password
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change password</DialogTitle>
          <DialogDescription className="text-secondary-copy">
            Set a new password for this admin. They will need to sign in again with the new password.
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
          <div className="flex flex-col gap-2">
            <Label htmlFor="change-password-password">New password</Label>
            <Input
              id="change-password-password"
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
            <Label htmlFor="change-password-confirm">Confirm password</Label>
            <Input
              id="change-password-confirm"
              name="confirm_password"
              type="password"
              placeholder="Confirm new password"
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
              {isPending ? "Updating…" : "Update password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
