'use server';

import { Tables } from "@/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/supabase-server";
import GeneralResponse from "@/types/general";


export async function getTurnaroundTimes(): Promise<GeneralResponse<Tables<"turnaround_times">[]>> {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
        .from("turnaround_times")
        .select("*")
        .order("id", { ascending: true });

    if (error) {
        throw new Error(error.message);
    }

    return {
        data,
        status: true,
    };
}