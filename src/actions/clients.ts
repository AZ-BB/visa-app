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
        p_search: search?.trim() || null,
        p_has_applications: hasApplications === "yes" ? "yes" : "all",
        p_sort: sort,
        p_order: sortDir,
    });

    if (error) {
        return { error: error.message };
    }

    const result = data;
    if (!result) {
        return { error: "Failed to fetch clients" };
    }
    if (result.error) {
        return { error: result.error };
    }

    const clients = result.clients ?? [];
    const total = result.total ?? 0;
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
