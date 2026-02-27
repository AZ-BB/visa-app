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



// export default async function isVisaAvailableForNationality(destinationCountry: string, nationality: string, visaTypeId: number): Promise<GeneralResponse<boolean>> {
//   const supabase = await createSupabaseServerClient();

//   const { data: destinationCountryData, error: destinationCountryError } = await supabase
//     .from("countries")
//     .select("*")
//     .eq("id", destinationCountry)
//     .single();

//   const { data: passportCountry, error: passportCountryError } = await supabase
//     .from("countries")
//     .select("*")
//     .eq("id", nationality)
//     .single();

//   const { data: visaRules, error: visaRulesError } = await supabase
//     .from("visa_rules")
//     .select("*")
//     .eq("destination_country", destinationCountry)
//     .eq("nationality", nationality)
//     .single();

//   if (!visaRules || visaRulesError) {
//     return {
//       data: false,
//       message: "Something went wrong."
//     }
//   }

//   const isSupported = visaRules.is_supported;
//   const isVisaRequired = visaRules.is_visa_required;

//   if (!isVisaRequired) {
//     return {
//       data: false,
//       message: `No visa is required for ${destinationCountryData?.name} from ${passportCountry?.name}.`
//     }
//   }

//   if (!isSupported) {
//     return {
//       data: false,
//       message: `Visa is not supported for ${destinationCountryData?.name} from ${passportCountry?.name}.`
//     }
//   }

//   const { data: visaTypeData, error: visaTypeError } = await supabase
//     .from("visa_types")
//     .select("*")
//     .eq("id", visaTypeId)
//     .single();

//   if (!visaTypeData || visaTypeError) {
//     return {
//       data: false,
//       message: "Something went wrong."
//     }
//   }

//   if(visaTypeData.is_disabled) {
//     return {
//       data: false,
//       message: `The ${visaTypeData.name} is currently not available.`
//     }
//   }

//   const { data: products, error: productsError } = await supabase
//     .from("products")
//     .select(`*,
//       visa:visa_types(*)
//       `)
//     .eq("visa_rule_id", visaRules.id)
//     .eq("visa_type_id", visaTypeId);




// }


export default async function isVisaAvailable(destinationCountry: string, nationality: string, visaTypeId: number): Promise<GeneralResponse<boolean>> {
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
                data: false,
                status: false,
                error: "Destination country is disabled."
            }
        }

        const { data: visaTypeData, error: visaTypeError } = await supabase
            .from("visa_types")
            .select("*")
            .eq("id", visaTypeId)
            .single();

        if (visaTypeData?.is_disabled || visaTypeData?.deleted_at) {
            return {
                data: false,
                status: false,
                error: `The ${visaTypeData?.name} is currently unavailable.`
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
                data: false,
                status: false,
                error: "Something went wrong."
            }
        }

        if (!visaRuleData.is_supported) {
            return {
                data: false,
                status: false,
                error: `Visa is not supported for ${destinationCountryData?.name} from ${nationalityData?.name}.`
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
                data: false,
                status: false,
                error: `The ${visaTypeData?.name} is currently unavailable.`
            }
        }


        return {
            data: true,
            status: true,
            message: "The visa is available."
        }
    }
    catch (error) {
        console.error(error);
        return {
            data: false,
            status: false,
            error: "Something went wrong."
        }
    }
}
