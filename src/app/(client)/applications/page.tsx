import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/get-user";
import { createSupabaseServerClient } from "@/lib/supabase/supabase-server";
import {
    Card,
    CardContent,
    CardHeader,
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

function formatCreatedAt(dateStr: string | undefined) {
    if (!dateStr) return "—";
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    } catch {
        return "—";
    }
}

export default async function ApplicationsPage() {
    const user = await getUser();
    if (!user?.authUser?.id) {
        redirect("/login");
    }

    const supabase = await createSupabaseServerClient();

    const { data: applications } = await supabase
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
        .eq("profile_id", user.authUser.id)
        .order("created_at", { ascending: false });

    const displayApplications = applications ?? [];

    type AppItem = (typeof displayApplications)[number];

    type ProductsShape = {
        visa_types?: { name: string; countries?: { id?: string; name: string } };
    };

    const destinationName = (app: AppItem) =>
        (app?.products as ProductsShape | null)?.visa_types?.countries?.name ?? "—";

    const destinationCountryCode = (app: AppItem) =>
        (app?.products as ProductsShape | null)?.visa_types?.countries?.id ?? null;

    const visaTypeName = (app: AppItem) =>
        (app?.products as ProductsShape | null)?.visa_types?.name ?? "—";

    const travellerCount = (app: AppItem) =>
        Array.isArray((app as { travellers?: unknown[] }).travellers)
            ? (app as { travellers: unknown[] }).travellers.length
            : 0;

    const turnaroundTimeName = (app: AppItem) =>
        (app as { turnaround_times?: { name?: string } }).turnaround_times?.name ?? "—";

    const totalCost = (app: AppItem) =>
        (app?.price ?? 0) + (app?.turnaround_time_cost ?? 0);

    return (
        <div className="min-h-screen bg-bg-light-grey pt-6 sm:pt-16 pb-12 px-6">
            <div className="max-w-7xl mx-auto sm:px-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-primary-copy mb-8">
                    Applications
                </h1>

                {!displayApplications.length ? (
                    <div className="rounded-2xl border border-border-default/50 bg-white p-12 text-center shadow-sm">
                        <p className="text-secondary-copy text-lg">
                            You have no applications yet.
                        </p>
                        <p className="text-secondary-copy text-sm mt-2">
                            Start by applying for a visa from the homepage.
                        </p>
                    </div>
                ) : (
                    <div
                            className={`grid gap-4 ${displayApplications.length === 1 ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"}`}
                        >
                        {displayApplications.map((app) => (
                            <Link
                                key={app.id}
                                href={`/applications/${app.id}`}
                                className="block cursor-pointer"
                            >
                                <Card
                                    className="h-full rounded-2xl transition-colors border-2 hover:border-primary/40 hover:bg-primary/[0.02] border-border-default/50 bg-white"
                                >
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            {(() => {
                                                const code = destinationCountryCode(app);
                                                return code ? (
                                                    <CountryFlag
                                                        code={code}
                                                        className="h-8 w-8 shrink-0"
                                                        loading="lazy"
                                                    />
                                                ) : null;
                                            })()}
                                            <h2 className="text-xl font-semibold text-primary-copy truncate">
                                                {destinationName(app)}
                                            </h2>
                                        </div>
                                        <span
                                            className={cn(
                                                "shrink-0 rounded-full px-3 py-1 text-xs font-medium",
                                                STATUS_STYLES[app.status] ??
                                                STATUS_STYLES.NOT_STARTED
                                            )}
                                        >
                                            {
                                                STATUS_LABELS[app.status] ??
                                                app.status
                                            }
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-2 pt-0">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-secondary-copy">
                                            Visa type
                                        </span>
                                        <span className="font-medium text-primary-copy">
                                            {visaTypeName(app)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-secondary-copy">
                                            Travellers
                                        </span>
                                        <span className="font-medium text-primary-copy">
                                            {travellerCount(app)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-secondary-copy">
                                            Turnaround time
                                        </span>
                                        <span className="font-medium text-primary-copy">
                                            {turnaroundTimeName(app)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-secondary-copy">
                                            Created
                                        </span>
                                        <span className="font-medium text-primary-copy">
                                            {formatCreatedAt(
                                                (app as { created_at?: string }).created_at
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-secondary-copy">
                                            Cost
                                        </span>
                                        <span className="font-semibold text-primary-copy">
                                            £{totalCost(app).toFixed(2)}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}