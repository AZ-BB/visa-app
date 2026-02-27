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
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
    NOT_STARTED: "Not Started",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    REJECTED: "Rejected",
};

const STATUS_STYLES: Record<string, string> = {
    NOT_STARTED: "bg-slate-100 text-slate-700 border-2 border-slate-200",
    IN_PROGRESS: "bg-amber-100 text-amber-800 border-2 border-amber-200",
    COMPLETED: "bg-emerald-100 text-emerald-800 border-2 border-emerald-200",
    REJECTED: "bg-red-100 text-red-800 border-2 border-red-200",
};

type ApplicationWithRelations = {
    id: string;
    status: string;
    price: number;
    turnaround_time_cost: number;
    contact_email: string;
    arrival_date: string;
    products?: {
        visa_types?: {
            name: string;
            countries?: { id?: string; name: string };
        };
    };
    turnaround_times?: { name?: string };
    travellers?: Array<{
        first_name: string;
        last_name: string;
        date_of_birth: string;
        nationality: string;
        country_of_birth: string;
        country_of_residence: string;
        passport_number: string;
        passport_expiry_date: string;
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
}: {
    params: Promise<{ id: string }>;
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
            products(
                visa_types(
                    name,
                    countries(id, name)
                )
            ),
            turnaround_times(name),
            travellers(*)
        `
        )
        .eq("id", id)
        .eq("profile_id", user.authUser.id)
        .single();

    const application: ApplicationWithRelations | null = data as ApplicationWithRelations | null;

    if (!application) {
        notFound();
    }

    const destinationName =
        (application?.products as { visa_types?: { countries?: { name: string } } } | null)
            ?.visa_types?.countries?.name ?? "—";

    const destinationCountryCode =
        (application?.products as { visa_types?: { countries?: { id?: string } } } | null)
            ?.visa_types?.countries?.id ?? null;

    const visaTypeName =
        (application?.products as { visa_types?: { name: string } } | null)
            ?.visa_types?.name ?? "—";

    const turnaroundTimeName = application?.turnaround_times?.name ?? "—";

    const totalCost =
        (application?.price ?? 0) + (application?.turnaround_time_cost ?? 0);

    const travellers = application?.travellers ?? [];

    return (
        <div className="min-h-screen bg-bg-light-grey pt-6 sm:pt-12 pb-12 px-6">
            <div className="max-w-3xl mx-auto">
                <Link
                    href="/applications"
                    className="inline-flex items-center gap-2 text-primary-copy hover:text-primary font-medium mb-8 transition-colors"
                >
                    <ArrowLeft className="size-5" aria-hidden />
                    Back to applications
                </Link>

                <div className="space-y-6">
                    {/* Header card */}
                    <Card className="border-border-default/50 bg-white">
                        <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3 min-w-0">
                                    {destinationCountryCode && (
                                        <CountryFlag
                                            code={destinationCountryCode}
                                            className="h-10 w-10 shrink-0"
                                        />
                                    )}
                                    <div>
                                        <h1 className="text-2xl font-bold text-primary-copy">
                                            {destinationName}
                                        </h1>
                                        <p className="text-secondary-copy text-sm mt-0.5">
                                            {visaTypeName}
                                        </p>
                                    </div>
                                </div>
                                <span
                                    className={cn(
                                        "shrink-0 rounded-full px-3 py-1.5 text-sm font-medium",
                                        STATUS_STYLES[application.status] ??
                                            STATUS_STYLES.NOT_STARTED
                                    )}
                                >
                                    {STATUS_LABELS[application.status] ??
                                        application.status}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-0">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-secondary-copy text-sm">
                                        Contact email
                                    </p>
                                    <p className="font-medium text-primary-copy">
                                        {application.contact_email}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-secondary-copy text-sm">
                                        Arrival date
                                    </p>
                                    <p className="font-medium text-primary-copy">
                                        {formatDate(application.arrival_date)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-secondary-copy text-sm">
                                        Turnaround time
                                    </p>
                                    <p className="font-medium text-primary-copy">
                                        {turnaroundTimeName}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-secondary-copy text-sm">
                                        Total cost
                                    </p>
                                    <p className="font-semibold text-primary-copy">
                                        £{totalCost.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Travellers card */}
                    <Card className="border-border-default/50 bg-white">
                        <CardHeader>
                            <CardTitle className="text-lg">
                                Travellers ({travellers.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-0">
                            {travellers.map((traveller, index) => (
                                <div
                                    key={index}
                                    className="rounded-xl border border-border-default/50 p-4 space-y-3"
                                >
                                    <h3 className="font-semibold text-primary-copy">
                                        {traveller.first_name}{" "}
                                        {traveller.last_name}
                                    </h3>
                                    <div className="grid gap-2 sm:grid-cols-2 text-sm">
                                        <div>
                                            <span className="text-secondary-copy">
                                                Date of birth:{" "}
                                            </span>
                                            <span className="text-primary-copy">
                                                {formatDate(
                                                    traveller.date_of_birth
                                                )}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-secondary-copy">
                                                Nationality:{" "}
                                            </span>
                                            <span className="text-primary-copy">
                                                {getCountryNameFromCode(
                                                    traveller.nationality
                                                )}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-secondary-copy">
                                                Country of birth:{" "}
                                            </span>
                                            <span className="text-primary-copy">
                                                {getCountryNameFromCode(
                                                    traveller.country_of_birth
                                                )}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-secondary-copy">
                                                Country of residence:{" "}
                                            </span>
                                            <span className="text-primary-copy">
                                                {getCountryNameFromCode(
                                                    traveller.country_of_residence
                                                )}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-secondary-copy">
                                                Passport number:{" "}
                                            </span>
                                            <span className="text-primary-copy font-mono">
                                                {traveller.passport_number}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-secondary-copy">
                                                Passport expiry:{" "}
                                            </span>
                                            <span className="text-primary-copy">
                                                {formatDate(
                                                    traveller.passport_expiry_date
                                                )}
                                            </span>
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
