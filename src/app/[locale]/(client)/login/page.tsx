"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/supabase-browser";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setIsPending(true);

        const form = e.currentTarget;
        const formData = new FormData(form);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        if (!email?.trim()) {
            setError("Email is required");
            setIsPending(false);
            return;
        }
        if (!password) {
            setError("Password is required");
            setIsPending(false);
            return;
        }

        const supabase = createSupabaseBrowserClient();
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password
        });

        setIsPending(false);

        if (signInError) {
            setError(signInError.message);
            return;
        }

        router.push("/");
        router.refresh();
    }

    return (
        <div className="min-h-screen flex items-start justify-center px-6 pt-24  sm:pt-[20vh]">
            <div className="w-full max-w-xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <h2 className="text-4xl font-bold text-primary-copy">Login</h2>

                    <p className="text-secondary-copy text-sm">
                        Login to manage your visa applications and track your journey.
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

                    <section className="flex flex-col gap-2">
                        <Label htmlFor="password" className="text-sm">Password</Label>
                        <Input
                            type="password"
                            id="password"
                            name="password"
                            required
                            placeholder="Enter your password"
                            disabled={isPending}
                            className="px-4 py-3.5 text-base rounded-xl"
                        />
                        <div>
                            <Link
                                href="/forgot-password"
                                className="text-secondary-copy text-xs font-semibold hover:text-primary-dark transition-colors hover:underline"
                            >
                                Forgot password?
                            </Link>
                        </div>
                    </section>

                    <section className="space-y-1 flex justify-between">
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="flex gap-2 group items-center pl-10 pr-3 py-6 rounded-lg text-xl w-full"
                        >
                            {isPending ? "Logging in…" : "Login"}
                        </Button>
                    </section>

                    <div>
                        <h3 className="text-xs font-bold text-secondary-copy">
                            Don&apos;t have an account?
                        </h3>
                        <Link
                            href="/signup"
                            className="text-primary text-xs font-semibold hover:text-primary-dark transition-colors hover:underline"
                        >
                            Create account instead
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
