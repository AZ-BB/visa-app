"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
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
import { createSupabaseBrowserClient } from "@/lib/supabase/supabase-browser";
import { signUp } from "@/actions/auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { ApplicationOrder } from "./ApplicationOrderContext";
import { PHONE_DIAL_CODES } from "@/lib/phone-codes";
import { CountryFlag } from "@/components/ui/country-flag";

interface CheckoutAuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: ApplicationOrder;
  redirectUrl: string;
  emailExists: boolean | null;
}

export function CheckoutAuthModal({
  open,
  onOpenChange,
  order,
  redirectUrl,
  emailExists,
}: CheckoutAuthModalProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(signUp, null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginIsPending, setLoginIsPending] = useState(false);
  const [selectedExtension, setSelectedExtension] = useState(PHONE_DIAL_CODES[0]?.code || "+1");
  const [phoneInput, setPhoneInput] = useState("");

  const firstName = order.travellers[0]?.first_name ?? "";
  const lastName = order.travellers[0]?.last_name ?? "";
  const contactEmail = order.contact_email ?? "";

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

  async function handleLoginSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoginError(null);
    setLoginIsPending(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email?.trim()) {
      setLoginError("Email is required");
      setLoginIsPending(false);
      return;
    }
    if (!password) {
      setLoginError("Password is required");
      setLoginIsPending(false);
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoginIsPending(false);

    if (signInError) {
      setLoginError(signInError.message);
      return;
    }

    router.push(redirectUrl);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {emailExists === null ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : emailExists ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">Sign in</DialogTitle>
              <DialogDescription className="text-secondary-copy">
                This email already has an account. Sign in directly.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm font-medium"
                >
                  {loginError}
                </div>
              )}
              <section className="flex flex-col gap-2">
                <Label htmlFor="checkout-login-email" className="text-sm">
                  Email
                </Label>
                <Input
                  type="email"
                  id="checkout-login-email"
                  name="email"
                  required
                  defaultValue={contactEmail}
                  placeholder="example@email.com"
                  disabled={loginIsPending}
                  className="px-4 py-3.5 text-base rounded-xl"
                />
              </section>
              <section className="flex flex-col gap-2">
                <Label htmlFor="checkout-login-password" className="text-sm">
                  Password
                </Label>
                <Input
                  type="password"
                  id="checkout-login-password"
                  name="password"
                  required
                  placeholder="Enter your password"
                  disabled={loginIsPending}
                  className="px-4 py-3.5 text-base rounded-xl"
                />
              </section>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={loginIsPending}
                  className="flex gap-2 group items-center pl-10 pr-3 py-6 rounded-full text-base"
                >
                  {loginIsPending ? "Logging in…" : "Login"}
                  <div className="w-7 h-7 rounded-full bg-[#0A8EFF] group-hover:bg-[#0A8EFF]/10 ml-3 transition-colors duration-200 flex items-center justify-center">
                    <ChevronRightIcon className="size-4" />
                  </div>
                </Button>
              </div>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">Create account</DialogTitle>
              <DialogDescription className="text-secondary-copy">
                Sign up to continue to payment.
              </DialogDescription>
            </DialogHeader>
            <form action={formAction} className="space-y-4">
              <input type="hidden" name="redirectUrl" value={redirectUrl} />
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
                  <Label htmlFor="checkout-firstName" className="text-sm">
                    First name
                  </Label>
                  <Input
                    type="text"
                    id="checkout-firstName"
                    name="firstName"
                    required
                    defaultValue={firstName}
                    placeholder="First name"
                    disabled={isPending}
                    className="px-4 py-3.5 text-base rounded-xl"
                  />
                </section>
                <section className="flex flex-col gap-2 flex-1">
                  <Label htmlFor="checkout-lastName" className="text-sm">
                    Last name
                  </Label>
                  <Input
                    type="text"
                    id="checkout-lastName"
                    name="lastName"
                    required
                    defaultValue={lastName}
                    placeholder="Last name"
                    disabled={isPending}
                    className="px-4 py-3.5 text-base rounded-xl"
                  />
                </section>
              </section>
              <section className="flex flex-col gap-2">
                <Label htmlFor="checkout-email" className="text-sm">
                  Email
                </Label>
                <Input
                  type="email"
                  id="checkout-email"
                  name="email"
                  required
                  defaultValue={contactEmail}
                  placeholder="example@email.com"
                  disabled={isPending}
                  className="px-4 py-3.5 text-base rounded-xl"
                />
              </section>
              <section className="flex flex-col gap-2">
                <Label htmlFor="checkout-phone" className="text-sm">
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
                    id="checkout-phone"
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
                <Label htmlFor="checkout-password" className="text-sm">
                  Password
                </Label>
                <Input
                  type="password"
                  id="checkout-password"
                  name="password"
                  minLength={8}
                  placeholder="At least 8 characters"
                  disabled={isPending}
                  className="px-4 py-3.5 text-base rounded-xl"
                />
              </section>
              <section className="flex flex-col gap-2">
                <Label htmlFor="checkout-confirmPassword" className="text-sm">
                  Confirm password
                </Label>
                <Input
                  type="password"
                  id="checkout-confirmPassword"
                  name="confirmPassword"
                  minLength={8}
                  placeholder="Confirm your password"
                  disabled={isPending}
                  className="px-4 py-3.5 text-base rounded-xl"
                />
              </section>
              <div className="flex justify-end">
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
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
