import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getUser } from "@/lib/get-user";
import { createSupabaseServerClient } from "@/lib/supabase/supabase-server";
import { getCountryNameFromCode } from "@/lib/contries-name";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { CountryFlag } from "@/components/ui/country-flag";
import { StatusBadge } from "@/components/StatusBadge";

type ApplicationWithRelations = {
    id: string;
    status: string;
    total_fee: number;
    contact_email: string;
    arrival_date: string;
    is_paid?: boolean;
    amount_refunded_cents?: number;
    stripe_checkout_session_id?: string | null;
    destination_country?: { id?: string; name?: string };
    visa_type?: { id?: number; name?: string };
    turnaround_times?: { name?: string };
    turnaround_fee?: number;
    travellers?: Array<{
        first_name: string;
        last_name: string;
        date_of_birth: string;
        nationality: string;
        country_of_birth: string;
        country_of_residence: string;
        passport_number: string;
        passport_expiry_date: string;
        gov_fee?: number;
        processing_fee?: number;
    }>;
};

function formatDate(dateStr: string) {
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    } catch {
        return dateStr;
    }
}

export default async function ApplicationDetailPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ payment?: string }>;
}) {
    const user = await getUser();
    if (!user?.authUser?.id) {
        redirect("/login");
    }
    const { id } = await params;

    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
        .from("applications")
        .select(
            `
            *,
            destination_country:countries(id, name),
            visa_type:visa_types(id, name),
            turnaround_times(name),
            travellers(*)
        `
        )
        .eq("id", id)
        .eq("is_paid", true)
        .eq("profile_id", user.profile?.id ?? user.authUser.id)
        .single();

    const application: ApplicationWithRelations | null = data as ApplicationWithRelations | null;

    if (!application) {
        notFound();
    }

    const destinationName = application?.destination_country?.name ?? "—";
    const destinationCountryCode = application?.destination_country?.id ?? null;
    const visaTypeName = application?.visa_type?.name ?? "—";
    const turnaroundTimeName = application?.turnaround_times?.name ?? "—";
    const totalCost = application?.total_fee ?? 0;
    const turnaroundFee = application?.turnaround_fee ?? 0;

    const travellers = application?.travellers ?? [];
    const { payment } = await searchParams;
    const showPaymentSuccess = payment === "success";

    return (
        <div className="min-h-screen bg-bg-light-grey pt-6 sm:pt-12 pb-12 px-4 sm:px-6">
            {showPaymentSuccess && (
                <div className="max-w-3xl mx-auto mb-6 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-green-800">
                    Payment successful. Your application has been submitted.
                </div>
            )}
            <div className="max-w-3xl mx-auto">
                <Link
                    href="/applications"
                    className="inline-flex items-center gap-2 text-primary-copy hover:text-primary font-medium mb-6 sm:mb-8 transition-colors"
                >
                    <ArrowLeft className="size-5" aria-hidden />
                    Back to applications
                </Link>

                <div className="space-y-6">
                    {/* Header card */}
                    <Card className="rounded-2xl border-2 border-border-default/50 bg-white">
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    {destinationCountryCode && (
                                        <CountryFlag
                                            code={destinationCountryCode}
                                            className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 rounded-md"
                                            round={false}
                                        />
                                    )}
                                    <div>
                                        <h1 className="text-xl sm:text-2xl font-bold text-primary-copy">
                                            {destinationName} - {visaTypeName}
                                        </h1>
                                    </div>
                                </div>
                                <StatusBadge status={application.status} />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-0">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-secondary-copy text-sm">
                                        Contact email
                                    </p>
                                    <p className="font-semibold text-primary-copy">
                                        {application.contact_email}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-secondary-copy text-sm">
                                        Arrival date
                                    </p>
                                    <p className="font-semibold text-primary-copy">
                                        {formatDate(application.arrival_date)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-secondary-copy text-sm">
                                        Turnaround time
                                    </p>
                                    <p className="font-semibold text-primary-copy">
                                        {turnaroundTimeName}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-secondary-copy text-sm">
                                        Total cost
                                    </p>
                                    <p className="font-semibold text-primary-copy">
                                        ${totalCost.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Invoice card */}
                    <Card className="rounded-2xl border-2 border-border-default/50 bg-white">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">
                                Invoice
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-0">
                            {travellers.map((traveller, index) => {
                                const govFee = traveller.gov_fee ?? 0;
                                const proFee = traveller.processing_fee ?? 0;
                                const travellerTotal = govFee + proFee;
                                return (
                                    <div key={index} className="space-y-2">
                                        <h3 className="font-semibold text-primary-copy">
                                            {traveller.first_name}{" "}
                                            {traveller.last_name}
                                        </h3>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-secondary-copy">
                                                Gov fee
                                            </span>
                                            <span className="font-semibold text-primary-copy">
                                                ${govFee.toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-secondary-copy">
                                                Pro fee
                                            </span>
                                            <span className="font-semibold text-primary-copy">
                                                ${proFee.toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm pt-1 border-t border-border-default/50">
                                            <span className="text-secondary-copy">
                                                Subtotal
                                            </span>
                                            <span className="font-semibold text-primary-copy">
                                                ${travellerTotal.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            {turnaroundFee !== 0 && (
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-primary-copy">
                                        Additional Cost
                                    </h3>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-secondary-copy">
                                            Turnaround
                                        </span>
                                        <span className="font-semibold text-primary-copy">
                                            ${turnaroundFee.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-2 border-t-2 border-border-default">
                                <span className="text-lg font-bold text-primary-copy">
                                    Total
                                </span>
                                <span className="text-lg font-bold text-primary-copy">
                                    ${totalCost.toFixed(2)}
                                </span>
                            </div>
                            {(application.amount_refunded_cents ?? 0) > 0 && (
                                <>
                                    <div className="flex justify-between items-center pt-2 text-orange-600">
                                        <span className="font-semibold text-primary-copy">
                                            Refunded
                                        </span>
                                        <span className="font-semibold">
                                            -${((application.amount_refunded_cents ?? 0) / 100).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pt-1 text-sm">
                                        <span className="text-secondary-copy">
                                            Net amount
                                        </span>
                                        <span className="font-semibold text-primary-copy">
                                            ${(totalCost - (application.amount_refunded_cents ?? 0) / 100).toFixed(2)}
                                        </span>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Travellers card */}
                    <Card className="rounded-2xl border-2 border-border-default/50 bg-white">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">
                                Travellers ({travellers.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8 pt-0">
                            {travellers.map((traveller, index) => (
                                <div
                                    key={index}
                                    className={
                                        index > 0
                                            ? "space-y-3 pt-6 border-t border-border-default/50"
                                            : "space-y-3"
                                    }
                                >
                                    <h3 className="font-semibold text-primary-copy text-lg">
                                        {traveller.first_name}{" "}
                                        {traveller.last_name}
                                    </h3>
                                    <div className="grid gap-3 sm:grid-cols-2 text-sm">
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-secondary-copy text-xs">
                                                    Passport number
                                                </p>
                                                <p className="font-semibold text-primary-copy font-mono">
                                                    {traveller.passport_number}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-secondary-copy text-xs">
                                                    Passport expiry
                                                </p>
                                                <p className="font-semibold text-primary-copy">
                                                    {formatDate(
                                                        traveller.passport_expiry_date
                                                    )}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-secondary-copy text-xs">
                                                    Date of birth
                                                </p>
                                                <p className="font-semibold text-primary-copy">
                                                    {formatDate(
                                                        traveller.date_of_birth
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <CountryFlag
                                                    code={traveller.nationality}
                                                    className="h-6 w-6 shrink-0 rounded-md"
                                                    round={false}
                                                />
                                                <div>
                                                    <p className="text-secondary-copy text-xs">
                                                        Nationality
                                                    </p>
                                                    <p className="font-semibold text-primary-copy">
                                                        {getCountryNameFromCode(
                                                            traveller.nationality
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <CountryFlag
                                                    code={
                                                        traveller.country_of_birth
                                                    }
                                                    className="h-6 w-6 shrink-0 rounded-md"
                                                    round={false}
                                                />
                                                <div>
                                                    <p className="text-secondary-copy text-xs">
                                                        Country of birth
                                                    </p>
                                                    <p className="font-semibold text-primary-copy">
                                                        {getCountryNameFromCode(
                                                            traveller.country_of_birth
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <CountryFlag
                                                    code={
                                                        traveller.country_of_residence
                                                    }
                                                    className="h-6 w-6 shrink-0 rounded-md"
                                                    round={false}
                                                />
                                                <div>
                                                    <p className="text-secondary-copy text-xs">
                                                        Country of residence
                                                    </p>
                                                    <p className="font-semibold text-primary-copy">
                                                        {getCountryNameFromCode(
                                                            traveller.country_of_residence
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
