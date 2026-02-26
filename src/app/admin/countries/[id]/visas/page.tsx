import Link from "next/link"
import { notFound } from "next/navigation"
import { fetchCountryById } from "@/actions/countries"
import { CountryFlag } from "@/components/ui/country-flag"
import { CountryVisasActions } from "./_components/country-visas-actions"
import {
  ChevronLeft,
  Plus,
  FileText,
  CalendarDays,
  DoorOpen,
  Clock,
} from "lucide-react"
import { getAllVisaTypesForDestination } from "@/actions/visas"
import { VisaStatusToggle } from "@/app/admin/visas/_components/visa-status-toggle"

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

        <Link
          href={`/admin/countries/${id}/visas/new`}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark/70"
        >
          <Plus className="size-4" />
          Create visa
        </Link>
      </div>

      {/* Content */}
      {visas.data?.length === 0 ? (
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
          <Link
            href={`/admin/countries/${id}/visas/new`}
            className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark/70"
          >
            <Plus className="size-4" />
            Create visa
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border-default bg-white shadow-sm">
          {/* Table header info */}
          <div className="flex items-center justify-between border-b border-border-default px-5 py-3">
            <p className="text-sm font-medium text-secondary-copy">
              {visas.data?.length} {visas.data?.length === 1 ? "visa" : "visas"}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-default bg-bg-light-grey/80">
                  <th className="w-12 py-3 pl-5 pr-2 text-left text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                    #
                  </th>
                  <th className="py-3 pr-2 text-left text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                    Visa type
                  </th>
                  <th className="py-3 pr-2 text-left text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                    Valid for
                  </th>
                  <th className="py-3 pr-2 text-left text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                    Entries / Max stay
                  </th>
                  <th className="py-3 pr-2 text-left text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                    Status
                  </th>
                  <th className="w-28 py-3 pr-5 text-right text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border-default/60">
                {visas.data?.map((visa, index) => (
                  <tr
                    key={visa.id}
                    className="group transition-colors hover:bg-primary/[0.02]"
                  >
                    <td className="w-12 py-3.5 pl-5 pr-2 text-xs tabular-nums text-secondary-copy">
                      {index + 1}
                    </td>

                    <td className="py-3.5 pr-2">
                      <Link
                        href={`/admin/visas/${visa.id}`}
                        className="font-medium text-primary-copy transition-colors hover:text-primary"
                      >
                        {visa.name}
                      </Link>
                    </td>

                    <td className="py-3.5 pr-2">
                      <div className="flex items-center gap-1.5 text-secondary-copy">
                        <CalendarDays className="size-3.5 shrink-0 opacity-50" />
                        {visa.valid_for}
                      </div>
                    </td>

                    <td className="py-3.5 pr-2">
                      <div className="flex items-center gap-3 text-secondary-copy">
                        <span className="inline-flex items-center gap-1.5">
                          <DoorOpen className="size-3.5 shrink-0 opacity-50" />
                          {visa.number_of_entries === -1
                            ? "Multiple"
                            : visa.number_of_entries}
                        </span>
                        <span className="text-border-default">/</span>
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="size-3.5 shrink-0 opacity-50" />
                          {visa.max_stay} days
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 pr-2">
                      <VisaStatusToggle
                        visaId={visa.id}
                        visaName={visa.name}
                        isDisabled={visa.is_disabled}
                      />
                    </td>

                    <td className="w-28 py-3.5 pr-5 text-right">
                      <CountryVisasActions visa={visa} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
