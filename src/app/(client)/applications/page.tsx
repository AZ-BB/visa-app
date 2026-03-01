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
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/StatusBadge";

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
            id,
            status,
            total_fee,
            destination_country:countries(id, name),
            visa_type:visa_types(id, name),
            arrival_date,
            updated_at,
            created_at,
            turnaround_times(name),
            travellers(id)
        `
        )
        .eq("profile_id", user.profile?.id ?? user.authUser.id)
        .order("created_at", { ascending: false });

    const displayApplications = applications ?? [];

    type AppItem = (typeof displayApplications)[number];

    const destinationName = (app: AppItem) =>
        (app as { destination_country?: { name?: string } }).destination_country?.name ?? "—";

    const destinationCountryCode = (app: AppItem) =>
        (app as { destination_country?: { id?: string } }).destination_country?.id ?? null;

    const visaTypeName = (app: AppItem) =>
        (app as { visa_type?: { name?: string } }).visa_type?.name ?? "—";

    const travellerCount = (app: AppItem) =>
        Array.isArray((app as { travellers?: unknown[] }).travellers)
            ? (app as { travellers: unknown[] }).travellers.length
            : 0;

    const turnaroundTimeName = (app: AppItem) =>
        (app as { turnaround_times?: { name?: string } }).turnaround_times?.name ?? "—";

    const totalCost = (app: AppItem) =>
        (app as { total_fee?: number }).total_fee ?? 0;

    return (
        <div className="min-h-screen bg-bg-light-grey pt-6 sm:pt-16 pb-12 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto sm:px-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-primary-copy mb-6 sm:mb-8">
                    Applications
                </h1>

                {!displayApplications.length ? (
                    <div className="rounded-2xl border border-border-default/50 bg-white p-8 sm:p-12 text-center shadow-sm">
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
                                    className="h-full rounded-2xl transition-colors border-2 hover:border-primary/40 hover:bg-primary/2 border-border-default/50 bg-white"
                                >
                                    <CardHeader className="">
                                        {(() => {
                                            const code = destinationCountryCode(app);
                                            return (
                                                <>
                                                    {/* Mobile: [FLAG] | [Header] / [FLAG] | [Status] */}
                                                    <div className="grid grid-cols-[auto_1fr] gap-x-3 items-start sm:hidden">
                                                        {code ? (
                                                            <div className="row-span-2 pt-2">
                                                                <CountryFlag
                                                                    code={code}
                                                                    className="size-15 shrink-0 rounded-md"
                                                                    round={false}
                                                                    loading="lazy"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="row-span-2 w-0" />
                                                        )}
                                                        <h2 className="text-xl font-bold text-primary-copy line-clamp-2 min-w-0 pt-1">
                                                            {destinationName(app)} - {visaTypeName(app)}
                                                        </h2>
                                                        <StatusBadge status={app.status} />
                                                    </div>
                                                    {/* Desktop: [FLAG] [Header] ——— [Status] */}
                                                    <div className="hidden sm:flex sm:items-start sm:justify-between sm:gap-3">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            {code ? (
                                                                <CountryFlag
                                                                    code={code}
                                                                    className="h-14 w-14 shrink-0 rounded-md"
                                                                    round={false}
                                                                    loading="lazy"
                                                                />
                                                            ) : null}
                                                            <h2 className="text-2xl font-bold text-primary-copy line-clamp-2 min-w-0">
                                                                {destinationName(app)} - {visaTypeName(app)}
                                                            </h2>
                                                        </div>
                                                        <StatusBadge status={app.status} />
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </CardHeader>
                                    <CardContent className="space-y-3 pt-0">
                                        <Separator className="mb-4" />
                                        <div className="flex justify-between items-center gap-4 text-base">
                                            <span className="text-secondary-copy shrink-0">
                                                Turnaround time
                                            </span>
                                            <span className="font-semibold text-primary-copy text-right truncate min-w-0">
                                                {turnaroundTimeName(app)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center gap-4 text-base">
                                            <span className="text-secondary-copy shrink-0">
                                                Travellers
                                            </span>
                                            <span className="font-semibold text-primary-copy text-right truncate min-w-0">
                                                {travellerCount(app)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center gap-4 text-base">
                                            <span className="text-secondary-copy shrink-0">
                                                Created
                                            </span>
                                            <span className="font-semibold text-primary-copy text-right truncate min-w-0">
                                                {formatCreatedAt(
                                                    (app as { created_at?: string }).created_at
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center gap-4 text-base">
                                            <span className="text-secondary-copy shrink-0">
                                                Cost
                                            </span>
                                            <span className="font-semibold text-primary-copy text-right truncate min-w-0">
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