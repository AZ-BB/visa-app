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

// TODO: Remove when real data is available - must match applications page mock IDs
const USE_MOCK_DATA = true;

const MOCK_APPLICATIONS: Record<
    string,
    {
        id: string;
        status: string;
        price: number;
        turnaround_time_cost: number;
        contact_email: string;
        arrival_date: string;
        products: {
            visa_types: {
                name: string;
                countries: { id: string; name: string };
            };
        };
        turnaround_times: { name: string };
        travellers: Array<{
            first_name: string;
            last_name: string;
            date_of_birth: string;
            nationality: string;
            country_of_birth: string;
            country_of_residence: string;
            passport_number: string;
            passport_expiry_date: string;
        }>;
    }
> = {
    "mock-1": {
        id: "mock-1",
        status: "COMPLETED",
        price: 85,
        turnaround_time_cost: 25,
        contact_email: "john@example.com",
        arrival_date: "2025-04-15",
        products: {
            visa_types: {
                name: "Tourist eVisa",
                countries: { id: "US", name: "United States" },
            },
        },
        turnaround_times: { name: "Standard" },
        travellers: [
            {
                first_name: "John",
                last_name: "Doe",
                date_of_birth: "1990-05-20",
                nationality: "GB",
                country_of_birth: "GB",
                country_of_residence: "GB",
                passport_number: "AB1234567",
                passport_expiry_date: "2030-12-31",
            },
            {
                first_name: "Jane",
                last_name: "Doe",
                date_of_birth: "1992-08-14",
                nationality: "GB",
                country_of_birth: "GB",
                country_of_residence: "GB",
                passport_number: "AB7654321",
                passport_expiry_date: "2029-06-15",
            },
        ],
    },
    "mock-2": {
        id: "mock-2",
        status: "IN_PROGRESS",
        price: 120,
        turnaround_time_cost: 45,
        contact_email: "alex@example.com",
        arrival_date: "2025-06-01",
        products: {
            visa_types: {
                name: "Business Visa",
                countries: { id: "AR", name: "Argentina" },
            },
        },
        turnaround_times: { name: "Fast" },
        travellers: [
            {
                first_name: "Alex",
                last_name: "Smith",
                date_of_birth: "1985-03-10",
                nationality: "US",
                country_of_birth: "US",
                country_of_residence: "US",
                passport_number: "US9876543",
                passport_expiry_date: "2028-03-20",
            },
        ],
    },
    "mock-3": {
        id: "mock-3",
        status: "NOT_STARTED",
        price: 65,
        turnaround_time_cost: 15,
        contact_email: "sarah@example.com",
        arrival_date: "2025-07-20",
        products: {
            visa_types: {
                name: "Tourist Visa",
                countries: { id: "EG", name: "Egypt" },
            },
        },
        turnaround_times: { name: "Super Fast" },
        travellers: [
            {
                first_name: "Sarah",
                last_name: "Wilson",
                date_of_birth: "1995-11-25",
                nationality: "CA",
                country_of_birth: "CA",
                country_of_residence: "CA",
                passport_number: "CA1112222",
                passport_expiry_date: "2027-09-10",
            },
            {
                first_name: "Mike",
                last_name: "Wilson",
                date_of_birth: "1993-02-08",
                nationality: "CA",
                country_of_birth: "CA",
                country_of_residence: "CA",
                passport_number: "CA3334444",
                passport_expiry_date: "2026-11-30",
            },
            {
                first_name: "Emma",
                last_name: "Wilson",
                date_of_birth: "2018-07-04",
                nationality: "CA",
                country_of_birth: "CA",
                country_of_residence: "CA",
                passport_number: "CA5556666",
                passport_expiry_date: "2025-08-15",
            },
        ],
    },
    "mock-4": {
        id: "mock-4",
        status: "REJECTED",
        price: 95,
        turnaround_time_cost: 30,
        contact_email: "david@example.com",
        arrival_date: "2025-05-10",
        products: {
            visa_types: {
                name: "Transit Visa",
                countries: { id: "GB", name: "United Kingdom" },
            },
        },
        turnaround_times: { name: "Express" },
        travellers: [
            {
                first_name: "David",
                last_name: "Brown",
                date_of_birth: "1988-09-12",
                nationality: "AU",
                country_of_birth: "AU",
                country_of_residence: "AU",
                passport_number: "AU7778888",
                passport_expiry_date: "2031-01-05",
            },
        ],
    },
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

    let application: {
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
    } | null = null;

    if (USE_MOCK_DATA && MOCK_APPLICATIONS[id]) {
        application = MOCK_APPLICATIONS[id];
    } else {
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

        application = data;
    }

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
