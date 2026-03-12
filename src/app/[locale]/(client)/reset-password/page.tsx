"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/supabase-browser";
import { useRouter } from "next/navigation";

type PageState = "verifying" | "ready" | "invalid" | "error";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [state, setState] = useState<PageState>("verifying");
    const [verifyError, setVerifyError] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);

    const tokenHash = searchParams.get("token_hash");
    const type = searchParams.get("type");

    useEffect(() => {
        if (!tokenHash || type !== "recovery") {
            setState("invalid");
            return;
        }

        const supabase = createSupabaseBrowserClient();

        supabase.auth
            .verifyOtp({ type: "recovery", token_hash: tokenHash })
            .then(({ error: verifyErr }) => {
                if (verifyErr) {
                    setVerifyError(verifyErr.message);
                    setState("error");
                    return;
                }
                setState("ready");
            })
            .catch(() => {
                setVerifyError("Failed to verify link");
                setState("error");
            });
    }, [tokenHash, type]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setIsPending(true);

        const form = e.currentTarget;
        const formData = new FormData(form);
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        if (!password || password.length < 8) {
            setError("Password must be at least 8 characters");
            setIsPending(false);
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setIsPending(false);
            return;
        }

        const supabase = createSupabaseBrowserClient();
        const { error: updateError } = await supabase.auth.updateUser({ password });

        setIsPending(false);

        if (updateError) {
            setError(updateError.message);
            return;
        }

        router.push("/login");
        router.refresh();
    }

    if (state === "verifying") {
        return (
            <div className="min-h-screen flex items-start justify-center px-6 pt-24 sm:pt-[20vh]">
                <div className="w-full max-w-xl">
                    <h2 className="text-4xl font-bold text-primary-copy">Verifying link…</h2>
                    <p className="text-secondary-copy text-sm mt-2">Please wait.</p>
                </div>
            </div>
        );
    }

    if (state === "invalid") {
        return (
            <div className="min-h-screen flex items-start justify-center px-6 pt-24 sm:pt-[20vh]">
                <div className="w-full max-w-xl space-y-4">
                    <h2 className="text-4xl font-bold text-primary-copy">Invalid or expired link</h2>
                    <p className="text-secondary-copy text-sm">
                        This password reset link is invalid or has expired. Please request a new one.
                    </p>
                    <Link
                        href="/forgot-password"
                        className="text-primary text-sm font-semibold hover:text-primary-dark transition-colors hover:underline"
                    >
                        Request new reset link
                    </Link>
                    <div>
                        <Link
                            href="/login"
                            className="text-secondary-copy text-xs font-semibold hover:text-primary-dark transition-colors hover:underline"
                        >
                            Back to login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (state === "error") {
        return (
            <div className="min-h-screen flex items-start justify-center px-6 pt-24 sm:pt-[20vh]">
                <div className="w-full max-w-xl space-y-4">
                    <h2 className="text-4xl font-bold text-primary-copy">Link verification failed</h2>
                    <p className="text-secondary-copy text-sm">
                        {verifyError ?? "This link may have expired. Please request a new one."}
                    </p>
                    <Link
                        href="/forgot-password"
                        className="text-primary text-sm font-semibold hover:text-primary-dark transition-colors hover:underline"
                    >
                        Request new reset link
                    </Link>
                    <div>
                        <Link
                            href="/login"
                            className="text-secondary-copy text-xs font-semibold hover:text-primary-dark transition-colors hover:underline"
                        >
                            Back to login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-start justify-center px-6 pt-24 sm:pt-[20vh]">
            <div className="w-full max-w-xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <h2 className="text-4xl font-bold text-primary-copy">Reset password</h2>

                    <p className="text-secondary-copy text-sm">
                        Enter your new password below.
                    </p>

                    {error && (
                        <div
                            role="alert"
                            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm font-medium"
                        >
                            {error}
                        </div>
                    )}

                    <section className="flex flex-col gap-2">
                        <Label htmlFor="password" className="text-sm">New password</Label>
                        <Input
                            type="password"
                            id="password"
                            name="password"
                            required
                            minLength={8}
                            placeholder="Enter new password"
                            disabled={isPending}
                            className="px-4 py-3.5 text-base rounded-xl"
                        />
                    </section>

                    <section className="flex flex-col gap-2">
                        <Label htmlFor="confirmPassword" className="text-sm">Confirm password</Label>
                        <Input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            required
                            minLength={8}
                            placeholder="Confirm new password"
                            disabled={isPending}
                            className="px-4 py-3.5 text-base rounded-xl"
                        />
                    </section>

                    <section className="space-y-1 flex justify-between">
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="flex gap-2 group items-center pl-10 pr-3 py-6 rounded-lg text-xl w-full"
                        >
                            {isPending ? "Updating…" : "Update password"}
                        </Button>
                    </section>

                    <div>
                        <Link
                            href="/login"
                            className="text-secondary-copy text-xs font-semibold hover:text-primary-dark transition-colors hover:underline"
                        >
                            Back to login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-start justify-center px-6 pt-24 sm:pt-[20vh]">
                    <div className="w-full max-w-xl">
                        <h2 className="text-4xl font-bold text-primary-copy">Loading…</h2>
                    </div>
                </div>
            }
        >
            <ResetPasswordForm />
        </Suspense>
    );
}
