"use server"

import { createSupabaseServerClient } from "@/lib/supabase/supabase-server";
import { revalidatePath } from "next/cache";
import { VisaCountry } from "./visas";
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

export async function syncAllowedNationalities(
    visaTypeId: number,
    destinationCountry: string,
    nationalityIds: string[],
    defaultPrice: number = 0
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createSupabaseServerClient();

    const currentRes = await fetchProductsByVisaType(visaTypeId);
    if (currentRes.error || !currentRes.data) {
        return { success: false, error: currentRes.error ?? "Failed to fetch current products" };
    }

    const currentNationalities = new Set(
        currentRes.data
            .map((p) => (p.visa_rule as VisaProduct["visa_rule"])?.nationality)
            .filter(Boolean) as string[]
    );
    const targetNationalities = new Set(nationalityIds);

    const toAdd = nationalityIds.filter((id) => !currentNationalities.has(id));
    const toRemove = currentRes.data.filter(
        (p) => {
            const nat = (p.visa_rule as VisaProduct["visa_rule"])?.nationality;
            return nat && !targetNationalities.has(nat);
        }
    );

    for (const nationality of toAdd) {
        let visaRuleId: number;

        const { data: existingRule } = await supabase
            .from("visa_rules")
            .select("id")
            .eq("nationality", nationality)
            .eq("destination_country", destinationCountry)
            .single();

        if (existingRule) {
            visaRuleId = existingRule.id;
        } else {
            const { data: newRule, error: ruleErr } = await supabase
                .from("visa_rules")
                .insert({
                    nationality,
                    destination_country: destinationCountry,
                    is_supported: true,
                    is_visa_required: true,

                })
                .select("id")
                .single();

            if (ruleErr || !newRule) {
                return { success: false, error: ruleErr?.message ?? `Failed to create visa rule for ${nationality}` };
            }
            visaRuleId = newRule.id;
        }

        const { error: productErr } = await supabase
            .from("products")
            .insert({
                visa_rule_id: visaRuleId,
                visa_type_id: visaTypeId,
            });

        if (productErr) {
            return { success: false, error: productErr.message };
        }
    }

    if (toRemove.length > 0) {
        const removeIds = toRemove.map((p) => p.id);
        const { error: deleteErr } = await supabase
            .from("products")
            .update({ deleted_at: new Date().toISOString() })
            .in("id", removeIds);

        if (deleteErr) {
            return { success: false, error: deleteErr.message };
        }
    }

    revalidatePath(`/admin/visas/${visaTypeId}`);
    return { success: true };
}
