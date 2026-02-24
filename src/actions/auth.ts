"use server";

import { createSupabaseAdminServerClient, createSupabaseServerClient } from "@/lib/supabase/supabase-server";
import GeneralResponse from "@/types/general";
import { redirect } from "next/navigation";


export async function signUp(
    _prevState: GeneralResponse<null> | null,
    formData: FormData
): Promise<GeneralResponse<null>> {
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!firstName?.trim()) {
        return { error: "First name is required" };
    }
    if (!lastName?.trim()) {
        return { error: "Last name is required" };
    }
    if (!email?.trim()) {
        return { error: "Email is required" };
    }
    if (!password || password.length < 8) {
        return { error: "Password must be at least 8 characters" };
    }
    if (password !== confirmPassword) {
        return { error: "Passwords do not match" };
    }

    const supabase = await createSupabaseAdminServerClient();

    const { data, error } = await supabase.auth.admin.createUser({
        email: email.trim(),
        password,
        user_metadata: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
        },
        role: "user",
        email_confirm: true,
    });

    if (data.user) {
        const { data: profileData, error: profileError } = await supabase.from("profiles").insert({
            id: data.user?.id,
            email: email.trim(),
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            phone: ""
        });

        if (profileError) {
            await supabase.auth.admin.deleteUser(data.user?.id);
            return { error: profileError.message };
        }
    }

    if (error) {
        return { error: error.message };
    }

    const serverClient = await createSupabaseServerClient();
    const { error: signInError } = await serverClient.auth.signInWithPassword({
        email: email.trim(),
        password,
    });

    if (signInError) {
        return { error: signInError.message };
    }

    redirect("/");
}

export async function logout(): Promise<void> {
    const serverClient = await createSupabaseServerClient();
    await serverClient.auth.signOut();
    redirect("/");
}