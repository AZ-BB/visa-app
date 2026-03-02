"use client"

import { useState, useTransition, useMemo } from "react"
import { Search, Loader2, Plus, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CountryFlag } from "@/components/ui/country-flag"
import { addAllowedNationalities } from "@/actions/products"
import { cn } from "@/lib/utils"

interface Country {
  id: string
  name: string
}

interface AddCountriesModalProps {
  visaTypeId: number
  visaName: string
  destinationCountry: string
  allCountries: Country[]
  currentNationalityIds: string[]
}

export function AddCountriesModal({
  visaTypeId,
  visaName,
  destinationCountry,
  allCountries,
  currentNationalityIds,
}: AddCountriesModalProps) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState("")
  const [isPending, startTransition] = useTransition()

  const [overrideProcessing, setOverrideProcessing] = useState(false)
  const [processingFee, setProcessingFee] = useState("0")
  const [overrideGov, setOverrideGov] = useState(false)
  const [govFee, setGovFee] = useState("0")

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setSelected(new Set())
      setSearch("")
      setOverrideProcessing(false)
      setProcessingFee("0")
      setOverrideGov(false)
      setGovFee("0")
    }
    setOpen(isOpen)
  }

  const toggle = (countryId: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(countryId)) next.delete(countryId)
      else next.add(countryId)
      return next
    })
  }

  const available = useMemo(() => {
    const current = new Set(currentNationalityIds)
    return allCountries.filter(
      (c) => c.id !== destinationCountry && !current.has(c.id)
    )
  }, [allCountries, currentNationalityIds, destinationCountry])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return available
    return available.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
    )
  }, [search, available])

  const selectAll = () => setSelected(new Set(filtered.map((c) => c.id)))
  const deselectAll = () => setSelected(new Set())

  const handleSave = () => {
    startTransition(async () => {
      const result = await addAllowedNationalities({
        visaTypeId,
        destinationCountry,
        nationalityIds: Array.from(selected),
        processingFeeOverride: overrideProcessing ? Number(processingFee) : null,
        govFeeOverride: overrideGov ? Number(govFee) : null,
      })

      if (result.success) {
        setOpen(false)
      }
    })
  }

  return (
    <>
      <button
        onClick={() => handleOpen(true)}
        className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark/70"
      >
        <Plus className="size-4" />
        Add countries
      </button>

      <Dialog open={open} onOpenChange={handleOpen}>
        <DialogContent
          className="flex max-h-[85vh] flex-col gap-0 p-0 sm:max-w-lg"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader className="space-y-1.5 border-b border-border-default px-5 py-4">
            <DialogTitle className="text-base">Add countries</DialogTitle>
            <DialogDescription>
              Select nationalities to allow for &ldquo;{visaName}&rdquo;.
            </DialogDescription>
          </DialogHeader>

          <div className="border-b border-border-default px-5 py-3 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-secondary-copy/60" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search countries..."
                className="h-9 w-full rounded-lg border border-border-default bg-bg-light-grey pl-9 pr-3 text-sm text-primary-copy placeholder:text-secondary-copy/50 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/30"
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-secondary-copy">
                {selected.size} selected &middot; {available.length} available
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={selectAll}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Select all
                </button>
                <span className="text-xs text-border-default">|</span>
                <button
                  onClick={deselectAll}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-sm text-secondary-copy">
                  {available.length === 0
                    ? "All countries have already been added"
                    : "No countries found"}
                </p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {filtered.map((country) => {
                  const isSelected = selected.has(country.id)
                  return (
                    <button
                      key={country.id}
                      onClick={() => toggle(country.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                        isSelected
                          ? "bg-primary/5 text-primary-copy"
                          : "text-primary-copy hover:bg-bg-light-grey"
                      )}
                    >
                      <div
                        className={cn(
                          "flex size-5 shrink-0 items-center justify-center rounded border transition-colors",
                          isSelected
                            ? "border-primary bg-primary text-white"
                            : "border-border-default bg-white"
                        )}
                      >
                        {isSelected && <Check className="size-3.5" />}
                      </div>
                      <CountryFlag
                        code={country.id}
                        className="size-6 shrink-0 rounded shadow-sm ring-1 ring-black/5"
                        round={false}
                      />
                      <span className="flex-1 font-medium">{country.name}</span>
                      <span className="text-xs text-secondary-copy">{country.id}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {selected.size > 0 && (
            <div className="border-t border-border-default px-5 py-4 space-y-4">
              <p className="text-xs font-medium text-secondary-copy uppercase tracking-wider">
                Fee overrides for this batch
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="bulk-override-processing"
                    checked={overrideProcessing}
                    onChange={(e) => setOverrideProcessing(e.target.checked)}
                    className="size-4 rounded border-border-default text-primary accent-primary"
                  />
                  <Label htmlFor="bulk-override-processing" className="text-sm font-medium text-primary-copy">
                    Override processing fee
                  </Label>
                </div>
                {overrideProcessing && (
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    value={processingFee}
                    onChange={(e) => setProcessingFee(e.target.value)}
                    className="h-9"
                  />
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="bulk-override-gov"
                    checked={overrideGov}
                    onChange={(e) => setOverrideGov(e.target.checked)}
                    className="size-4 rounded border-border-default text-primary accent-primary"
                  />
                  <Label htmlFor="bulk-override-gov" className="text-sm font-medium text-primary-copy">
                    Override gov fee
                  </Label>
                </div>
                {overrideGov && (
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    value={govFee}
                    onChange={(e) => setGovFee(e.target.value)}
                    className="h-9"
                  />
                )}
              </div>
            </div>
          )}

          <DialogFooter className="border-t border-border-default px-5 py-3">
            <div className="flex w-full items-center justify-between gap-3">
              <p className="text-xs text-secondary-copy">
                {selected.size} {selected.size === 1 ? "country" : "countries"} selected
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleOpen(false)}
                  disabled={isPending}
                  className="h-9"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isPending || selected.size === 0}
                  className="h-9"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    `Add ${selected.size} ${selected.size === 1 ? "country" : "countries"}`
                  )}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
