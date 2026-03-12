import { notFound, redirect } from "next/navigation";
import { getUser } from "@/lib/get-user";
import { createSupabaseServerClient } from "@/lib/supabase/supabase-server";
import { ApplicationDetailContent } from "./_components/ApplicationDetailContent";

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

    if (!data) {
        notFound();
    }

    const { payment } = await searchParams;
    const showPaymentSuccess = payment === "success";

    return (
        <ApplicationDetailContent
            application={data}
            showPaymentSuccess={showPaymentSuccess}
        />
    );
}
