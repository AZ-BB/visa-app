'use server'

import { createSupabaseServerClient } from "@/lib/supabase/supabase-server";
import { Tables } from "@/database.types";
import GeneralResponse from "@/types/general";
import { getUser } from "@/lib/get-user";
import { ApplicationStatus } from "@/enums";

export async function createApplicationClient({
    arrival_date,
    contact_email,
    destination_country,
    visa_type_id,
    travellers = [],
    turnaround_time_id,
}: {
    arrival_date: string;
    contact_email: string;
    destination_country: string;
    visa_type_id: number;
    travellers: {
        first_name: string;
        last_name: string;
        date_of_birth: string;
        passport_number: string;
        passport_expiry_date: string;
        country_of_birth: string;
        country_of_residence: string;
        nationality: string;
        product_id: number;
    }[];
    turnaround_time_id: number;
}): Promise<GeneralResponse<string>> {
    try {
        const supabase = await createSupabaseServerClient();

        const user = await getUser();
        if (!user || !user.profile) {
            return {
                status: false,
                error: "User not found",
            }
        }

        if (travellers.length === 0) {
            return {
                status: false,
                error: "At least one traveller is required",
            }
        }

        if (travellers.some(traveller => !traveller.last_name ||
            !traveller.first_name ||
            !traveller.date_of_birth ||
            !traveller.passport_number ||
            !traveller.passport_expiry_date ||
            !traveller.country_of_birth ||
            !traveller.country_of_residence ||
            !traveller.nationality ||
            !traveller.product_id
        )) {
            return {
                status: false,
                error: "Invalid traveller data",
            }
        }

        const { data: destinationCountryData, error: destinationCountryError } = await supabase
            .from("countries")
            .select("*").
            eq("id", destination_country)
            .single();

        if (destinationCountryError || !destinationCountryData) {
            return {
                status: false,
                error: "Destination country not found",
            }
        }

        const { data: turnaroundTimeData, error: turnaroundTimeError } = await supabase
            .from("turnaround_times")
            .select("*")
            .eq("id", turnaround_time_id)
            .eq('is_disabled', false)
            .single();

        if (turnaroundTimeError || !turnaroundTimeData) {
            return {
                status: false,
                error: "Turnaround plan not available for this destination. Please select a different turnaround plan.",
            }
        }

        const { data: visaTypeData, error: visaTypeError } = await supabase
            .from("visa_types")
            .select("*")
            .eq("destination_country", destinationCountryData.id)
            .eq("id", visa_type_id)
            .single();


        if (visaTypeError || !visaTypeData) {
            return {
                status: false,
                error: "Visa type not found",
            }
        }

        if (visaTypeData.is_disabled || visaTypeData.deleted_at) {
            return {
                status: false,
                error: "The visa you selected is currently unavailable. Please select a different visa type.",
            }
        }

        const travellersNationalities: string[] = travellers.map(traveller => traveller.nationality);
        const { data: visaRulesData, error: visaRulesError } = await supabase
            .from("visa_rules")
            .select("*")
            .in("nationality", travellersNationalities)
            .eq("destination_country", destinationCountryData.id)

        if (visaRulesError || !visaRulesData) {
            return {
                status: false,
                error: "Failed to get visa rules",
            }
        }

        if (visaRulesData.some(visaRule => !visaRule.is_supported || !visaRule.is_visa_required)) {
            return {
                status: false,
                error: "One or more of your travellers are not eligible for this visa. Please check the visa rules and try again.",
            }
        }

        let totalGovFee = 0;
        let totalProcessingFee = 0;
        let totalTurnaroundFee = 0;
        const dbTravellers: Omit<Tables<"travellers">, "id" | "created_at" | "updated_at" | "application_id">[] = [];

        for (const traveller of travellers) {

            let visaRule = visaRulesData.find(visaRule => visaRule.nationality === traveller.nationality);

            if (!visaRule) {
                const { data: newVisaRule, error: newVisaRuleError } = await supabase
                    .from("visa_rules")
                    .select("*")
                    .eq("nationality", traveller.nationality)
                    .eq("destination_country", destinationCountryData.id)
                    .single();

                if (newVisaRuleError || !newVisaRule) {
                    return {
                        status: false,
                        error: "Failed to create visa rule",
                    }
                }

                visaRule = newVisaRule;
            }

            const { data: productData, error: productError } = await supabase
                .from("products")
                .select("*")
                .eq("visa_type_id", visaTypeData.id)
                .eq("visa_rule_id", visaRule.id)
                .single();

            if (productError || !productData) {
                return {
                    status: false,
                    error: "Failed to get product",
                }
            }

            if (productData.is_disabled || productData.deleted_at) {
                return {
                    status: false,
                    error: "One or more of your travellers are not eligible for this visa. Please check the visa rules and try again.",
                }
            }

            totalGovFee += productData.gov_fee_override ?? visaTypeData.gov_fee;
            totalProcessingFee += productData.processing_fee_override ?? visaTypeData.processing_fee;
            totalTurnaroundFee += turnaroundTimeData.fee;

            dbTravellers.push({
                first_name: traveller.first_name,
                last_name: traveller.last_name,
                date_of_birth: traveller.date_of_birth,

                passport_number: traveller.passport_number,
                passport_expiry_date: traveller.passport_expiry_date,

                country_of_birth: traveller.country_of_birth,
                country_of_residence: traveller.country_of_residence,
                nationality: traveller.nationality,

                product_id: productData.id,
                gov_fee: productData.gov_fee_override ?? visaTypeData.gov_fee,
                processing_fee: productData.processing_fee_override ?? visaTypeData.processing_fee,
            });
        }

        const { data: applicationData, error: applicationError } = await supabase
            .from("applications")
            .insert({
                profile_id: user.profile.id,
                turnaround_time_id: turnaroundTimeData.id,
                arrival_date,
                contact_email,
                status: "NOT_STARTED",
                gov_fee: totalGovFee,
                processing_fee: totalProcessingFee,
                turnaround_fee: totalTurnaroundFee,
                total_fee: totalGovFee + totalProcessingFee + totalTurnaroundFee,
                destination_country_id: destinationCountryData.id,
                visa_type_id: visaTypeData.id,
            })
            .select();

        if (applicationError || !applicationData) {
            return {
                status: false,
                error: "Failed to create application",
            }
        }

        const { error: travellersError } = await supabase
            .from("travellers")
            .insert(dbTravellers.map(traveller => ({
                ...traveller,
                application_id: applicationData[0].id,
            })));

        if (travellersError) {
            return {
                status: false,
                error: "Failed to create travellers",
            }
        }

        return {
            status: true,
            message: "Application created successfully",
            data: applicationData[0].id,
        }

    } catch (error) {
        console.error(error);
        return {
            status: false,
            error: "Failed to create application",
        }
    }
}

export type ApplicationList = {
    id: string;

    destination_country_id: string;
    destination_country_name: string;

    visa_type_id: number;
    visa_type_name: string;

    assigned_to_id: string | null;
    assigned_to_name: string;

    status: ApplicationStatus;
    turnaround_time_id: number;
    total_fee: number;

    client_name: string;
    contact_email: string;

    travellers: {
        first_name: string;
        last_name: string;
        nationality: string;
    }[]

    arrival_date: string;
    created_at: string;
    updated_at: string;
}[];

export async function getApplications(page: number = 1, limit: number = 10, filter: {
    status?: ApplicationStatus
    assigned_to_id?: string
    search?: string

    destination?: string
    nationality?: string

    sort: 'arrival_date' | 'created_at' | 'updated_at' | 'status' | 'client_name' | 'total_fee'
    order: 'asc' | 'desc'
}): Promise<GeneralResponse<{ applications: ApplicationList; total: number }>> {
    try {
        const supabase = await createSupabaseServerClient();

        const isUnassignedFilter = filter.assigned_to_id === "__unassigned__";
        const { data, error } = await supabase.rpc("list_applications_admin", {
            p_page: page,
            p_limit: limit,
            p_search: filter.search ?? undefined,
            p_status: filter.status ?? undefined,
            p_assigned_to_id: isUnassignedFilter ? undefined : (filter.assigned_to_id ?? undefined),
            p_destination_id: filter.destination ?? undefined,
            p_nationality_id: filter.nationality ?? undefined,
            p_sort: filter.sort,
            p_order: filter.order,
            p_filter_unassigned: isUnassignedFilter,
        });

        if (error) {
            return {
                status: false,
                error: error.message,
            };
        }

        const result = data as unknown as { error?: string; applications?: ApplicationList; total?: number } | null | undefined;
        if (result?.error) {
            return {
                status: false,
                error: result.error,
            };
        }

        return {
            status: true,
            data: {
                applications: result?.applications ?? [],
                total: result?.total ?? 0,
            },
        };
    } catch (error) {
        console.error(error);
        return {
            status: false,
            error: "Failed to get applications",
        }
    }
}

export type Application = Tables<"applications"> & {
    destination_country: Tables<"countries">;
    visa_type: Tables<"visa_types">;
    turnaround_time: Tables<"turnaround_times">;
    travellers: Tables<"travellers"> & {
        product: Tables<"products">;
    }[];
}

export async function getApplication(id: string): Promise<GeneralResponse<Application>> {
    try {
        const supabase = await createSupabaseServerClient();
        const { data, error } = await supabase
            .from("applications")
            .select(`
            *,
            destination_country:countries(*),
            visa_type:visa_types(*),
            turnaround_times(*),
            travellers(*, product:products(*))
        `)
            .eq("id", id)
            .single();

        if (error || !data) {
            return {
                status: false,
                error: error.message,
            };
        }

        return {
            status: true,
            data: data as unknown as Application,
        };
    }
    catch (error) {
        console.error(error);
        return {
            status: false,
            error: "Failed to get application",
        };
    }
}

export async function updateApplicationStatus(
    applicationId: string,
    status: ApplicationStatus
): Promise<GeneralResponse<void>> {
    try {
        const supabase = await createSupabaseServerClient();

        const { error } = await supabase
            .from("applications")
            .update({ status })
            .eq("id", applicationId);

        if (error) {
            return {
                status: false,
                error: error.message,
            };
        }

        return { status: true };
    } catch (error) {
        console.error(error);
        return {
            status: false,
            error: "Failed to update status",
        };
    }
}

export async function updateApplicationAssignee(
    applicationId: string,
    assignedToId: string | null
): Promise<GeneralResponse<void>> {
    try {
        const supabase = await createSupabaseServerClient();

        const { error } = await supabase
            .from("applications")
            .update({ assigned_to: assignedToId })
            .eq("id", applicationId);

        if (error) {
            return {
                status: false,
                error: error.message,
            };
        }

        return { status: true };
    } catch (error) {
        console.error(error);
        return {
            status: false,
            error: "Failed to update assignment",
        };
    }
}