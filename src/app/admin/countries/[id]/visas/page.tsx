import Link from "next/link"
import { notFound } from "next/navigation"
import { fetchCountryById } from "@/actions/countries"
import { CountryFlag } from "@/components/ui/country-flag"
import { VisaTypesTable } from "./_components/visa-types-table"
import { CreateVisaTypeModal } from "./_components/create-visa-type-modal"
import {
  ChevronLeft,
  FileText,
} from "lucide-react"
import { getAllVisaTypesForDestination } from "@/actions/visas"

export default async function CountryVisasPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [country, visas] = await Promise.all([
    fetchCountryById(id),
    getAllVisaTypesForDestination(id),
  ])

  if (!country) notFound()

  const allVisas = visas.data ?? []

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Link
        href={`/admin/countries/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-secondary-copy transition-colors hover:text-primary"
      >
        <ChevronLeft className="size-4" />
        Back to {country.data?.name}
      </Link>

      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center overflow-hidden rounded-xl border border-border-default bg-white shadow-sm">
            <CountryFlag
              code={country.data?.id ?? ""}
              className="size-10 shrink-0 rounded"
              round={false}
            />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-primary-copy">
              Visas for {country.data?.name}
            </h1>
            <p className="mt-0.5 text-sm text-secondary-copy">
              Manage all visa types for this destination
            </p>
          </div>
        </div>

        <CreateVisaTypeModal
          countryId={id}
          countryName={country.data?.name ?? ""}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark/70"
        />
      </div>

      {/* Content */}
      {allVisas.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border-default bg-white px-6 py-20 text-center shadow-sm">
          <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/5 text-secondary-copy">
            <FileText className="size-6" />
          </div>
          <h3 className="text-sm font-semibold text-primary-copy">
            No visas yet
          </h3>
          <p className="mt-1 max-w-xs text-sm text-secondary-copy">
            Create your first visa type for {country.data?.name} to get started.
          </p>
          <CreateVisaTypeModal
            countryId={id}
            countryName={country.data?.name ?? ""}
            className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark/70"
          />
        </div>
      ) : (
        <VisaTypesTable visas={allVisas} countryId={id} />
      )}
    </div>
  )
}
