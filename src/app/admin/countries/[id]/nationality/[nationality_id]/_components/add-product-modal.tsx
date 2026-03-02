"use client"

import { useState, useMemo, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Plus,
  Search,
  Check,
  Loader2,
  FileText,
  ExternalLink,
} from "lucide-react"
import { addAllowedNationalities } from "@/actions/products"
import type { VisaType } from "@/actions/visas"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface AddProductModalProps {
  destinationCountry: string
  nationalityId: string
  visaTypes: VisaType[]
  existingVisaTypeIds: number[]
}

export function AddProductModal({
  destinationCountry,
  nationalityId,
  visaTypes,
  existingVisaTypeIds,
}: AddProductModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const existingSet = useMemo(() => new Set(existingVisaTypeIds), [existingVisaTypeIds])

  const available = useMemo(() => {
    return visaTypes.filter((v) => !existingSet.has(v.id) && !v.is_disabled)
  }, [visaTypes, existingSet])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return available
    return available.filter((v) => v.name.toLowerCase().includes(q))
  }, [available, search])

  const toggleVisa = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleAdd = () => {
    if (selected.size === 0) return
    setError(null)

    startTransition(async () => {
      const results = await Promise.allSettled(
        Array.from(selected).map((visaTypeId) =>
          addAllowedNationalities({
            visaTypeId,
            destinationCountry,
            nationalityIds: [nationalityId],
          })
        )
      )

      const failures = results.filter((r) => r.status === "rejected" || (r.status === "fulfilled" && !r.value.success))
      if (failures.length === results.length) {
        const first = results.find((r) => r.status === "fulfilled" && !r.value.success) as
          | PromiseFulfilledResult<{ success: false; error?: string }> | undefined
        setError(first?.value?.error ?? "Failed to add products.")
        return
      }

      setOpen(false)
      setSelected(new Set())
      setSearch("")
      setError(null)
      router.refresh()
    })
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSelected(new Set())
      setSearch("")
      setError(null)
    }
    setOpen(isOpen)
  }

  return (
    <>
      <Button
        size="sm"
        className="h-8 gap-1.5 bg-primary text-xs text-white hover:bg-primary-dark/70"
        onClick={() => setOpen(true)}
      >
        <Plus className="size-3.5" />
        Add visa
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="gap-0 p-0 sm:max-w-lg" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader className="border-b border-border-default px-6 py-5">
            <DialogTitle className="text-base">Add visa product</DialogTitle>
            <DialogDescription className="text-secondary-copy">
              Select visa types to add for this country pair.
            </DialogDescription>
          </DialogHeader>

          <div className="border-b border-border-default px-6 py-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-secondary-copy" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search visa types..."
                className="h-9 w-full rounded-lg border border-border-default bg-bg-light-grey/50 pl-9 pr-3 text-sm text-primary-copy placeholder:text-secondary-copy/60 outline-none transition-colors focus:border-primary/40 focus:bg-white"
              />
            </div>
          </div>

          <div className="max-h-[320px] overflow-y-auto">
            {available.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-primary/5 text-secondary-copy">
                  <FileText className="size-4" />
                </div>
                <p className="text-sm font-medium text-primary-copy">All visa types added</p>
                <p className="mt-1 text-xs text-secondary-copy">
                  Every available visa type for this destination already has been added.
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                <p className="text-sm text-secondary-copy">
                  No visa types matching &ldquo;{search}&rdquo;
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border-default/60">
                {filtered.map((visa) => {
                  const isSelected = selected.has(visa.id)
                  return (
                    <button
                      key={visa.id}
                      type="button"
                      onClick={() => toggleVisa(visa.id)}
                      className={cn(
                        "flex w-full items-center gap-3 px-6 py-3 text-left transition-colors",
                        isSelected
                          ? "bg-primary/5"
                          : "hover:bg-bg-light-grey/50"
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
                        {isSelected && <Check className="size-3" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-primary-copy">
                          {visa.name}
                        </p>
                        <p className="text-xs text-secondary-copy">
                          ${visa.processing_fee} processing · ${visa.gov_fee} gov fee · {visa.valid_for}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Create new visa type link */}
          <div className="border-t border-border-default/60 px-6 py-3">
            <Link
              href={`/admin/countries/${destinationCountry}/visas?create=true`}
              className="inline-flex items-center gap-1.5 text-sm text-secondary-copy transition-colors hover:text-primary"
            >
              <Plus className="size-3.5" />
              Or create a new visa type
              <ExternalLink className="size-3 opacity-50" />
            </Link>
          </div>

          {error && (
            <div className="border-t border-border-default px-6 py-3">
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                {error}
              </p>
            </div>
          )}

          <DialogFooter className="border-t border-border-default px-6 py-4">
            <div className="flex w-full items-center justify-between">
              <p className="text-xs text-secondary-copy">
                {selected.size > 0
                  ? `${selected.size} visa ${selected.size === 1 ? "type" : "types"} selected`
                  : `${available.length} available`}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={isPending}
                  className="h-9"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleAdd}
                  disabled={isPending || selected.size === 0}
                  className="h-9"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    `Add ${selected.size || ""} ${selected.size === 1 ? "visa" : "visas"}`
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
