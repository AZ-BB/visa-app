"use server"

import { Tables } from "@/database.types";
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
    processing_fee: number;
    gov_fee: number;
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

export async function fetchVisaById(id: number): Promise<GeneralResponse<VisaType>> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from("visa_types")
        .select("*, destination_country_data:countries!destination_country(*)")
        .eq("id", id)
        .is("deleted_at", null)
        .single();
    if (error) {
        return { error: error.message };
    }
    return { data: data };
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

export async function createVisaTypeForDestination(input: {
    destinationCountry: string;
    name: string;
    validFor: string;
    numberOfEntries: number;
    maxStay: number;
    processingFee?: number;
    govFee?: number;
}): Promise<{ success: boolean; id?: number; error?: string }> {
    const name = input.name.trim();
    const validFor = input.validFor.trim();

    if (!name) return { success: false, error: "Visa name is required." };
    if (!validFor) return { success: false, error: "Validity period is required." };
    if (Number.isNaN(input.numberOfEntries) || (input.numberOfEntries < 1 && input.numberOfEntries !== -1)) {
        return { success: false, error: "Entries must be -1 (multiple) or a positive number." };
    }
    if (Number.isNaN(input.maxStay) || input.maxStay < 1) {
        return { success: false, error: "Max stay must be at least 1 day." };
    }
    if ((input.processingFee ?? 0) < 0 || (input.govFee ?? 0) < 0) {
        return { success: false, error: "Fees cannot be negative." };
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from("visa_types")
        .insert({
            destination_country: input.destinationCountry,
            name,
            valid_for: validFor,
            number_of_entries: input.numberOfEntries,
            max_stay: input.maxStay,
            processing_fee: input.processingFee ?? 0,
            gov_fee: input.govFee ?? 0,
        })
        .select("id")
        .single();

    if (error || !data) {
        return { success: false, error: error?.message ?? "Failed to create visa type." };
    }

    const { revalidatePath } = await import("next/cache");
    revalidatePath(`/admin/countries/${input.destinationCountry}/visas`);
    revalidatePath(`/admin/countries/${input.destinationCountry}`);
    revalidatePath("/admin/visas");

    return { success: true, id: data.id };
}



export default async function isVisaAvailable(destinationCountry: string, nationality: string, visaTypeId: number): Promise<GeneralResponse<Tables<"products"> | null>> {
    try {
        const supabase = await createSupabaseServerClient();

        const { data: destinationCountryData, error: destinationCountryError } = await supabase
            .from("countries")
            .select("id, name, is_disabled")
            .eq("id", destinationCountry)
            .single();

        const { data: nationalityData, error: nationalityError } = await supabase
            .from("countries")
            .select("id, name")
            .eq("id", nationality)
            .single();


        if (destinationCountryData?.is_disabled) {
            return {
                data: null,
                status: false,
                error: `Visa applications for ${destinationCountryData.name} are temporarily suspended. Please check back later or contact support for more information.`
            }
        }

        const { data: visaTypeData, error: visaTypeError } = await supabase
            .from("visa_types")
            .select("*")
            .eq("id", visaTypeId)
            .single();

        if (visaTypeData?.is_disabled || visaTypeData?.deleted_at) {
            return {
                data: null,
                status: false,
                error: `The ${visaTypeData?.name} visa is not available at this time. It may have been discontinued or temporarily suspended.`
            }
        }

        const { data: visaRuleData, error: visaRuleError } = await supabase
            .from("visa_rules")
            .select("id, is_supported, is_visa_required")
            .eq("destination_country", destinationCountry)
            .eq("nationality", nationality)
            .single();

        if (visaRuleError || !visaRuleData) {
            return {
                data: null,
                status: false,
                error: `We couldn't verify visa eligibility for ${nationalityData?.name} to ${destinationCountryData?.name}. Please try again or contact support if the issue persists.`
            }
        }

        if(!visaRuleData.is_visa_required) {
            return {
                data: null,
                status: false,
                error: `A visa is not required to travel to ${destinationCountryData?.name} from ${nationalityData?.name}`
            }
        }

        if (!visaRuleData.is_supported) {
            return {
                data: null,
                status: false,
                error: `Unfortunately, we don't support visa applications from ${nationalityData?.name} to ${destinationCountryData?.name} at this time.`
            }
        }

        const { data: products, error: productsError } = await supabase
            .from("products")
            .select("*")
            .eq("visa_type_id", visaTypeId)
            .eq("visa_rule_id", visaRuleData.id)
            .single();


        if (products?.is_disabled || products?.deleted_at) {
            return {
                data: null,
                status: false,
                error: `The ${visaTypeData?.name} is not available for ${nationalityData?.name} nationals at this time. Please check back later.`
            }
        }


        return {
            data: products,
            status: true,
            message: `The ${visaTypeData?.name} visa to ${destinationCountryData?.name} is available for ${nationalityData?.name} nationals. You can proceed with your application.`
        }
    }
    catch (error) {
        console.error(error);
        return {
            data: null,
            status: false,
            error: "An unexpected error occurred. Please try again or contact support if the problem continues."
        }
    }
}
