"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Globe, Trash2, Loader2, AlertTriangle } from "lucide-react"
import { CountryFlag } from "@/components/ui/country-flag"
import { EditProductModal } from "./edit-product-modal"
import { ProductStatusToggle } from "./product-status-toggle"
import { softDeleteProduct, bulkSoftDeleteProducts } from "@/actions/products"
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

interface Product {
  id: number
  processing_fee_override: number | null
  gov_fee_override: number | null
  is_disabled: boolean
  visa_rule: {
    id: number
    nationality: string
    nationality_country: { id: string; name: string; is_disabled: boolean } | null
  } | null
}

type SortKey = "nationality" | "processing_fee" | "gov_fee" | "total" | "override" | "status"
type SortDir = "asc" | "desc"

interface NationalitiesTableProps {
  products: Product[]
  visaTypeId: number
  isVisaDisabled: boolean
  defaultProcessingFee: number
  defaultGovFee: number
}

export function NationalitiesTable({
  products,
  visaTypeId,
  isVisaDisabled,
  defaultProcessingFee,
  defaultGovFee,
}: NationalitiesTableProps) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("nationality")
  const [sortDir, setSortDir] = useState<SortDir>("asc")
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [showBulkConfirm, setShowBulkConfirm] = useState(false)
  const [isBulkDeleting, startBulkTransition] = useTransition()

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  const getProcessingFee = (p: Product) =>
    p.processing_fee_override ? Number(p.processing_fee_override) : defaultProcessingFee

  const getGovFee = (p: Product) =>
    p.gov_fee_override ? Number(p.gov_fee_override) : defaultGovFee

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    let list = products
    if (q) {
      list = list.filter((p) => {
        const name = p.visa_rule?.nationality_country?.name ?? p.visa_rule?.nationality ?? ""
        return name.toLowerCase().includes(q)
      })
    }

    return [...list].sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case "nationality": {
          const nameA = a.visa_rule?.nationality_country?.name ?? a.visa_rule?.nationality ?? ""
          const nameB = b.visa_rule?.nationality_country?.name ?? b.visa_rule?.nationality ?? ""
          cmp = nameA.localeCompare(nameB)
          break
        }
        case "processing_fee":
          cmp = getProcessingFee(a) - getProcessingFee(b)
          break
        case "gov_fee":
          cmp = getGovFee(a) - getGovFee(b)
          break
        case "total":
          cmp = (getProcessingFee(a) + getGovFee(a)) - (getProcessingFee(b) + getGovFee(b))
          break
        case "override": {
          const oA = (a.processing_fee_override != null || a.gov_fee_override != null) ? 1 : 0
          const oB = (b.processing_fee_override != null || b.gov_fee_override != null) ? 1 : 0
          cmp = oA - oB
          break
        }
        case "status":
          cmp = Number(a.is_disabled) - Number(b.is_disabled)
          break
      }
      return sortDir === "asc" ? cmp : -cmp
    })
  }, [products, search, sortKey, sortDir, defaultProcessingFee, defaultGovFee])

  const filteredIds = useMemo(() => new Set(filtered.map((p) => p.id)), [filtered])
  const visibleSelected = useMemo(
    () => new Set([...selected].filter((id) => filteredIds.has(id))),
    [selected, filteredIds]
  )
  const allVisibleSelected = filtered.length > 0 && visibleSelected.size === filtered.length

  const toggleOne = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (allVisibleSelected) {
      setSelected((prev) => {
        const next = new Set(prev)
        for (const p of filtered) next.delete(p.id)
        return next
      })
    } else {
      setSelected((prev) => {
        const next = new Set(prev)
        for (const p of filtered) next.add(p.id)
        return next
      })
    }
  }

  const handleBulkDelete = () => {
    startBulkTransition(async () => {
      await bulkSoftDeleteProducts(Array.from(selected), visaTypeId)
      setSelected(new Set())
      setShowBulkConfirm(false)
      router.refresh()
    })
  }

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <ArrowUpDown className="size-3 opacity-40" />
    return sortDir === "asc"
      ? <ArrowUp className="size-3" />
      : <ArrowDown className="size-3" />
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-primary/5 text-secondary-copy">
          <Globe className="size-5" />
        </div>
        <p className="text-sm font-medium text-primary-copy">
          No countries configured
        </p>
        <p className="mt-1 max-w-xs text-sm text-secondary-copy">
          No products have been created for this visa type yet.
        </p>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center justify-between gap-4 border-b border-border-default bg-primary/[0.03] px-5 py-3">
          <p className="text-sm font-medium text-primary-copy">
            {selected.size} {selected.size === 1 ? "country" : "countries"} selected
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelected(new Set())}
              className="h-8 text-xs"
            >
              Clear selection
            </Button>
            <Button
              size="sm"
              className="h-8 bg-red-600 text-xs text-white hover:bg-red-700"
              onClick={() => setShowBulkConfirm(true)}
            >
              <Trash2 className="mr-1.5 size-3.5" />
              Remove {selected.size}
            </Button>
          </div>
        </div>
      )}

      {/* Search bar */}
      <div className="border-b border-border-default px-5 py-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-secondary-copy" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search nationalities..."
            className="h-9 w-full rounded-lg border border-border-default bg-bg-light-grey/50 pl-9 pr-3 text-sm text-primary-copy placeholder:text-secondary-copy/60 outline-none transition-colors focus:border-primary/40 focus:bg-white sm:max-w-xs"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
          <p className="text-sm text-secondary-copy">
            No nationalities matching &ldquo;{search}&rdquo;
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-default bg-bg-light-grey/80">
                <th className="w-10 py-3 pl-5 pr-1">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleAll}
                    className="size-4 rounded border-border-default text-primary accent-primary"
                  />
                </th>
                <th className="w-10 py-3 pr-2 text-left text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                  #
                </th>
                <SortableHeader column="nationality" label="Nationality" currentKey={sortKey} currentDir={sortDir} onToggle={toggleSort} icon={<SortIcon column="nationality" />} />
                <SortableHeader column="processing_fee" label="Processing fee" currentKey={sortKey} currentDir={sortDir} onToggle={toggleSort} icon={<SortIcon column="processing_fee" />} />
                <SortableHeader column="gov_fee" label="Gov fee" currentKey={sortKey} currentDir={sortDir} onToggle={toggleSort} icon={<SortIcon column="gov_fee" />} />
                <SortableHeader column="total" label="Total price" currentKey={sortKey} currentDir={sortDir} onToggle={toggleSort} icon={<SortIcon column="total" />} />
                <SortableHeader column="override" label="Fee override" currentKey={sortKey} currentDir={sortDir} onToggle={toggleSort} icon={<SortIcon column="override" />} />
                <SortableHeader column="status" label="Product status" currentKey={sortKey} currentDir={sortDir} onToggle={toggleSort} icon={<SortIcon column="status" />} />
                <th className="py-3 pr-5 text-right text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default/60">
              {filtered.map((product, index) => {
                const rule = product.visa_rule
                const natCountry = rule?.nationality_country
                const processingFee = getProcessingFee(product)
                const govFee = getGovFee(product)
                const isChecked = selected.has(product.id)

                return (
                  <tr
                    key={product.id}
                    className={cn(
                      "group transition-colors",
                      isChecked ? "bg-primary/[0.03]" : "hover:bg-primary/[0.02]"
                    )}
                  >
                    <td className="w-10 py-3.5 pl-5 pr-1">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleOne(product.id)}
                        className="size-4 rounded border-border-default text-primary accent-primary"
                      />
                    </td>

                    <td className="w-10 py-3.5 pr-2 text-xs tabular-nums text-secondary-copy">
                      {index + 1}
                    </td>

                    <td className="py-3.5 pr-2">
                      <div className="flex items-center gap-2.5">
                        {rule && (
                          <CountryFlag
                            code={rule.nationality}
                            className="size-6 shrink-0 rounded shadow-sm ring-1 ring-black/5"
                            round={false}
                          />
                        )}
                        <span className="font-medium text-primary-copy">
                          {natCountry?.name ?? rule?.nationality ?? "—"}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 pr-2">
                      <span className="font-medium tabular-nums text-primary-copy">
                        ${processingFee.toFixed(2)}
                      </span>
                    </td>

                    <td className="py-3.5 pr-2">
                      <span className="font-medium tabular-nums text-primary-copy">
                        ${govFee.toFixed(2)}
                      </span>
                    </td>

                    <td className="py-3.5 pr-2">
                      <span className="font-medium tabular-nums text-primary-copy">
                        ${(processingFee + govFee).toFixed(2)}
                      </span>
                    </td>

                    <td className="py-3.5 pr-2">
                      {product.processing_fee_override != null || product.gov_fee_override != null ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-200/80">
                          <span className="size-1.5 rounded-full bg-blue-500" />
                          Overridden
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-500 ring-1 ring-inset ring-gray-200/80">
                          Default
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 pr-2">
                      <ProductStatusToggle
                        productId={product.id}
                        visaTypeId={visaTypeId}
                        isDisabled={product.is_disabled}
                        isVisaDisabled={isVisaDisabled}
                      />
                    </td>

                    <td className="py-3.5 pr-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <EditProductModal
                          product={product}
                          visaTypeId={visaTypeId}
                          nationalityName={natCountry?.name ?? rule?.nationality ?? "Unknown"}
                          defaultProcessingFee={defaultProcessingFee}
                          defaultGovFee={defaultGovFee}
                        />
                        <DeleteProductButton
                          productId={product.id}
                          visaTypeId={visaTypeId}
                          nationalityName={natCountry?.name ?? rule?.nationality ?? "Unknown"}
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Bulk delete confirmation */}
      <Dialog open={showBulkConfirm} onOpenChange={setShowBulkConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-red-50 sm:mx-0">
                <AlertTriangle className="size-6 text-red-600" />
              </div>
              <DialogTitle>
                Remove {selected.size} {selected.size === 1 ? "country" : "countries"}?
              </DialogTitle>
            </div>
            <DialogDescription>
              This will remove the selected nationalities from the allowed list
              for this visa type. You can add them back later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-4 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setShowBulkConfirm(false)}
              disabled={isBulkDeleting}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={handleBulkDelete}
              disabled={isBulkDeleting}
            >
              {isBulkDeleting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Removing...
                </>
              ) : (
                `Yes, remove ${selected.size}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function DeleteProductButton({
  productId,
  visaTypeId,
  nationalityName,
}: {
  productId: number
  visaTypeId: number
  nationalityName: string
}) {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    startTransition(async () => {
      await softDeleteProduct(productId, visaTypeId)
      setShowConfirm(false)
      router.refresh()
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className="inline-flex items-center justify-center rounded-lg border border-border-default bg-white p-1.5 text-secondary-copy shadow-sm transition-all hover:border-red-300 hover:text-red-600"
      >
        <Trash2 className="size-3.5" />
      </button>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-red-50 sm:mx-0">
                <AlertTriangle className="size-6 text-red-600" />
              </div>
              <DialogTitle>Remove {nationalityName}?</DialogTitle>
            </div>
            <DialogDescription>
              This will remove {nationalityName} from the allowed nationalities
              for this visa type. You can add it back later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-4 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirm(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Removing...
                </>
              ) : (
                "Yes, remove"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function SortableHeader({
  column,
  label,
  currentKey,
  currentDir,
  onToggle,
  icon,
  isLast = false,
}: {
  column: SortKey
  label: string
  currentKey: SortKey
  currentDir: SortDir
  onToggle: (key: SortKey) => void
  icon: React.ReactNode
  isLast?: boolean
}) {
  return (
    <th className={`py-3 ${isLast ? "pr-5" : "pr-2"} text-left`}>
      <button
        type="button"
        onClick={() => onToggle(column)}
        className={`inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider transition-colors ${
          currentKey === column ? "text-primary-copy" : "text-secondary-copy hover:text-primary-copy"
        }`}
      >
        {label}
        {icon}
      </button>
    </th>
  )
}
