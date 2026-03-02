"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Pencil } from "lucide-react"
import { updateProduct } from "@/actions/products"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface EditProductModalProps {
  product: {
    id: number
    processing_fee_override: number | null
    gov_fee_override: number | null
    is_disabled: boolean
  }
  visaTypeId: number
  nationalityName: string
  defaultProcessingFee: number
  defaultGovFee: number
}

export function EditProductModal({
  product,
  visaTypeId,
  nationalityName,
  defaultProcessingFee,
  defaultGovFee,
}: EditProductModalProps) {
  const router = useRouter()

  const buildInitial = () => ({
    overrideProcessingFee: product.processing_fee_override != null,
    processingFee: String(product.processing_fee_override ?? defaultProcessingFee),
    overrideGovFee: product.gov_fee_override != null,
    govFee: String(product.gov_fee_override ?? defaultGovFee),
  })

  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState(buildInitial)

  const reset = () => {
    setForm(buildInitial())
    setError(null)
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) reset()
    setOpen(isOpen)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    startTransition(async () => {
      const result = await updateProduct({
        id: product.id,
        visaTypeId,
        processingFeeOverride: form.overrideProcessingFee ? Number(form.processingFee) : null,
        govFeeOverride: form.overrideGovFee ? Number(form.govFee) : null,
        isDisabled: product.is_disabled,
      })

      if (!result.success) {
        setError(result.error ?? "Failed to update product.")
        return
      }

      setOpen(false)
      reset()
      router.refresh()
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border-default bg-white px-2.5 py-1.5 text-xs font-medium text-secondary-copy shadow-sm transition-all hover:border-primary/40 hover:text-primary"
      >
        <Pencil className="size-3" />
        Edit
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="gap-0 p-0 sm:max-w-[440px]" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader className="border-b border-border-default px-6 py-5">
            <DialogTitle className="text-base">Edit product</DialogTitle>
            <DialogDescription className="text-secondary-copy">
              Update pricing and status for {nationalityName}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-5 px-6 py-5">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={`override-processing-${product.id}`}
                    checked={form.overrideProcessingFee}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        overrideProcessingFee: e.target.checked,
                        processingFee: e.target.checked
                          ? prev.processingFee
                          : String(defaultProcessingFee),
                      }))
                    }
                    className="size-4 rounded border-border-default text-primary accent-primary"
                  />
                  <Label htmlFor={`override-processing-${product.id}`} className="text-sm font-medium text-primary-copy">
                    Override processing fee
                  </Label>
                  {!form.overrideProcessingFee && (
                    <span className="text-xs text-secondary-copy">(default: ${defaultProcessingFee})</span>
                  )}
                </div>
                {form.overrideProcessingFee && (
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    value={form.processingFee}
                    onChange={(e) => setForm((prev) => ({ ...prev, processingFee: e.target.value }))}
                    className="h-10"
                    required
                  />
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={`override-gov-${product.id}`}
                    checked={form.overrideGovFee}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        overrideGovFee: e.target.checked,
                        govFee: e.target.checked
                          ? prev.govFee
                          : String(defaultGovFee),
                      }))
                    }
                    className="size-4 rounded border-border-default text-primary accent-primary"
                  />
                  <Label htmlFor={`override-gov-${product.id}`} className="text-sm font-medium text-primary-copy">
                    Override gov fee
                  </Label>
                  {!form.overrideGovFee && (
                    <span className="text-xs text-secondary-copy">(default: ${defaultGovFee})</span>
                  )}
                </div>
                {form.overrideGovFee && (
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    value={form.govFee}
                    onChange={(e) => setForm((prev) => ({ ...prev, govFee: e.target.value }))}
                    className="h-10"
                    required
                  />
                )}
              </div>

              {error && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                  {error}
                </p>
              )}
            </div>

            <DialogFooter className="border-t border-border-default px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
                className="h-9"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="h-9">
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
