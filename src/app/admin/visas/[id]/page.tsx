import Link from "next/link"
import { notFound } from "next/navigation"
import { fetchVisaById } from "@/actions/visas"
import { fetchProductsByVisaType } from "@/actions/products"
import { fetchAllCountriesList, fetchCountries } from "@/actions/countries"
import { CountryFlag } from "@/components/ui/country-flag"
import { VisaStatusToggle } from "../_components/visa-status-toggle"
import { ManageNationalitiesModal } from "../_components/manage-nationalities-modal"
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

        <Link
          href={`/admin/countries/${v.destination_country}/visas`}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-border-default bg-white px-5 text-sm font-semibold text-primary-copy shadow-sm transition-all hover:border-primary/40 hover:text-primary"
        >
          <FileText className="size-4" />
          All visas for {countryName}
        </Link>
      </div>

      {/* Info cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard
          icon={<CalendarDays className="size-5 text-primary" />}
          label="Valid for"
          value={v.valid_for}
        />
        <InfoCard
          icon={<DoorOpen className="size-5 text-primary" />}
          label="Number of entries"
          value={v.number_of_entries === -1 ? "Multiple" : String(v.number_of_entries)}
        />
        <InfoCard
          icon={<Clock className="size-5 text-primary" />}
          label="Max stay"
          value={`${v.max_stay} days`}
        />
        <div className="flex items-start gap-3 rounded-xl border border-border-default bg-white p-4 shadow-sm">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/5">
            <Globe className="size-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-secondary-copy">Status</p>
            <div className="mt-1">
              <VisaStatusToggle
                visaId={v.id}
                visaName={v.name}
                isDisabled={v.is_disabled}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Timestamps */}
      <div className="rounded-xl border border-border-default bg-white shadow-sm">
        <div className="border-b border-border-default px-5 py-3">
          <p className="text-sm font-medium text-primary-copy">Details</p>
        </div>
        <div className="divide-y divide-border-default/60">
          <DetailRow label="Destination country">
            <Link
              href={`/admin/countries/${v.destination_country}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-primary-copy transition-colors hover:text-primary"
            >
              <CountryFlag
                code={v.destination_country}
                className="size-5 shrink-0 rounded shadow-sm ring-1 ring-black/5"
                round={false}
              />
              {countryName}
            </Link>
          </DetailRow>
          <DetailRow label="Valid for">{v.valid_for}</DetailRow>
          <DetailRow label="Number of entries">
            {v.number_of_entries === -1 ? "Multiple" : v.number_of_entries}
          </DetailRow>
          <DetailRow label="Max stay">{v.max_stay} days</DetailRow>
          <DetailRow label="Processing fee">{v.processing_fee}</DetailRow>
          <DetailRow label="Gov fee">{v.gov_fee}</DetailRow>
          <DetailRow label="Status">
            <VisaStatusToggle
              visaId={v.id}
              visaName={v.name}
              isDisabled={v.is_disabled}
            />
          </DetailRow>
          {v.created_at && (
            <DetailRow label="Created">
              {new Date(v.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </DetailRow>
          )}
          {v.updated_at && (
            <DetailRow label="Last updated">
              {new Date(v.updated_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </DetailRow>
          )}
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
          <ManageNationalitiesModal
            visaTypeId={v.id}
            visaName={v.name}
            destinationCountry={v.destination_country}
            allCountries={allCountries}
            currentNationalityIds={currentNationalityIds}
          />
        </div>

        {products.length === 0 ? (
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
        ) : (
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
                  <th className="py-3 pr-2 text-left text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                    Processing fee
                  </th>
                  <th className="py-3 pr-2 text-left text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                    Gov fee
                  </th>
                  <th className="py-3 pr-2 text-left text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                    Total price
                  </th>
                  <th className="py-3 pr-5 text-left text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                    Product status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default/60">
                {products.map((product, index) => {
                  const rule = product.visa_rule
                  const natCountry = rule?.nationality_country

                  return (
                    <tr
                      key={product.id}
                      className="group transition-colors hover:bg-primary/[0.02]"
                    >
                      <td className="w-12 py-3.5 pl-5 pr-2 text-xs tabular-nums text-secondary-copy">
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
                          ${product.processing_fee_override ? Number(product.processing_fee_override).toFixed(2) : v.processing_fee}
                        </span>
                      </td>

                      <td className="py-3.5 pr-2">
                        <span className="font-medium tabular-nums text-primary-copy">
                          ${product.gov_fee_override ? Number(product.gov_fee_override).toFixed(2) : v.gov_fee}
                        </span>
                      </td>



                      <td className="py-3.5 pr-2">
                        <span className="font-medium tabular-nums text-primary-copy">
                          ${(product.gov_fee_override || v.gov_fee) + (product.processing_fee_override || v.processing_fee)}
                        </span>
                      </td>

                      <td className="py-3.5 pr-5">
                        {product.is_disabled ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-200/80">
                            <span className="size-1.5 rounded-full bg-amber-500" />
                            Disabled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200/80">
                            <span className="size-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
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
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between px-5 py-3">
      <span className="text-sm text-secondary-copy">{label}</span>
      <span className="text-sm font-medium text-primary-copy">{children}</span>
    </div>
  )
}
