'use server';

import { Tables } from "@/database.types";
import GeneralResponse from "@/types/general";
import { createSupabaseAdminServerClient, createSupabaseServerClient } from "@/lib/supabase/supabase-server";
import { revalidatePath } from "next/cache";

export type AdminWithEmail = Tables<"admin"> & { email: string };

export async function getAdminById(
    id: string
): Promise<GeneralResponse<AdminWithEmail | null>> {
    try {
        const supabase = await createSupabaseServerClient();
        const { data, error } = await supabase.rpc("get_admin_by_id", {
            p_id: id,
        });

        if (error) {
            return { status: false, error: error.message };
        }

        const result = data as { error?: string } | AdminWithEmail | null;
        if (result && typeof result === "object" && "error" in result) {
            return { status: false, error: result.error };
        }

        return {
            status: true,
            data: result as AdminWithEmail | null,
        };
    } catch (err) {
        console.error(err);
        return { status: false, error: "Failed to get admin" };
    }
}

export async function getAdmins(page: number = 1, limit: number = 10, filter: {
    search?: string;
    role?: "ADMIN" | "SUPER_ADMIN";
    sort: 'first_name' | 'role' | "created_at" | "updated_at";
    order: "asc" | "desc";
}): Promise<GeneralResponse<{ admins: AdminWithEmail[]; total: number }>> {
    try {
        const supabase = await createSupabaseServerClient();

        const { data, error } = await supabase.rpc("get_admins", {
            p_page: page,
            p_limit: limit,
            p_search: filter.search ?? undefined,
            p_role: filter.role ?? undefined,
            p_sort: filter.sort,
            p_order: filter.order,
        });

        if (error) {
            return {
                status: false,
                error: error.message,
            };
        }

        console.log('Data');

        const result = data as { admins: AdminWithEmail[]; total: number };

        return {
            status: true,
            data: {
                admins: result?.admins ?? [],
                total: result?.total ?? 0,
            },
        };
    }
    catch (error) {
        console.error(error);
        return {
            status: false,
            error: "Failed to get admins",
        };
    }
}

export async function createAdmin(data: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    password: string;
    confirm_password?: string;
    role?: "ADMIN" | "SUPER_ADMIN";
}): Promise<GeneralResponse<null>> {
    try {
        const { first_name, last_name, email, phone, password, confirm_password } = data;
        const role = data.role ?? "ADMIN";

        if (!first_name?.trim()) {
            return { status: false, error: "First name is required" };
        }
        if (!last_name?.trim()) {
            return { status: false, error: "Last name is required" };
        }
        if (!email?.trim()) {
            return { status: false, error: "Email is required" };
        }
        if (!phone?.trim()) {
            return { status: false, error: "Phone is required" };
        }
        if (!password || password.length < 8) {
            return { status: false, error: "Password must be at least 8 characters" };
        }
        if (password !== confirm_password) {
            return { status: false, error: "Passwords do not match" };
        }

        const supabase = await createSupabaseAdminServerClient();

        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: email.trim(),
            password,
            user_metadata: {
                first_name: first_name.trim(),
                last_name: last_name.trim(),
            },
            email_confirm: true,
        });

        if (authError) {
            return {
                status: false,
                error: authError.message,
            };
        }

        if (!authData.user) {
            return {
                status: false,
                error: "Failed to create user",
            };
        }

        const { error: adminError } = await supabase
            .from("admin")
            .insert({
                id: authData.user.id,
                first_name: first_name.trim(),
                last_name: last_name.trim(),
                phone: phone.trim(),
                role,
            });

        if (adminError) {
            await supabase.auth.admin.deleteUser(authData.user.id);
            return {
                status: false,
                error: adminError.message,
            };
        }

        revalidatePath("/admin/admins", "page");

        return {
            status: true,
            data: null,
        };
    } catch (error) {
        console.error(error);
        return {
            status: false,
            error: "Failed to create admin",
        };
    }
}

export async function deleteAdmin(id: string): Promise<GeneralResponse<null>> {
    try {
        const supabase = await createSupabaseAdminServerClient();

        const { data: authData, error: authError } = await supabase.auth.admin.deleteUser(id, true);
        if (authError) {
            console.error(authError);
            return {
                status: false,
                error: 'Failed to delete admin',
            };
        }

        const { error } = await supabase
            .from("admin")
            .update({ deleted_at: new Date().toISOString() })
            .eq("id", id)

        const { error: applicationError } = await supabase
            .from("applications")
            .update({ assigned_to: null })
            .eq("assigned_to", id)
            .not("status", "eq", "COMPLETED");

        if (error || applicationError) {
            console.error(error, applicationError);
            return {
                status: false,
                error: 'Failed to delete admin',
            };
        }

        revalidatePath("/admin/admins", "page");
        revalidatePath("/admin/applications", "page");

        return {
            status: true,
            data: null,
        };
    }
    catch (error) {
        console.error(error);
        return {
            status: false,
            error: "Failed to delete admin",
        };
    }
}

export async function updateAdminPassword(
    id: string,
    password: string,
    confirmPassword: string
): Promise<GeneralResponse<null>> {
    try {
        if (!password || password.length < 8) {
            return { status: false, error: "Password must be at least 8 characters" };
        }
        if (password !== confirmPassword) {
            return { status: false, error: "Passwords do not match" };
        }

        const supabase = await createSupabaseAdminServerClient();
        const { error } = await supabase.auth.admin.updateUserById(id, { password });

        if (error) {
            return { status: false, error: error.message };
        }

        revalidatePath("/admin/admins", "page");
        revalidatePath(`/admin/admins/${id}`);

        return { status: true, data: null };
    } catch (err) {
        console.error(err);
        return { status: false, error: "Failed to update password" };
    }
}

export async function updateAdmin(id: string, admin: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    role?: "ADMIN" | "SUPER_ADMIN";
}): Promise<GeneralResponse<null>> {
    try {
        const supabase = await createSupabaseServerClient();
        const { error } = await supabase
            .from("admin")
            .update(admin)
            .eq("id", id)

        if (error) {
            console.error(error);
            return {
                status: false,
                error: error.message,
            };
        }

        revalidatePath("/admin/admins", "page");
        revalidatePath(`/admin/admins/${id}`);

        return {
            status: true,
            data: null,
        };
    }
    catch (error) {
        console.error(error);
        return {
            status: false,
            error: "Failed to update admin",
        };
    }
}