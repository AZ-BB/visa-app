"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { requestPasswordReset } from "@/actions/auth";

export default function ForgotPasswordPage() {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isPending, setIsPending] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        setIsPending(true);

        const form = e.currentTarget;
        const formData = new FormData(form);
        const email = (formData.get("email") as string)?.trim();

        if (!email) {
            setError("Email is required");
            setIsPending(false);
            return;
        }

        const result = await requestPasswordReset(email);
        setIsPending(false);

        if ("error" in result) {
            setError(result.error);
            return;
        }

        setSuccess(true);
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-start justify-center px-6 pt-24 sm:pt-[20vh]">
                <div className="w-full max-w-xl space-y-4">
                    <h2 className="text-4xl font-bold text-primary-copy">Check your email</h2>
                    <p className="text-secondary-copy text-sm">
                        If an account exists for that email, we&apos;ve logged a password reset link.
                        Check your server console for the link (placeholder until you add your email integration).
                    </p>
                    <Link
                        href="/login"
                        className="text-primary text-sm font-semibold hover:text-primary-dark transition-colors hover:underline"
                    >
                        Back to login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-start justify-center px-6 pt-24 sm:pt-[20vh]">
            <div className="w-full max-w-xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <h2 className="text-4xl font-bold text-primary-copy">Forgot password</h2>

                    <p className="text-secondary-copy text-sm">
                        Enter your email and we&apos;ll log a reset link (placeholder until you add your email integration).
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
                        <Label htmlFor="email" className="text-sm">Email</Label>
                        <Input
                            type="email"
                            id="email"
                            name="email"
                            required
                            placeholder="example@email.com"
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
                            {isPending ? "Sending…" : "Send reset link"}
                        </Button>
                    </section>

                    <div>
                        <Link
                            href="/login"
                            className="text-primary text-xs font-semibold hover:text-primary-dark transition-colors hover:underline"
                        >
                            Back to login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
