import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ChevronLeft,
  ExternalLink,
  Mail,
  Users,
  CreditCard,
  CalendarDays,
  Globe,
  FileText,
  Clock,
  DoorOpen,
  Timer,
  Plane,
  Hash,
} from "lucide-react"
import { getApplication, getApplicationActivityLogs } from "@/actions/applications"
import { getAdmins, getCurrentAdmin } from "@/actions/admins"
import { StatusDropdown } from "./_components/StatusDropdown"
import { AssigneeDropdown } from "../_components/AssigneeDropdown"
import { RefundButton } from "./_components/RefundButton"
import { EditApplicationButton } from "./_components/EditApplicationButton"
import { DeleteApplicationButton } from "./_components/DeleteApplicationButton"
import { ActivityTimeline } from "./_components/ActivityTimeline"
import { CountryFlag } from "@/components/ui/country-flag"
import { getCountryNameFromCode } from "@/lib/contries-name"
import { cn } from "@/lib/utils"
import { ApplicationStatus } from "@/enums"
import type { Application } from "@/actions/applications"
import { Tables } from "@/database.types"

type TravellerWithProduct = Tables<"travellers"> & {
  product: Tables<"products">
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  } catch {
    return dateStr
  }
}

function formatDateTime(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return dateStr
  }
}

function StatCard({
  icon,
  label,
  value,
  valueClassName,
}: {
  icon: React.ReactNode
  label: string
  value: string
  valueClassName?: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border-default bg-white p-4 shadow-sm">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/5">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-secondary-copy">{label}</p>
        <p className={cn("mt-0.5 truncate text-sm font-semibold", valueClassName ?? "text-primary-copy")}>
          {value}
        </p>
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

export default async function AdminApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [res, adminsRes, currentAdminRes, logsRes] = await Promise.all([
    getApplication(id),
    getAdmins(1, 200, { sort: "first_name", order: "asc" }),
    getCurrentAdmin(),
    getApplicationActivityLogs(id),
  ])
  const application: Application | null =
    res.status && res.data ? res.data : null

  if (!application) notFound()

  const admins =
    adminsRes.status && adminsRes.data ? adminsRes.data.admins : []
  const currentAdmin = currentAdminRes.status && currentAdminRes.data ? currentAdminRes.data : null
  const activityLogs = logsRes.status && logsRes.data ? logsRes.data : []
  const canEdit =
    currentAdmin?.role === "SUPER_ADMIN" || currentAdmin?.role === "SUPERVISOR"


  const destinationCountry = application.destination_country
  const visaType = application.visa_type
  const tt =
    application.turnaround_time ??
    ((application as Record<string, unknown>).turnaround_times as typeof application.turnaround_time)
  const travellers = (application.travellers ?? []) as unknown as TravellerWithProduct[]

  const totalCost = application.total_fee ?? 0
  const turnaroundFee = application.turnaround_fee ?? 0
  const govFeeTotal = application.gov_fee ?? 0
  const processingFeeTotal = application.processing_fee ?? 0
  const amountPaidCents = application.amount_paid_cents ?? null
  const amountPaidDollars = amountPaidCents != null ? amountPaidCents / 100 : null
  const showPaidAmountCard =
    amountPaidDollars != null &&
    application.is_paid &&
    Math.abs(amountPaidDollars - totalCost) > 0.001

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/admin/applications"
        className="inline-flex items-center gap-1.5 text-sm text-secondary-copy transition-colors hover:text-primary"
      >
        <ChevronLeft className="size-4" />
        Back to applications
      </Link>

      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center overflow-hidden rounded-xl border border-border-default bg-white shadow-sm">
            <CountryFlag
              code={destinationCountry.id}
              className="size-10 shrink-0 rounded"
              round={false}
            />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-primary-copy">
              {destinationCountry.name} — {visaType.name}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-secondary-copy">
              <Link
                href={`/admin/countries/${destinationCountry.id}`}
                className="inline-flex items-center gap-1 transition-colors hover:text-primary"
              >
                <Globe className="size-3" />
                {destinationCountry.name}
                <ExternalLink className="size-3 opacity-50" />
              </Link>
              <span className="opacity-30">·</span>
              <Link
                href={`/admin/visas/${visaType.id}`}
                className="inline-flex items-center gap-1 transition-colors hover:text-primary"
              >
                <FileText className="size-3" />
                {visaType.name}
                <ExternalLink className="size-3 opacity-50" />
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <DeleteApplicationButton
            applicationId={application.id}
            canEdit={canEdit}
            isDeleted={!!(application as { deleted_at?: string | null }).deleted_at}
          />
          <EditApplicationButton application={application} canEdit={canEdit} />
          {application.is_paid &&
            application.stripe_payment_intent_id &&
            Math.round(totalCost * 100) - (application.amount_refunded_cents ?? 0) >= 50 && (
              <div className="flex flex-col gap-1">
                <RefundButton
                  applicationId={application.id}
                  totalFee={totalCost}
                  amountRefundedCents={application.amount_refunded_cents ?? 0}
                  stripePaymentIntentId={application.stripe_payment_intent_id}
                  isPaid={application.is_paid ?? false}
                />
              </div>
            )}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-secondary-copy">Status</span>
            <StatusDropdown
              applicationId={application.id}
              status={application.status as ApplicationStatus}
              amountRefundedCents={application.amount_refunded_cents ?? 0}
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-secondary-copy">Assigned to</span>
            <AssigneeDropdown
              applicationId={application.id}
              assignedToId={application.assigned_to ?? null}
              admins={admins}
              className="w-44"
            />
          </div>
        </div>
      </div>

      {/* Quick stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Mail className="size-4 text-primary" />}
          label="Contact email"
          value={application.contact_email}
        />
        <StatCard
          icon={<Plane className="size-4 text-primary" />}
          label="Arrival date"
          value={formatDate(application.arrival_date)}
        />
        <StatCard
          icon={<CalendarDays className="size-4 text-primary" />}
          label="Submitted"
          value={formatDateTime(application.created_at)}
        />
        <StatCard
          icon={<CreditCard className="size-4 text-primary" />}
          label="Total cost"
          value={`$${totalCost.toFixed(2)}`}
        />
        {(application.amount_refunded_cents ?? 0) > 0 && (
          <StatCard
            icon={<CreditCard className="size-4 text-orange-600" />}
            label="Refunded"
            value={`$${((application.amount_refunded_cents ?? 0) / 100).toFixed(2)}`}
            valueClassName="text-orange-600"
          />
        )}
        {showPaidAmountCard && (
          <StatCard
            icon={<CreditCard className="size-4 text-amber-600" />}
            label="Amount paid (client paid this)"
            value={`$${amountPaidDollars!.toFixed(2)}`}
            valueClassName="text-amber-600"
          />
        )}
      </div>

      {/* Main 3-col grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Left: 2 cols ── */}
        <div className="space-y-6 lg:col-span-2">
          {/* Visa details */}
          <div className="overflow-hidden rounded-xl border border-border-default bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-border-default px-5 py-3">
              <p className="text-sm font-medium text-primary-copy">
                Visa details
              </p>
              <Link
                href={`/admin/visas/${visaType.id}`}
                className="inline-flex items-center gap-1 text-xs text-secondary-copy transition-colors hover:text-primary"
              >
                View visa
                <ExternalLink className="size-3" />
              </Link>
            </div>
            <div className="divide-y divide-border-default/60">
              <DetailRow label="Destination country">
                <Link
                  href={`/admin/countries/${destinationCountry.id}`}
                  className="inline-flex items-center gap-2 transition-colors hover:text-primary"
                >
                  <CountryFlag
                    code={destinationCountry.id}
                    className="size-5 shrink-0 rounded shadow-sm ring-1 ring-black/5"
                    round={false}
                  />
                  {destinationCountry.name}
                  <ExternalLink className="size-3 opacity-40" />
                </Link>
              </DetailRow>
              <DetailRow label="Visa type">
                <Link
                  href={`/admin/visas/${visaType.id}`}
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-primary"
                >
                  {visaType.name}
                  <ExternalLink className="size-3 opacity-40" />
                </Link>
              </DetailRow>
              <DetailRow label="Valid for">{visaType.valid_for}</DetailRow>
              <DetailRow label="Max stay">{visaType.max_stay} days</DetailRow>
              <DetailRow label="Number of entries">
                {visaType.number_of_entries === -1
                  ? "Multiple"
                  : visaType.number_of_entries}
              </DetailRow>
              <DetailRow label="Base gov fee">
                ${Number(visaType.gov_fee).toFixed(2)}
              </DetailRow>
              <DetailRow label="Base processing fee">
                ${Number(visaType.processing_fee).toFixed(2)}
              </DetailRow>
            </div>
          </div>

          {/* Travellers */}
          <div className="overflow-hidden rounded-xl border border-border-default bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-border-default px-5 py-3">
              <Users className="size-4 text-secondary-copy" />
              <p className="text-sm font-medium text-primary-copy">
                Travellers
              </p>
              <span className="rounded-full bg-bg-light-grey px-2 py-0.5 text-xs font-medium text-secondary-copy">
                {travellers.length}
              </span>
            </div>
            <div className="divide-y divide-border-default/60">
              {travellers.map((traveller, index) => (
                <div key={traveller.id} className="space-y-5 p-5">
                  {/* Traveller header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-7 items-center justify-center rounded-full bg-primary/5 text-xs font-semibold text-primary">
                        {index + 1}
                      </span>
                      <h3 className="font-semibold text-primary-copy">
                        {traveller.first_name} {traveller.last_name}
                      </h3>
                    </div>
                    <Link
                      href={`/admin/countries/${destinationCountry.id}/nationality/${traveller.nationality}`}
                      className="inline-flex items-center gap-1 text-xs text-secondary-copy transition-colors hover:text-primary"
                    >
                      Product #{traveller.product_id}
                      <ExternalLink className="size-3 opacity-40" />
                    </Link>
                  </div>

                  {/* Info grid: 3 cols */}
                  <div className="grid gap-x-8 gap-y-4 text-sm sm:grid-cols-3">
                    {/* Personal info */}
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-secondary-copy">
                          Date of birth
                        </p>
                        <p className="mt-0.5 font-medium text-primary-copy">
                          {formatDate(traveller.date_of_birth)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-secondary-copy">
                          Passport number
                        </p>
                        <p className="mt-0.5 font-mono font-medium text-primary-copy">
                          {traveller.passport_number}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-secondary-copy">
                          Passport expiry
                        </p>
                        <p className="mt-0.5 font-medium text-primary-copy">
                          {formatDate(traveller.passport_expiry_date)}
                        </p>
                      </div>
                    </div>

                    {/* Countries */}
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-secondary-copy">
                          Nationality
                        </p>
                        <Link
                          href={`/admin/countries/${traveller.nationality}`}
                          className="mt-0.5 inline-flex items-center gap-2 transition-colors hover:text-primary"
                        >
                          <CountryFlag
                            code={traveller.nationality}
                            className="size-5 shrink-0 rounded shadow-sm ring-1 ring-black/5"
                            round={false}
                          />
                          <span className="font-medium text-primary-copy hover:text-primary">
                            {getCountryNameFromCode(traveller.nationality)}
                          </span>
                        </Link>
                      </div>
                      <div>
                        <p className="text-xs text-secondary-copy">
                          Country of birth
                        </p>
                        <Link
                          href={`/admin/countries/${traveller.country_of_birth}`}
                          className="mt-0.5 inline-flex items-center gap-2 transition-colors hover:text-primary"
                        >
                          <CountryFlag
                            code={traveller.country_of_birth}
                            className="size-5 shrink-0 rounded shadow-sm ring-1 ring-black/5"
                            round={false}
                          />
                          <span className="font-medium text-primary-copy hover:text-primary">
                            {getCountryNameFromCode(traveller.country_of_birth)}
                          </span>
                        </Link>
                      </div>
                      <div>
                        <p className="text-xs text-secondary-copy">
                          Country of residence
                        </p>
                        <Link
                          href={`/admin/countries/${traveller.country_of_residence}`}
                          className="mt-0.5 inline-flex items-center gap-2 transition-colors hover:text-primary"
                        >
                          <CountryFlag
                            code={traveller.country_of_residence}
                            className="size-5 shrink-0 rounded shadow-sm ring-1 ring-black/5"
                            round={false}
                          />
                          <span className="font-medium text-primary-copy hover:text-primary">
                            {getCountryNameFromCode(
                              traveller.country_of_residence
                            )}
                          </span>
                        </Link>
                      </div>
                    </div>

                    {/* Fees */}
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-secondary-copy">Gov fee</p>
                        <p className="mt-0.5 font-semibold tabular-nums text-primary-copy">
                          ${Number(traveller.gov_fee).toFixed(2)}
                        </p>
                        {traveller.product?.gov_fee_override != null && (
                          <p className="text-xs text-secondary-copy line-through">
                            base: ${Number(visaType.gov_fee).toFixed(2)}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-secondary-copy">
                          Processing fee
                        </p>
                        <p className="mt-0.5 font-semibold tabular-nums text-primary-copy">
                          ${Number(traveller.processing_fee).toFixed(2)}
                        </p>
                        {traveller.product?.processing_fee_override != null && (
                          <p className="text-xs text-secondary-copy line-through">
                            base: ${Number(visaType.processing_fee).toFixed(2)}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-secondary-copy">Subtotal</p>
                        <p className="mt-0.5 font-bold tabular-nums text-primary-copy">
                          $
                          {(
                            Number(traveller.gov_fee) +
                            Number(traveller.processing_fee)
                          ).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: 1 col ── */}
        <div className="space-y-6">
          {/* Invoice */}
          <div className="overflow-hidden rounded-xl border border-border-default bg-white shadow-sm">
            <div className="border-b border-border-default px-5 py-3">
              <p className="text-sm font-medium text-primary-copy">Invoice</p>
            </div>
            <div className="divide-y divide-border-default/60">
              {travellers.map((traveller) => (
                <div key={traveller.id} className="space-y-2 px-5 py-4">
                  <p className="text-xs font-semibold text-primary-copy">
                    {traveller.first_name} {traveller.last_name}
                  </p>
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-copy">Gov fee</span>
                    <span className="tabular-nums font-medium text-primary-copy">
                      ${Number(traveller.gov_fee).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-copy">Processing fee</span>
                    <span className="tabular-nums font-medium text-primary-copy">
                      ${Number(traveller.processing_fee).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-border-default/50 pt-2 text-sm">
                    <span className="text-secondary-copy">Subtotal</span>
                    <span className="tabular-nums font-semibold text-primary-copy">
                      $
                      {(
                        Number(traveller.gov_fee) +
                        Number(traveller.processing_fee)
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}

              {turnaroundFee > 0 && (
                <div className="space-y-2 px-5 py-4">
                  <p className="text-xs font-semibold text-primary-copy">
                    Turnaround
                  </p>
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-copy">
                      {tt?.name ?? "Turnaround fee"}
                    </span>
                    <span className="tabular-nums font-medium text-primary-copy">
                      ${turnaroundFee.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between px-5 py-4">
                <span className="font-bold text-primary-copy">Total</span>
                <span className="text-lg font-bold tabular-nums text-primary-copy">
                  ${totalCost.toFixed(2)}
                </span>
              </div>
              {(application as { amount_paid_cents?: number | null }).amount_paid_cents != null &&
                application.is_paid &&
                Math.abs(
                  totalCost -
                  ((application as { amount_paid_cents: number }).amount_paid_cents ?? 0) / 100
                ) > 0.001 && (
                  <div className="border-t border-border-default/50 px-5 py-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-secondary-copy">Amount paid (client paid this)</span>
                      <span className="tabular-nums font-medium text-primary-copy">
                        $
                        {(
                          ((application as { amount_paid_cents: number }).amount_paid_cents ?? 0) /
                          100
                        ).toFixed(2)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-amber-600">
                      Fees were edited after payment. Total above reflects current fees.
                    </p>
                  </div>
                )}
            </div>
          </div>

          {/* Turnaround time */}
          {tt && (
            <div className="overflow-hidden rounded-xl border border-border-default bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-border-default px-5 py-3">
                <Timer className="size-4 text-secondary-copy" />
                <p className="text-sm font-medium text-primary-copy">
                  Turnaround time
                </p>
              </div>
              <div className="divide-y divide-border-default/60">
                <DetailRow label="Plan">{tt.name}</DetailRow>
                <DetailRow label="Processing time">
                  {tt.turnaround_time_hours}h
                </DetailRow>
                <DetailRow label="Fee">
                  ${Number(tt.fee).toFixed(2)}
                </DetailRow>
              </div>
            </div>
          )}

          {/* Fee breakdown */}
          <div className="overflow-hidden rounded-xl border border-border-default bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-border-default px-5 py-3">
              <CreditCard className="size-4 text-secondary-copy" />
              <p className="text-sm font-medium text-primary-copy">
                Fee breakdown
              </p>
            </div>
            <div className="divide-y divide-border-default/60">
              <DetailRow label="Gov fees total">
                ${govFeeTotal.toFixed(2)}
              </DetailRow>
              <DetailRow label="Processing fees total">
                ${processingFeeTotal.toFixed(2)}
              </DetailRow>
              <DetailRow label="Turnaround fee">
                ${turnaroundFee.toFixed(2)}
              </DetailRow>
              <div className="flex items-center justify-between px-5 py-3">
                <span className="text-sm font-bold text-primary-copy">
                  Total
                </span>
                <span className="text-sm font-bold tabular-nums text-primary-copy">
                  ${totalCost.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Stripe */}
          {(application.stripe_checkout_session_id ||
            application.stripe_payment_intent_id) && (
              <div className="overflow-hidden rounded-xl border border-border-default bg-white shadow-sm">
                <div className="flex items-center gap-2 border-b border-border-default px-5 py-3">
                  <CreditCard className="size-4 text-secondary-copy" />
                  <p className="text-sm font-medium text-primary-copy">Stripe</p>
                </div>
                <div className="divide-y divide-border-default/60">
                  {application.stripe_checkout_session_id && (
                    <div className="px-5 py-3">
                      <p className="text-xs text-secondary-copy mb-1">
                        Checkout session ID
                      </p>
                      <p className="font-mono text-xs text-primary-copy break-all">
                        {application.stripe_checkout_session_id}
                      </p>
                    </div>
                  )}
                  {application.stripe_payment_intent_id && (
                    <div className="px-5 py-3">
                      <p className="text-xs text-secondary-copy mb-1">
                        Payment intent ID
                      </p>
                      <p className="font-mono text-xs text-primary-copy break-all">
                        {application.stripe_payment_intent_id}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* Metadata */}
          <div className="overflow-hidden rounded-xl border border-border-default bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-border-default px-5 py-3">
              <Hash className="size-4 text-secondary-copy" />
              <p className="text-sm font-medium text-primary-copy">Metadata</p>
            </div>
            <div className="divide-y divide-border-default/60">
              <div className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-secondary-copy">
                  Application ID
                </span>
                <span className="font-mono text-xs text-primary-copy">
                  {application.id.slice(0, 8)}…
                </span>
              </div>
              <DetailRow label="Submitted">
                {formatDateTime(application.created_at)}
              </DetailRow>
              <DetailRow label="Last updated">
                {formatDateTime(application.updated_at)}
              </DetailRow>
            </div>
          </div>

          {/* Activity timeline */}
          <ActivityTimeline logs={activityLogs} admins={admins} />
        </div>
      </div>
    </div>
  )
}
