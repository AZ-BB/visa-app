"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, Trash2, Loader2, AlertTriangle } from "lucide-react"
import { softDeleteVisaType } from "@/actions/visas"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface VisaType {
  id: number
  name: string
}

interface CountryVisasActionsProps {
  visa: VisaType
}

export function CountryVisasActions({ visa }: CountryVisasActionsProps) {
  const router = useRouter()
  const [showWarning, setShowWarning] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    startTransition(async () => {
      const result = await softDeleteVisaType(visa.id)
      if (result.success) {
        setShowWarning(false)
        router.refresh()
      }
    })
  }

  return (
    <>
      <div className="flex items-center justify-end gap-1.5">
        <Link
          href={`/admin/visas/${visa.id}`}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border-default bg-white px-3 text-xs font-medium text-primary-copy shadow-sm transition-all hover:border-primary/40 hover:text-primary group-hover:border-primary/30"
        >
          <Eye className="size-3.5" />
          View
        </Link>

        <button
          type="button"
          onClick={() => setShowWarning(true)}
          className="inline-flex size-8 items-center justify-center rounded-lg border border-border-default bg-white text-secondary-copy shadow-sm transition-all outline-none hover:border-red-300 hover:text-red-600"
        >
          <Trash2 className="size-3.5" />
          <span className="sr-only">Delete</span>
        </button>
      </div>

      <Dialog open={showWarning} onOpenChange={setShowWarning}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-red-50">
              <AlertTriangle className="size-6 text-red-600" />
            </div>
            <DialogTitle className="text-center">
              Delete {visa.name}?
            </DialogTitle>
            <DialogDescription className="text-center text-secondary-copy">
              This visa type will be permanently removed and will no longer
              appear in new applications. Existing applications that already
              use this visa type will not be affected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row justify-center gap-2 sm:justify-center">
            <Button
              variant="outline"
              onClick={() => setShowWarning(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isPending}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete permanently"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
