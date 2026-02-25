"use server"
import { createSupabaseServerClient } from "./supabase/supabase-server"

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
        profile: profileData,
        admin: admin,
        role: role,
    }
}
