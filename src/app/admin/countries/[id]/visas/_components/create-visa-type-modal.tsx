"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Plus } from "lucide-react"
import { createVisaTypeForDestination } from "@/actions/visas"
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

interface CreateVisaTypeModalProps {
  countryId: string
  countryName: string
  className?: string
}

const initialForm = {
  name: "",
  validFor: "",
  numberOfEntries: "1",
  maxStay: "30",
  processingFee: "0",
  govFee: "0",
}

export function CreateVisaTypeModal({
  countryId,
  countryName,
  className,
}: CreateVisaTypeModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState(initialForm)

  const reset = () => {
    setForm(initialForm)
    setError(null)
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) reset()
    setOpen(isOpen)
  }

  const onChange = (key: keyof typeof form, value: string) => {
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
      const result = await createVisaTypeForDestination({
        destinationCountry: countryId,
        name: form.name,
        validFor: form.validFor,
        numberOfEntries,
        maxStay,
        processingFee,
        govFee,
      })

      if (!result.success) {
        setError(result.error ?? "Failed to create visa type.")
        return
      }

      setOpen(false)
      reset()
      router.refresh()
    })
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        <Plus className="size-4" />
        Create visa
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create visa type</DialogTitle>
            <DialogDescription>
              Add a new visa type for {countryName}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="visa-name">Name</Label>
              <Input
                id="visa-name"
                value={form.name}
                onChange={(e) => onChange("name", e.target.value)}
                placeholder="e.g. Tourist Visa"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="visa-valid-for">Valid for</Label>
              <Input
                id="visa-valid-for"
                value={form.validFor}
                onChange={(e) => onChange("validFor", e.target.value)}
                placeholder="e.g. 90 days"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="visa-entries">Number of entries</Label>
                <Input
                  id="visa-entries"
                  type="number"
                  value={form.numberOfEntries}
                  onChange={(e) => onChange("numberOfEntries", e.target.value)}
                  min={-1}
                  required
                />
                <p className="text-xs text-secondary-copy">
                  Use -1 for multiple entries.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="visa-max-stay">Max stay (days)</Label>
                <Input
                  id="visa-max-stay"
                  type="number"
                  value={form.maxStay}
                  onChange={(e) => onChange("maxStay", e.target.value)}
                  min={1}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="visa-processing-fee">Processing fee</Label>
                <Input
                  id="visa-processing-fee"
                  type="number"
                  step="0.01"
                  min={0}
                  value={form.processingFee}
                  onChange={(e) => onChange("processingFee", e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="visa-gov-fee">Gov fee</Label>
                <Input
                  id="visa-gov-fee"
                  type="number"
                  step="0.01"
                  min={0}
                  value={form.govFee}
                  onChange={(e) => onChange("govFee", e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create visa"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
