"use server"
import Link from "next/link"
import { notFound } from "next/navigation"
import { CountryTabs } from "./country-tabs"

import { CountryFlag } from "@/components/ui/country-flag"
import { CountryStatusToggle } from "../_components/country-status-toggle"
import { VisaRulesTable } from "./_components/visa-rules-table"
import { FileText, ChevronLeft, ExternalLink } from "lucide-react"
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
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-primary-copy">
                {country.name}
              </h1>
              <CountryStatusToggle
                countryId={country.id}
                countryName={country.name}
                isDisabled={country.is_disabled}
              />
            </div>
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

      {/* Rules table */}
      <VisaRulesTable
        rules={rules}
        countryId={id}
        resolvedView={resolvedView}
      />
    </div>
  )
}
