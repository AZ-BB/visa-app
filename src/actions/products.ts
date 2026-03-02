"use server"

import { createSupabaseServerClient } from "@/lib/supabase/supabase-server";
import { revalidatePath } from "next/cache";
import { VisaCountry, VisaType } from "./visas";
import GeneralResponse from "@/types/general";

export interface VisaProduct {
    id: number;
    processing_fee_override: number | null;
    gov_fee_override: number | null;
    is_disabled: boolean;
    created_at: string;
    updated_at: string;
    visa_rule: {
        id: number;
        nationality: string;
        destination_country: string;
        is_supported: boolean;
        is_visa_required: boolean;
        nationality_country: VisaCountry | null;
    } | null;
    visa_type: VisaType;
}

export async function fetchProductsByVisaType(visaTypeId: number): Promise<GeneralResponse<VisaProduct[]>> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from("products")
        .select(`
            id, processing_fee_override, gov_fee_override, is_disabled, created_at, updated_at,
            visa_rule:visa_rules!visa_rule_id(
                id, nationality, destination_country, is_supported, is_visa_required,
                nationality_country:countries!nationality(id, name, is_disabled)
            ),
            visa_type:visa_types!visa_type_id(
                id, name, destination_country, is_disabled, processing_fee, gov_fee, created_at, updated_at
            )
        `)
        .eq("visa_type_id", visaTypeId)
        .is("deleted_at", null);
    if (error) {
        return { error: error.message };
    }
    const sorted = (data ?? []).sort((a, b) => {
        const nameA = (a.visa_rule as VisaProduct["visa_rule"])?.nationality_country?.name ?? "";
        const nameB = (b.visa_rule as VisaProduct["visa_rule"])?.nationality_country?.name ?? "";
        return nameA.localeCompare(nameB);
    });
    return { data: sorted as VisaProduct[] };
}

export interface VisaRuleProductStats {
    productCounts: Record<number, number>;
    visaTypeCounts: Record<number, number>;
}

export async function fetchProductStatsByVisaRuleIds(
    visaRuleIds: number[]
): Promise<GeneralResponse<VisaRuleProductStats>> {
    if (visaRuleIds.length === 0) return { data: { productCounts: {}, visaTypeCounts: {} } };
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc("get_product_stats_by_visa_rule_ids", {
        rule_ids: visaRuleIds,
    });

    if (error) return { error: error.message };

    const productCounts: Record<number, number> = {};
    const visaTypeCounts: Record<number, number> = {};

    for (const row of data ?? []) {
        productCounts[row.visa_rule_id] = Number(row.product_count);
        visaTypeCounts[row.visa_rule_id] = Number(row.visa_type_count);
    }

    return { data: { productCounts, visaTypeCounts } };
}

export async function fetchActiveProductCountsByVisaTypeIds(
    visaTypeIds: number[]
): Promise<GeneralResponse<Record<number, number>>> {
    if (visaTypeIds.length === 0) return { data: {} };
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc("get_active_product_counts_by_visa_type_ids", {
        type_ids: visaTypeIds,
    });

    if (error) return { error: error.message };

    const counts: Record<number, number> = {};
    for (const row of data ?? []) {
        counts[row.visa_type_id] = Number(row.product_count);
    }
    return { data: counts };
}

export async function fetchProductsBetweenCountries(
    destinationCountry: string,
    nationality: string
): Promise<GeneralResponse<VisaProduct[]>> {
    const supabase = await createSupabaseServerClient();
    const { data: visaRule } = await supabase
        .from("visa_rules")
        .select("id")
        .eq("destination_country", destinationCountry)
        .eq("nationality", nationality)
        .single();
    if (!visaRule) return { error: "Visa rule not found" };
    const { data, error } = await supabase
        .from("products")
        .select(`
            id, processing_fee_override, gov_fee_override, is_disabled, created_at, updated_at,
            visa_rule:visa_rules!visa_rule_id(
                id, nationality, destination_country, is_supported, is_visa_required,
                nationality_country:countries!nationality(id, name, is_disabled)
            ),
            visa_type:visa_types!visa_type_id(
                id, name, destination_country, is_disabled, processing_fee, gov_fee, created_at, updated_at
            )
        `)
        .eq("visa_rule_id", visaRule?.id)
        .is("deleted_at", null);
    if (error) return { error: error.message };
    return { data: data as VisaProduct[] };
}

export async function updateProductDisabledStatus(
    id: number,
    visaTypeId: number,
    isDisabled: boolean
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
        .from("products")
        .update({ is_disabled: isDisabled })
        .eq("id", id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath(`/admin/visas/${visaTypeId}`);
    return { success: true };
}

export async function updateProduct(input: {
    id: number;
    visaTypeId: number;
    processingFeeOverride: number | null;
    govFeeOverride: number | null;
    isDisabled: boolean;
}): Promise<{ success: boolean; error?: string }> {
    if (input.processingFeeOverride != null && input.processingFeeOverride < 0) {
        return { success: false, error: "Processing fee cannot be negative." };
    }
    if (input.govFeeOverride != null && input.govFeeOverride < 0) {
        return { success: false, error: "Gov fee cannot be negative." };
    }

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
        .from("products")
        .update({
            processing_fee_override: input.processingFeeOverride,
            gov_fee_override: input.govFeeOverride,
            is_disabled: input.isDisabled,
        })
        .eq("id", input.id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath(`/admin/visas/${input.visaTypeId}`);
    return { success: true };
}

export async function addAllowedNationalities(input: {
    visaTypeId: number;
    destinationCountry: string;
    nationalityIds: string[];
    processingFeeOverride?: number | null;
    govFeeOverride?: number | null;
}): Promise<{ success: boolean; added: number; restored: number; error?: string }> {
    if (input.nationalityIds.length === 0) {
        return { success: false, added: 0, restored: 0, error: "No countries selected." };
    }

    const supabase = await createSupabaseServerClient();

    const BATCH_SIZE = 20;
    let added = 0;
    let restored = 0;
    const errors: string[] = [];

    for (let i = 0; i < input.nationalityIds.length; i += BATCH_SIZE) {
        const batch = input.nationalityIds.slice(i, i + BATCH_SIZE);
        const results = await Promise.allSettled(
            batch.map((nationality) =>
                addSingleNationality(supabase, {
                    visaTypeId: input.visaTypeId,
                    destinationCountry: input.destinationCountry,
                    nationality,
                    processingFeeOverride: input.processingFeeOverride ?? null,
                    govFeeOverride: input.govFeeOverride ?? null,
                })
            )
        );

        for (const result of results) {
            if (result.status === "fulfilled") {
                if (result.value.restored) restored++;
                else added++;
            } else {
                errors.push(String(result.reason));
            }
        }
    }

    if (errors.length > 0 && added === 0 && restored === 0) {
        return { success: false, added, restored, error: errors[0] };
    }

    revalidatePath(`/admin/visas/${input.visaTypeId}`);
    return { success: true, added, restored };
}

async function addSingleNationality(
    supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
    params: {
        visaTypeId: number;
        destinationCountry: string;
        nationality: string;
        processingFeeOverride: number | null;
        govFeeOverride: number | null;
    }
): Promise<{ restored: boolean }> {
    let visaRuleId: number;

    const { data: existingRule } = await supabase
        .from("visa_rules")
        .select("id")
        .eq("nationality", params.nationality)
        .eq("destination_country", params.destinationCountry)
        .single();

    if (existingRule) {
        visaRuleId = existingRule.id;
    } else {
        const { data: newRule, error: ruleErr } = await supabase
            .from("visa_rules")
            .insert({
                nationality: params.nationality,
                destination_country: params.destinationCountry,
                is_supported: true,
                is_visa_required: true,
            })
            .select("id")
            .single();

        if (ruleErr || !newRule) {
            throw new Error(ruleErr?.message ?? `Failed to create visa rule for ${params.nationality}`);
        }
        visaRuleId = newRule.id;
    }

    const { data: existingProduct } = await supabase
        .from("products")
        .select("id, deleted_at")
        .eq("visa_rule_id", visaRuleId)
        .eq("visa_type_id", params.visaTypeId)
        .single();

    if (existingProduct && existingProduct.deleted_at) {
        const { error } = await supabase
            .from("products")
            .update({
                deleted_at: null,
                is_disabled: false,
                processing_fee_override: params.processingFeeOverride,
                gov_fee_override: params.govFeeOverride,
            })
            .eq("id", existingProduct.id);

        if (error) throw new Error(error.message);
        return { restored: true };
    }

    if (existingProduct) {
        return { restored: false };
    }

    const { error: productErr } = await supabase
        .from("products")
        .insert({
            visa_rule_id: visaRuleId,
            visa_type_id: params.visaTypeId,
            processing_fee_override: params.processingFeeOverride,
            gov_fee_override: params.govFeeOverride,
        });

    if (productErr) throw new Error(productErr.message);
    return { restored: false };
}

export async function softDeleteProduct(
    productId: number,
    visaTypeId: number
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
        .from("products")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", productId);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath(`/admin/visas/${visaTypeId}`);
    return { success: true };
}

export async function bulkSoftDeleteProducts(
    productIds: number[],
    visaTypeId: number
): Promise<{ success: boolean; error?: string }> {
    if (productIds.length === 0) {
        return { success: false, error: "No products selected." };
    }

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
        .from("products")
        .update({ deleted_at: new Date().toISOString() })
        .in("id", productIds);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath(`/admin/visas/${visaTypeId}`);
    return { success: true };
}
