"use client";

import { useState } from "react";
import { useActionState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
import { PhoneNumberInput } from "@/components/ui/phone-number-input";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("application.checkoutAuth");
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(signUp, null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginIsPending, setLoginIsPending] = useState(false);

  const firstName = order.travellers[0]?.first_name ?? "";
  const lastName = order.travellers[0]?.last_name ?? "";
  const contactEmail = order.contact_email ?? "";

  async function handleLoginSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoginError(null);
    setLoginIsPending(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email?.trim()) {
      setLoginError(t("emailRequired"));
      setLoginIsPending(false);
      return;
    }
    if (!password) {
      setLoginError(t("passwordRequired"));
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
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {emailExists === null ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : emailExists ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">{t("signIn")}</DialogTitle>
              <DialogDescription className="text-secondary-copy">
                {t("signInDescription")}
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
                  {t("email")}
                </Label>
                <Input
                  type="email"
                  id="checkout-login-email"
                  name="email"
                  required
                  defaultValue={contactEmail}
                  placeholder={t("emailPlaceholder")}
                  disabled={loginIsPending}
                  className="px-4 py-3.5 text-base rounded-xl"
                />
              </section>
              <section className="flex flex-col gap-2">
                <Label htmlFor="checkout-login-password" className="text-sm">
                  {t("password")}
                </Label>
                <Input
                  type="password"
                  id="checkout-login-password"
                  name="password"
                  required
                  placeholder={t("passwordPlaceholder")}
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
                  {loginIsPending ? t("loggingIn") : t("login")}
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
              <DialogTitle className="text-xl">{t("createAccount")}</DialogTitle>
              <DialogDescription className="text-secondary-copy">
                {t("createAccountDescription")}
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
                    {t("firstName")}
                  </Label>
                  <Input
                    type="text"
                    id="checkout-firstName"
                    name="firstName"
                    required
                    defaultValue={firstName}
                    placeholder={t("firstNamePlaceholder")}
                    disabled={isPending}
                    className="px-4 py-3.5 text-base rounded-xl"
                  />
                </section>
                <section className="flex flex-col gap-2 flex-1">
                  <Label htmlFor="checkout-lastName" className="text-sm">
                    {t("lastName")}
                  </Label>
                  <Input
                    type="text"
                    id="checkout-lastName"
                    name="lastName"
                    required
                    defaultValue={lastName}
                    placeholder={t("lastNamePlaceholder")}
                    disabled={isPending}
                    className="px-4 py-3.5 text-base rounded-xl"
                  />
                </section>
              </section>
              <section className="flex flex-col gap-2">
                <Label htmlFor="checkout-email" className="text-sm">
                  {t("email")}
                </Label>
                <Input
                  type="email"
                  id="checkout-email"
                  name="email"
                  required
                  defaultValue={contactEmail}
                  placeholder={t("emailPlaceholder")}
                  disabled={isPending}
                  className="px-4 py-3.5 text-base rounded-xl"
                />
              </section>
              <section className="flex flex-col gap-2">
                <Label htmlFor="phone" className="text-sm">
                  {t("phone")} <span className="text-secondary-copy text-base italic font-normal">{t("phoneOptional")}</span>
                </Label>
                <PhoneNumberInput disabled={isPending} />
              </section>
              <section className="flex flex-col gap-2">
                <Label htmlFor="checkout-password" className="text-sm">
                  {t("password")}
                </Label>
                <Input
                  type="password"
                  id="checkout-password"
                  name="password"
                  minLength={8}
                  placeholder={t("passwordHint")}
                  disabled={isPending}
                  className="px-4 py-3.5 text-base rounded-xl"
                />
              </section>
              <section className="flex flex-col gap-2">
                <Label htmlFor="checkout-confirmPassword" className="text-sm">
                  {t("confirmPassword")}
                </Label>
                <Input
                  type="password"
                  id="checkout-confirmPassword"
                  name="confirmPassword"
                  minLength={8}
                  placeholder={t("confirmPasswordPlaceholder")}
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
                  {isPending ? t("creatingAccount") : t("createAccountBtn")}
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
