import { redirect } from "next/navigation";
import { getUser } from "@/lib/get-user";
import { createSupabaseServerClient } from "@/lib/supabase/supabase-server";
import { ApplicationsFilter } from "./_components/ApplicationsFilter";
import { getTranslations } from "next-intl/server";

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
            amount_refunded_cents,
            destination_country:countries(id, name),
            visa_type:visa_types(id, name),
            arrival_date,
            updated_at,
            created_at,
            turnaround_times(name),
            travellers(id)
        `
        )
        .eq("profile_id", user.profile?.id ?? user.authUser.id).eq("is_paid", true)
        .order("created_at", { ascending: false });

    const displayApplications = applications ?? [];
    const t = await getTranslations("applications");

    return (
        <div className="min-h-screen bg-bg-light-grey pt-6 sm:pt-16 pb-12 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto sm:px-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-primary-copy mb-6 sm:mb-8">
                    {t("title")}
                </h1>

                {!displayApplications.length ? (
                    <div className="rounded-2xl border border-border-default/50 bg-white p-8 sm:p-12 text-center shadow-sm">
                        <p className="text-secondary-copy text-lg">
                            {t("emptyTitle")}
                        </p>
                        <p className="text-secondary-copy text-sm mt-2">
                            {t("emptyHint")}
                        </p>
                    </div>
                ) : (
                    <ApplicationsFilter applications={displayApplications} />
                )}
            </div>
        </div>
    );
}