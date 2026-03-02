import { Tables } from "@/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/supabase-server";
import GeneralResponse from "@/types/general";

export interface ClientRow {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    created_at: string;
    applications: { count: number }[];
}

export interface ClientsPageData {
    clients: ClientRow[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export type ClientSortKey = "name" | "email" | "created_at" | "applications";
export type ClientSortDir = "asc" | "desc";

export async function fetchClients({
    page = 1,
    pageSize = 20,
    search = "",
    sort = "created_at",
    sortDir = "desc",
    hasApplications,
}: {
    page?: number;
    pageSize?: number;
    search?: string;
    sort?: ClientSortKey;
    sortDir?: ClientSortDir;
    hasApplications?: "all" | "yes" | "no";
} = {}): Promise<GeneralResponse<ClientsPageData>> {
    const supabase = await createSupabaseServerClient();
    const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
    const safePageSize =
        Number.isFinite(pageSize) && pageSize > 0 ? Math.min(Math.floor(pageSize), 100) : 20;

    const { data, error } = await supabase.rpc("get_clients", {
        p_page: safePage,
        p_limit: safePageSize,
        p_search: search?.trim() || undefined,
        p_has_applications: hasApplications === "yes" ? "yes" : "all",
        p_sort: sort,
        p_order: sortDir,
    });

    if (error) {
        return { error: error.message };
    }
;
    if (!data) {
        return { error: "Failed to fetch clients" };
    }
    const result = data as unknown as { clients: ClientRow[] | null; total: number | null };
    const clients = result?.clients ?? [];
    const total = result?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / safePageSize));

    return {
        data: {
            clients,
            total,
            page: safePage,
            pageSize: safePageSize,
            totalPages,
        },
    };
}


export interface ClientApplication {
    id: string;
    status: string;
    created_at: string;
    arrival_date: string;
    visa_type: { id: number; name: string; destination_country: string } | null;
    destination_country_data: { id: string; name: string } | null;
}

export interface ClientWithApplications extends Tables<"profiles"> {
    applications: ClientApplication[];
}

export async function fetchClientById(
    id: string,
    options?: { includeApplications?: boolean }
): Promise<GeneralResponse<ClientWithApplications | null>> {
    const includeApplications = options?.includeApplications !== false;
    const supabase = await createSupabaseServerClient();

    const { data, error } = includeApplications
        ? await supabase
            .from("profiles")
            .select(`*, applications(id, status, created_at, arrival_date, visa_type:visa_types(id, name, destination_country), destination_country_data:countries!destination_country_id(id, name))`)
            .eq("id", id)
            .single()
        : await supabase
            .from("profiles")
            .select("*")
            .eq("id", id)
            .single();

    if (error) {
        return { error: error.message };
    }

    if (!data) return { data: null };

    const client = data as unknown as ClientWithApplications;
    if (includeApplications && client.applications) {
        client.applications = (client.applications ?? []).sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    } else if (!includeApplications) {
        client.applications = [];
    }
    return { data: client };
}