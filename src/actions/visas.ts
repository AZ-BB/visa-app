"use server"

import { createSupabaseServerClient } from "@/lib/supabase/supabase-server";
import GeneralResponse from "@/types/general";

export interface VisaCountry {
    id: string;
    name: string;
    is_disabled: boolean;
}

export interface VisaType {
    id: number;
    name: string;
    destination_country: string;
    is_disabled: boolean;
    max_stay: number;
    number_of_entries: number;
    valid_for: string;
    created_at: string;
    updated_at: string;
    destination_country_data: VisaCountry | null;
}

export async function getAllVisaTypesForDestination(countryId: string): Promise<GeneralResponse<VisaType[]>> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from("visa_types")
        .select("*, destination_country_data:countries!destination_country(*)")
        .eq("destination_country", countryId)
        .is("deleted_at", null);
    if (error) {
        return { error: error.message };
    }
    return { data: data.sort((a, b) => a.name.localeCompare(b.name)) };
}

export async function updateVisaTypeDisabledStatus(id: number, isDisabled: boolean): Promise<{ success: boolean; error?: string }> {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
        .from("visa_types")
        .update({ is_disabled: isDisabled })
        .eq("id", id);
    if (error) {
        return { success: false, error: error.message };
    }
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/admin/visas");
    revalidatePath("/admin/countries");
    return { success: true };
}