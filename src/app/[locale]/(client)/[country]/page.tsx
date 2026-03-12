import { createSupabaseServerClient } from "@/lib/supabase/supabase-server";
import { notFound, redirect } from "next/navigation";

export default async function CountryPage({ params }: { params: Promise<{ country: string }> }) {

    const { country } = await params;

    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.from("countries").select("id").eq("id", country).single();

    if (!data || error) {
        return notFound();
    }

    return redirect(`/${country}/apply`);
}