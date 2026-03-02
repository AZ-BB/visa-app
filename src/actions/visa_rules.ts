"use server"

import { createSupabaseServerClient } from "@/lib/supabase/supabase-server"
import GeneralResponse from "@/types/general"
import { revalidatePath } from "next/cache"

export interface CountryDetails {
    id: string;
    name: string;
    is_disabled: boolean;
    created_at: string;
    updated_at: string;
}

export interface VisaRule {
    id: number;
    nationality: string;
    destination_country: string;
    is_supported: boolean;
    is_visa_required: boolean;
    created_at: string;
    updated_at: string;
    nationality_country_data: CountryDetails | null;
    destination_country_data: CountryDetails | null;
}

export async function getAllVisaRulesForDestination(destinationCountry: string): Promise<GeneralResponse<VisaRule[]>> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from("visa_rules")
        .select("*, nationality_country_data:countries!nationality(*), destination_country_data:countries!destination_country(*)")
        .eq("destination_country", destinationCountry);
    if (error) {
        return { error: error.message };
    }
    const sorted = data.sort((a, b) => {
        const nameA = a.nationality_country_data?.name ?? a.nationality;
        const nameB = b.nationality_country_data?.name ?? b.nationality;
        return nameA.localeCompare(nameB);
    });
    return { data: sorted };
}

export async function getAllVisaRulesForNationality(nationality: string): Promise<GeneralResponse<VisaRule[]>> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from("visa_rules")
        .select("*, nationality_country_data:countries!nationality(*), destination_country_data:countries!destination_country(*)")
        .eq("nationality", nationality);
    if (error) {
        return { error: error.message };
    }
    const sorted = data.sort((a, b) => {
        const nameA = a.destination_country_data?.name ?? a.destination_country;
        const nameB = b.destination_country_data?.name ?? b.destination_country;
        return nameA.localeCompare(nameB);
    });
    return { data: sorted };
}

export async function updateVisaRuleSupportStatus(id: number, isSupported: boolean): Promise<{ success: boolean; error?: string }> {
    const supabase = await createSupabaseServerClient();
    const updateData: Record<string, boolean> = { is_supported: isSupported };
    if (isSupported) {
        updateData.is_visa_required = true;
    }
    const { error } = await supabase
        .from("visa_rules")
        .update(updateData)
        .eq("id", id);
    if (error) {
        return { success: false, error: error.message };
    }
    revalidatePath("/admin/countries")
    return { success: true };
}

export async function updateVisaRuleVisaRequiredStatus(id: number, isVisaRequired: boolean): Promise<{ success: boolean; error?: string }> {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
        .from("visa_rules")
        .update({ is_visa_required: isVisaRequired })
        .eq("id", id);
    if (error) {
        return { success: false, error: error.message };
    }
    revalidatePath("/admin/countries")
    return { success: true };
}