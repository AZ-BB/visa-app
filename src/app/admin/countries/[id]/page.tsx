"use server"
import Link from "next/link"
import { notFound } from "next/navigation"
import { CountryTabs } from "./country-tabs"

import { CountryFlag } from "@/components/ui/country-flag"
import { FileText, ArrowRight, Eye, ChevronLeft, ExternalLink } from "lucide-react"
import { getAllVisaRulesForDestination, getAllVisaRulesForNationality } from "@/actions/visa_rules"
import { fetchCountryById } from "@/actions/countries"

type ViewAs = "destination" | "nationality"

export default async function CountryDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ view_as?: string }>
}) {
  const { id } = await params
  const { view_as } = await searchParams
  const resolvedView = (
    view_as === "nationality" ? "nationality" : "destination"
  ) as ViewAs

  const [countryRes, destRes, natRes] = await Promise.all([
    fetchCountryById(id),
    getAllVisaRulesForDestination(id),
    getAllVisaRulesForNationality(id),
  ])

  const country = countryRes.data
  if (!country) notFound()

  const rulesAsDestination = destRes.data ?? []
  const rulesAsNationality = natRes.data ?? []
  const rules =
    resolvedView === "destination" ? rulesAsDestination : rulesAsNationality

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Link
        href="/admin/countries"
        className="inline-flex items-center gap-1.5 text-sm text-secondary-copy transition-colors hover:text-primary"
      >
        <ChevronLeft className="size-4" />
        Back to countries
      </Link>

      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center overflow-hidden rounded-xl border border-border-default bg-white shadow-sm">
            <CountryFlag
              code={country.id}
              className="size-10 shrink-0 rounded"
              round={false}
            />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-primary-copy">
              {country.name}
            </h1>
            <p className="mt-0.5 text-sm text-secondary-copy">
              Country code: <span className="font-medium uppercase">{country.id}</span>
            </p>
          </div>
        </div>

        <Link
          href={`/admin/countries/${id}/visas`}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark/70"
        >
          <FileText className="size-4" />
          View all visas
          <ExternalLink className="size-3.5 opacity-60" />
        </Link>
      </div>

      {/* Tabs */}
      <CountryTabs currentView={resolvedView} countryId={id} />

      {/* Content */}
      {rules.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border-default bg-white px-6 py-20 text-center shadow-sm">
          <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/5 text-secondary-copy">
            <FileText className="size-6" />
          </div>
          <h3 className="text-sm font-semibold text-primary-copy">
            No visa rules found
          </h3>
          <p className="mt-1 max-w-xs text-sm text-secondary-copy">
            There are no visa rules configured for this view yet.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border-default bg-white shadow-sm">
          {/* Table header info */}
          <div className="flex items-center justify-between border-b border-border-default px-5 py-3">
            <p className="text-sm font-medium text-secondary-copy">
              {rules.length} {rules.length === 1 ? "rule" : "rules"} found
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
                    Nationality
                  </th>
                  <th className="w-10 px-0 text-center text-xs text-secondary-copy/50">
                  </th>
                  <th className="py-3 pr-2 text-left text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                    Destination
                  </th>
                  <th className="py-3 pr-2 text-left text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                    Visa Req.
                  </th>
                  <th className="py-3 pr-2 text-left text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                    Supported
                  </th>
                  <th className="w-28 py-3 pr-5 text-right text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border-default/60">
                {rules.map((rule, index) => {
                  const nationalityCountry = rule.nationality_country_data
                  const destinationCountry = rule.destination_country_data
                  const otherId =
                    resolvedView === "destination"
                      ? rule.nationality
                      : rule.destination_country

                  const isCurrentNationality = rule.nationality === id
                  const isCurrentDestination = rule.destination_country === id

                  return (
                    <tr
                      key={rule.id}
                      className="group transition-colors hover:bg-primary/[0.02]"
                    >
                      <td className="w-12 py-3.5 pl-5 pr-2 text-xs tabular-nums text-secondary-copy">
                        {index + 1}
                      </td>

                      <td className="py-3.5 pr-2">
                        <div className="flex items-center gap-2.5">
                          <CountryFlag
                            code={rule.nationality}
                            className="size-6 shrink-0 rounded shadow-sm ring-1 ring-black/5"
                            round={false}
                          />
                          <span
                            className={
                              isCurrentNationality
                                ? "font-semibold text-primary-copy"
                                : "font-medium text-primary-copy"
                            }
                          >
                            {nationalityCountry?.name ?? rule.nationality}
                          </span>
                          {isCurrentNationality && (
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                              Current
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="w-10 px-0 text-center">
                        <ArrowRight className="mx-auto size-3.5 text-secondary-copy/40" />
                      </td>

                      <td className="py-3.5 pr-2">
                        <div className="flex items-center gap-2.5">
                          <CountryFlag
                            code={rule.destination_country}
                            className="size-6 shrink-0 rounded shadow-sm ring-1 ring-black/5"
                            round={false}
                          />
                          <span
                            className={
                              isCurrentDestination
                                ? "font-semibold text-primary-copy"
                                : "font-medium text-primary-copy"
                            }
                          >
                            {destinationCountry?.name ??
                              rule.destination_country}
                          </span>
                          {isCurrentDestination && (
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                              Current
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 pr-2">
                        {rule.is_visa_required ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-200/80">
                            <span className="size-1.5 rounded-full bg-amber-500" />
                            Required
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200/80">
                            <span className="size-1.5 rounded-full bg-emerald-500" />
                            Not required
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 pr-2">
                        {rule.is_supported ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200/80">
                            <span className="size-1.5 rounded-full bg-emerald-500" />
                            Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 ring-1 ring-inset ring-red-200/80">
                            <span className="size-1.5 rounded-full bg-red-500" />
                            No
                          </span>
                        )}
                      </td>

                      <td className="w-28 py-3.5 pr-5 text-right">
                        <Link
                          href={`/admin/countries/${id}/nationality/${otherId}?view_as=${resolvedView}`}
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border-default bg-white px-3 text-xs font-medium text-primary-copy shadow-sm transition-all hover:border-primary/40 hover:text-primary group-hover:border-primary/30"
                        >
                          <Eye className="size-3.5" />
                          Visas
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
