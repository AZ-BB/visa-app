"use server";

import { createSupabaseAdminServerClient, createSupabaseServerClient } from "@/lib/supabase/supabase-server";
import GeneralResponse from "@/types/general";
import { redirect } from "next/navigation";

export async function checkEmailExists(email: string): Promise<{ exists: boolean } | { error: string }> {
    if (!email?.trim()) {
        return { exists: false };
    }
    try {
        const supabase = await createSupabaseAdminServerClient();
        const { data, error } = await supabase
            .from("profiles")
            .select("id")
            .eq("email", email.trim())
            .limit(1)
            .maybeSingle();

        if (error) {
            return { error: error.message };
        }
        return { exists: !!data };
    } catch {
        return { error: "Failed to check email" };
    }
}

export async function signUp(
    _prevState: GeneralResponse<null> | null,
    formData: FormData
): Promise<GeneralResponse<null>> {
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const phoneExtension = (formData.get("phoneExtension") as string)?.trim() || "";
    const phoneNumber = (formData.get("phone") as string)?.trim() || "";
    const phone = phoneNumber ? `${phoneExtension} ${phoneNumber}`.trim() : "";

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
        email_confirm: true,
    });

    if (data.user) {
        const { data: profileData, error: profileError } = await supabase.from("profiles").insert({
            id: data.user?.id,
            email: email.trim(),
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            phone,
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

    const redirectUrl = (formData.get("redirectUrl") as string)?.trim();
    redirect(redirectUrl || "/");
}

export async function logout(): Promise<void> {
    const serverClient = await createSupabaseServerClient();
    await serverClient.auth.signOut();
    redirect("/");
}

export async function requestPasswordReset(email: string): Promise<{ success: true } | { error: string }> {
    if (!email?.trim()) {
        return { error: "Email is required" };
    }

    try {
        const supabase = await createSupabaseAdminServerClient();
        const { data, error } = await supabase.auth.admin.generateLink({
            type: "recovery",
            email: email.trim(),
        });

        if (error) {
            // Always return success for unknown emails (avoid email enumeration)
            return { success: true };
        }

        const hashedToken = data?.properties?.hashed_token;
        if (!hashedToken) {
            return { error: "Failed to generate reset link" };
        }

        const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
        const resetUrl = `${origin}/reset-password?token_hash=${hashedToken}&type=recovery`;

        // Placeholder: Replace with your email integration
        console.log("[Password Reset] Send this link to", email.trim(), ":", resetUrl);

        return { success: true };
    } catch {
        return { error: "Failed to request password reset" };
    }
}