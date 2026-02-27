'use server';

import { createSupabaseServerClient } from "@/lib/supabase/supabase-server";
import GeneralResponse from "@/types/general";

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