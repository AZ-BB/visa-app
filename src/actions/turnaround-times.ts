'use server';

import { Tables } from "@/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/supabase-server";
import GeneralResponse from "@/types/general";
import { revalidatePath } from "next/cache";

export async function getTurnaroundTimes() {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
        .from("turnaround_times")
        .select("*")
        .order("turnaround_time_hours", { ascending: true });

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export async function createTurnaroundTime(turnaroundTime: {
    name: string;
    index: number;
    turnaround_time_hours: number;
    fee: number;
}): Promise<GeneralResponse<number>> {
    try {
        const supabase = await createSupabaseServerClient();

        const { data, error } = await supabase
            .from("turnaround_times")
            .insert(turnaroundTime)
            .select()
            .single();

        if (error) {
            return {
                status: false,
                error: error.message,
            };
        }

        revalidatePath("/admin/settings", "page");

        return {
            status: true,
            data: data.id,
        };
    }
    catch (error) {
        console.error(error);
        return {
            status: false,
            error: "Failed to create turnaround time",
        };
    }
}

export async function updateTurnaroundTime(id: number, turnaroundTime: Partial<Tables<"turnaround_times">>): Promise<GeneralResponse<Tables<"turnaround_times">>> {
    try {
        const supabase = await createSupabaseServerClient();

        const { data, error } = await supabase
            .from("turnaround_times")
            .update(turnaroundTime)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            return {
                status: false,
                error: error.message,
            };
        }

        revalidatePath("/admin/settings", "page");

        return {
            status: true,
            data: data,
        };
    }
    catch (error) {
        console.error(error);
        return {
            status: false,
            error: "Failed to update turnaround time",
        };
    }
}