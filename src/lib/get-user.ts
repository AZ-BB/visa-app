"use server"
import { Tables } from "@/database.types";
import { createSupabaseServerClient } from "./supabase/supabase-server"

export type AuthUser = {
    authUser: Awaited<ReturnType<Awaited<ReturnType<typeof createSupabaseServerClient>>["auth"]["getUser"]>>["data"]["user"];
    profile: Tables<"profiles"> | null;
    admin: Tables<"admin"> | null;
    role: string | null;
} | null

export async function getUser() {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return null
    }

    let role = null
    let admin = null

    const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .limit(1)

    if (profileError) {
        console.error("Error getting profile: ", profileError)
        return null
    }

    if (profileData.length > 0) {
        role = "user"
    }
    else {
        const { data: adminData, error: adminError } = await supabase
            .from("admin")
            .select("*")
            .eq("id", user.id)
            .limit(1)

        if (adminError) {
            console.error("Error getting admin: ", adminError)
            return null
        }

        if (adminData.length > 0) {
            role = "admin"
            admin = adminData[0]
        }
    }

    return {
        authUser: user,
        profile: profileData[0] ?? null,
        admin: admin,
        role: role,
    }
}
