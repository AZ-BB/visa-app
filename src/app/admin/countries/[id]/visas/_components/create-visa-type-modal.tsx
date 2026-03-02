"use client"

import { useState, useTransition, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface CreateVisaTypeModalProps {
  countryId: string
  countryName: string
  className?: string
}

const initialForm = {
  name: "",
  validForAmount: "90",
  validForUnit: "days" as "days" | "months" | "years",
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
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState(initialForm)

  useEffect(() => {
    if (searchParams.get("create") === "true") {
      setOpen(true)
    }
  }, [searchParams])

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
        validFor: `${form.validForAmount} ${form.validForUnit}`,
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
        <DialogContent className="gap-0 p-0 sm:max-w-[480px]">
          <DialogHeader className="border-b border-border-default px-6 py-5">
            <DialogTitle className="text-base">Create visa type</DialogTitle>
            <DialogDescription className="text-secondary-copy">
              Add a new visa type for {countryName}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-5 px-6 py-5">
              <div className="space-y-1.5">
                <Label htmlFor="visa-name" className="text-sm font-medium text-primary-copy">
                  Name
                </Label>
                <Input
                  id="visa-name"
                  value={form.name}
                  onChange={(e) => onChange("name", e.target.value)}
                  placeholder="e.g. Tourist Visa"
                  className="h-10"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="visa-valid-amount" className="text-sm font-medium text-primary-copy">
                  Valid for
                </Label>
                <div className="flex gap-4">
                  <Input
                    id="visa-valid-amount"
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
                  <Label htmlFor="visa-entries" className="text-sm font-medium text-primary-copy">
                    Number of entries
                  </Label>
                  <Input
                    id="visa-entries"
                    type="number"
                    value={form.numberOfEntries}
                    onChange={(e) => onChange("numberOfEntries", e.target.value)}
                    min={1}
                    className="h-10"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="visa-max-stay" className="text-sm font-medium text-primary-copy">
                    Max stay (days)
                  </Label>
                  <Input
                    id="visa-max-stay"
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
                  <Label htmlFor="visa-processing-fee" className="text-sm font-medium text-primary-copy">
                    Processing fee
                  </Label>
                  <Input
                    id="visa-processing-fee"
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
                  <Label htmlFor="visa-gov-fee" className="text-sm font-medium text-primary-copy">
                    Gov fee
                  </Label>
                  <Input
                    id="visa-gov-fee"
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
