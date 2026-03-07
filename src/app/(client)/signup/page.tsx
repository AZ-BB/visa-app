"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { useActionState, useState, useEffect } from "react";
import { signUp } from "@/actions/auth";
import { PHONE_DIAL_CODES } from "@/lib/phone-codes";
import { cn } from "@/lib/utils";
import { CountryFlag } from "@/components/ui/country-flag";

export default function SignUpPage() {
    const [state, formAction, isPending] = useActionState(signUp, null);
    const [selectedExtension, setSelectedExtension] = useState(PHONE_DIAL_CODES[0]?.code || "+1");
    const [phoneInput, setPhoneInput] = useState("");

    useEffect(() => {
        if (phoneInput.startsWith("+")) {
            for (let i = phoneInput.length; i >= 2; i--) {
                const prefix = phoneInput.substring(0, i);
                const match = PHONE_DIAL_CODES.find((c) => c.code === prefix);
                if (match) {
                    setSelectedExtension(match.code);
                    setPhoneInput(phoneInput.substring(i));
                    break;
                }
            }
        }
    }, [phoneInput]);

    const selectedCountry = PHONE_DIAL_CODES.find((c) => c.code === selectedExtension);

    return (
        <div className="min-h-screen flex items-start justify-center px-6 pt-24  sm:pt-[10vh]">
            <div className="w-full max-w-2xl">
                <form action={formAction} className="space-y-4">
                    <div className="flex flex-col gap-2 mb-8">
                        <h2 className="text-4xl font-bold text-primary-copy">Create account</h2>

                        <p className="text-secondary-copy text-sm">
                            Sign up to manage your visa applications and track your journey.
                        </p>
                    </div>

                    {state?.error && (
                        <div
                            role="alert"
                            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm font-medium"
                        >
                            {state.error}
                        </div>
                    )}

                    <section className="flex gap-3">
                        <section className="flex flex-col gap-2 flex-1">
                            <Label htmlFor="firstName" className="text-sm">First name</Label>
                            <Input
                                type="text"
                                id="firstName"
                                name="firstName"
                                required
                                placeholder="First name"
                                disabled={isPending}
                                className="px-4 py-3.5 text-base rounded-xl"
                            />
                        </section>
                        <section className="flex flex-col gap-2 flex-1">
                            <Label htmlFor="lastName" className="text-sm">Last name</Label>
                            <Input
                                type="text"
                                id="lastName"
                                name="lastName"
                                required
                                placeholder="Last name"
                                disabled={isPending}
                                className="px-4 py-3.5 text-base rounded-xl"
                            />
                        </section>
                    </section>

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
                        <Label htmlFor="phone" className="text-sm">
                            Phone <span className="text-secondary-copy text-base italic font-normal">(Optional)</span>
                        </Label>
                        <div className="flex gap-2">
                            <input type="hidden" name="phoneExtension" value={selectedExtension} />
                            <Select
                                value={selectedExtension}
                                onValueChange={setSelectedExtension}
                                disabled={isPending}
                            >
                                <SelectTrigger className="w-[140px] shrink-0 px-4 py-3.5 text-base rounded-xl" size="sm">
                                    <SelectValue>
                                        {selectedCountry && (
                                            <>
                                                <CountryFlag code={selectedCountry.countryCode} className="w-5 h-5" />
                                                <span>{selectedCountry.code}</span>
                                            </>
                                        )}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px]">
                                    {PHONE_DIAL_CODES.map(({ code, label, countryCode }, index) => (
                                        <SelectItem key={`${countryCode}-${index}`} value={code}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={phoneInput}
                                onChange={(e) => setPhoneInput(e.target.value)}
                                placeholder="Enter your phone number"
                                disabled={isPending}
                                className="px-4 py-3.5 text-base rounded-xl flex-1"
                            />
                        </div>
                    </section>

                    <section className="flex flex-col gap-2">
                        <Label htmlFor="password" className="text-sm">Password</Label>
                        <Input
                            type="password"
                            id="password"
                            name="password"
                            required
                            minLength={8}
                            placeholder="At least 8 characters"
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
                            placeholder="Confirm your password"
                            disabled={isPending}
                            className="px-4 py-3.5 text-base rounded-xl"
                        />
                    </section>

                    <section className="space-y-1 flex justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-secondary-copy">
                                Already have an account?
                            </h3>
                            <Link
                                href="/login"
                                className="text-primary text-sm font-semibold hover:text-primary-dark transition-colors hover:underline"
                            >
                                Login instead
                            </Link>
                        </div>

                        <div>
                            <Button
                                type="submit"
                                disabled={isPending}
                                className="flex gap-2 group items-center pl-5 pr-3 py-6 rounded-full text-base"
                            >
                                {isPending ? "Creating account…" : "Create account"}
                                <div className="w-7 h-7 rounded-full bg-[#0A8EFF] group-hover:bg-[#0A8EFF]/10 transition-colors duration-200 flex items-center justify-center">
                                    <ChevronRightIcon className="size-4" />
                                </div>
                            </Button>
                        </div>

                    </section>

                    <section className="w-full flex justify-end">

                    </section>
                </form>
            </div>
        </div>
    );
}
