import Link from "next/link"
import { notFound } from "next/navigation"
import { fetchVisaById } from "@/actions/visas"
import { fetchProductsByVisaType } from "@/actions/products"
import { fetchAllCountriesList, fetchCountries } from "@/actions/countries"
import { CountryFlag } from "@/components/ui/country-flag"
import { VisaStatusToggle } from "../_components/visa-status-toggle"
import { AddCountriesModal } from "../_components/add-countries-modal"
import { EditVisaModal } from "../_components/edit-visa-modal"
import { NationalitiesTable } from "../_components/nationalities-table"
import {
  ChevronLeft,
  CalendarDays,
  DoorOpen,
  Clock,
  Globe,
  ExternalLink,
  FileText,
  Users,
} from "lucide-react"


export default async function VisaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [visa, productsRes, countriesRes] = await Promise.all([
    fetchVisaById(Number(id)),
    fetchProductsByVisaType(Number(id)),
    fetchAllCountriesList(),
  ])
  if (!visa.data) notFound()

  const v = visa.data
  const countryName = v.destination_country_data?.name ?? v.destination_country
  const products = productsRes.data ?? []
  const allCountries = countriesRes.data ?? []
  const currentNationalityIds = products
    .map((p) => p.visa_rule?.nationality)
    .filter(Boolean) as string[]

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Link
        href={`/admin/countries/${v.destination_country}/visas`}
        className="inline-flex items-center gap-1.5 text-sm text-secondary-copy transition-colors hover:text-primary"
      >
        <ChevronLeft className="size-4" />
        Back to {countryName} visas
      </Link>

      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center overflow-hidden rounded-xl border border-border-default bg-white shadow-sm">
            <CountryFlag
              code={v.destination_country}
              className="size-10 shrink-0 rounded"
              round={false}
            />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-primary-copy">
              {v.name}
            </h1>
            <Link
              href={`/admin/countries/${v.destination_country}`}
              className="mt-0.5 inline-flex items-center gap-1 text-sm text-secondary-copy transition-colors hover:text-primary"
            >
              {countryName}
              <ExternalLink className="size-3 opacity-50" />
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <EditVisaModal visa={v} />
          <Link
            href={`/admin/countries/${v.destination_country}/visas`}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-border-default bg-white px-5 text-sm font-semibold text-primary-copy shadow-sm transition-all hover:border-primary/40 hover:text-primary"
          >
            <FileText className="size-4" />
            All visas for {countryName}
          </Link>
        </div>
      </div>


      {/* Details */}
      <div className="rounded-xl border border-border-default bg-white shadow-sm">
        <div className="divide-y divide-border-default/60">
          <DetailRow isFirst label="Valid for">{v.valid_for}</DetailRow>
          <DetailRow label="Number of entries">
            {v.number_of_entries === -1 ? "Multiple" : v.number_of_entries}
          </DetailRow>
          <DetailRow label="Max stay">{v.max_stay} days</DetailRow>
          <DetailRow label="Processing fee">${v.processing_fee}</DetailRow>
          <DetailRow label="Gov fee">${v.gov_fee}</DetailRow>
          <DetailRow label="Status">
            <VisaStatusToggle
              visaId={v.id}
              visaName={v.name}
              isDisabled={v.is_disabled}
            />
          </DetailRow>
          <DetailRow label="Created">
            {new Date(v.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </DetailRow>

          <DetailRow isLast label="Last updated">
            {new Date(v.updated_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </DetailRow>
        </div>
      </div>

      {/* Allowed countries */}
      <div className="overflow-hidden rounded-xl border border-border-default bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-border-default px-5 py-3">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-secondary-copy" />
            <p className="text-sm font-medium text-primary-copy">
              Allowed nationalities
            </p>
            <span className="rounded-full bg-bg-light-grey px-2 py-0.5 text-xs font-medium text-secondary-copy">
              {products.length}
            </span>
          </div>
          <AddCountriesModal
            visaTypeId={v.id}
            visaName={v.name}
            destinationCountry={v.destination_country}
            allCountries={allCountries}
            currentNationalityIds={currentNationalityIds}
          />
        </div>

        <NationalitiesTable
          products={products}
          visaTypeId={v.id}
          isVisaDisabled={v.is_disabled}
          defaultProcessingFee={v.processing_fee}
          defaultGovFee={v.gov_fee}
        />
      </div>
    </div>
  )
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border-default bg-white p-4 shadow-sm">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/5">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-secondary-copy">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-primary-copy">{value}</p>
      </div>
    </div>
  )
}

function DetailRow({
  label,
  children,
  isFirst = false,
  isLast = false,
}: {
  label: string
  children: React.ReactNode
  isFirst?: boolean
  isLast?: boolean
}) {
  const roundedClass =
    isFirst && isLast
      ? "rounded-xl"
      : isFirst
        ? "rounded-t-xl"
        : isLast
          ? "rounded-b-xl"
          : ""
  return (
    <div
      className={`flex items-center justify-between px-5 py-3 hover:bg-black/10 ${roundedClass}`}
    >
      <span className="text-sm text-secondary-copy">{label}</span>
      <span className="text-sm font-medium text-primary-copy">{children}</span>
    </div>
  )
}
