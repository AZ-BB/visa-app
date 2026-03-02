"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Pencil } from "lucide-react"
import { updateVisaType } from "@/actions/visas"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface EditVisaModalProps {
  visa: {
    id: number
    name: string
    valid_for: string
    number_of_entries: number
    max_stay: number
    processing_fee: number
    gov_fee: number
  }
}

function parseValidFor(raw: string): {
  amount: string
  unit: "days" | "months" | "years"
} | null {
  const match = raw.trim().match(/^(\d+)\s+(days?|months?|years?)$/i)
  if (!match) return null
  const amount = match[1]
  const unitRaw = match[2].toLowerCase().replace(/s$/, "")
  const unitMap: Record<string, "days" | "months" | "years"> = {
    day: "days",
    month: "months",
    year: "years",
  }
  const unit = unitMap[unitRaw]
  if (!unit) return null
  return { amount, unit }
}

export function EditVisaModal({ visa }: EditVisaModalProps) {
  const router = useRouter()
  const parsed = parseValidFor(visa.valid_for)

  const buildInitial = () => ({
    name: visa.name,
    validForAmount: parsed?.amount ?? "",
    validForUnit: parsed?.unit ?? "days",
    numberOfEntries: String(visa.number_of_entries),
    maxStay: String(visa.max_stay),
    processingFee: String(visa.processing_fee),
    govFee: String(visa.gov_fee),
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

  const onChange = (key: keyof ReturnType<typeof buildInitial>, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const numberOfEntries = Number(form.numberOfEntries)
    const maxStay = Number(form.maxStay)
    const processingFee = Number(form.processingFee)
    const govFee = Number(form.govFee)

    startTransition(async () => {
      const result = await updateVisaType({
        id: visa.id,
        name: form.name,
        validFor: `${form.validForAmount} ${form.validForUnit}`,
        numberOfEntries,
        maxStay,
        processingFee,
        govFee,
      })

      if (!result.success) {
        setError(result.error ?? "Failed to update visa type.")
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
        className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90"
      >
        <Pencil className="size-4" />
        Edit visa
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="gap-0 p-0 sm:max-w-[480px]" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader className="border-b border-border-default px-6 py-5">
            <DialogTitle className="text-base">Edit visa type</DialogTitle>
            <DialogDescription className="text-secondary-copy">
              Update the details for {visa.name}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-5 px-6 py-5">
              <div className="space-y-1.5">
                <Label htmlFor="edit-visa-name" className="text-sm font-medium text-primary-copy">
                  Name
                </Label>
                <Input
                  id="edit-visa-name"
                  value={form.name}
                  onChange={(e) => onChange("name", e.target.value)}
                  placeholder="e.g. Tourist Visa"
                  className="h-10"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-visa-valid-amount" className="text-sm font-medium text-primary-copy">
                  Valid for
                </Label>
                <div className="flex gap-4">
                  <Input
                    id="edit-visa-valid-amount"
                    type="number"
                    value={form.validForAmount}
                    onChange={(e) => onChange("validForAmount", e.target.value)}
                    min={1}
                    className="h-10 w-1/2"
                    required
                  />
                  <Select
                    value={form.validForUnit}
                    onValueChange={(value) => onChange("validForUnit", value)}
                  >
                    <SelectTrigger className="h-10 !min-h-0 w-1/2 rounded-2xl border-border-default px-3 py-0 text-sm shadow-none pl-5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="p-0 text-sm">
                      <SelectItem className="text-sm" value="days">Days</SelectItem>
                      <SelectItem className="text-sm" value="months">Months</SelectItem>
                      <SelectItem className="text-sm" value="years">Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-visa-entries" className="text-sm font-medium text-primary-copy">
                    Number of entries
                  </Label>
                  <Input
                    id="edit-visa-entries"
                    type="number"
                    value={form.numberOfEntries}
                    onChange={(e) => onChange("numberOfEntries", e.target.value)}
                    min={-1}
                    className="h-10"
                    required
                  />
                  <p className="text-xs text-secondary-copy">Use -1 for multiple</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-visa-max-stay" className="text-sm font-medium text-primary-copy">
                    Max stay (days)
                  </Label>
                  <Input
                    id="edit-visa-max-stay"
                    type="number"
                    value={form.maxStay}
                    onChange={(e) => onChange("maxStay", e.target.value)}
                    min={1}
                    className="h-10"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-visa-processing-fee" className="text-sm font-medium text-primary-copy">
                    Processing fee
                  </Label>
                  <Input
                    id="edit-visa-processing-fee"
                    type="number"
                    step="0.01"
                    min={0}
                    value={form.processingFee}
                    onChange={(e) => onChange("processingFee", e.target.value)}
                    className="h-10"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-visa-gov-fee" className="text-sm font-medium text-primary-copy">
                    Gov fee
                  </Label>
                  <Input
                    id="edit-visa-gov-fee"
                    type="number"
                    step="0.01"
                    min={0}
                    value={form.govFee}
                    onChange={(e) => onChange("govFee", e.target.value)}
                    className="h-10"
                    required
                  />
                </div>
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
