"use client";

import { useRouter } from "@/i18n/navigation";
import { useEffect, useTransition, useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader2, Mail, Lock, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Link } from "@/i18n/navigation";
import {
  loginAction,
  resetPasswordAction,
  getUserProfileAction,
} from "@/actions/auth";
import { useUserStore } from "@/stores/userStore";

function LoginForm({ showToast }: { showToast?: boolean }) {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const t = useTranslations("auth");

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (showToast) {
      toast.success(t("pages.login.accountCreated"));
    }
  }, [showToast, t]);

  // Redirect if user already exists
  useEffect(() => {
    if (user) {
      router.replace(`/${user.role}/dashboard`);
    }
  }, [user, router]);

  const handleLoginSubmit = (formData: FormData) => {
    startTransition(async () => {
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      const result = await loginAction(email, password);

      if (result.success && result.user) {
        // After successful login, fetch the complete user profile from the database
        // This includes additional user data not available in the auth user object
        const profileResult = await getUserProfileAction();

        if (profileResult.success && profileResult.user) {
          // Update the Zustand store with the complete user profile
          setUser(profileResult.user);
          toast.success(t("pages.login.loginSuccessful"));
          // Redirect to the appropriate dashboard based on user role
          router.replace(`/${profileResult.user.role}/dashboard`);
        } else {
          // If profile fetch fails, show error but keep the auth user
          // This allows the user to still access the app, though with limited data
          console.error("Failed to load user profile:", profileResult.errorMessage);
          toast.error(t("pages.login.failedToLoadProfile"));
          // Fallback: use the auth user if profile fetch fails
          if (result.user) {
            setUser(result.user as any); // Temporary fallback
            router.replace(`/${result.user.user_metadata?.role || "customer"}/dashboard`);
          }
        }
      } else {
        // Login failed - show error message
        toast.error(result.errorMessage || "Login failed. Please try again.");
      }
    });
  };

  const handleForgotPasswordSubmit = (formData: FormData) => {
    startTransition(async () => {
      const email = formData.get("email") as string;

      const result = await resetPasswordAction(email);

      if (!result.errorMessage) {
        toast.success(t("forgotPassword.resetEmailSent"));
        setIsForgotPassword(false);
      } else {
        toast.error(result.errorMessage);
      }
    });
  };

  if (isForgotPassword) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="text-center">
          <button
            onClick={() => setIsForgotPassword(false)}
            className="inline-flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors duration-200 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t("forgotPassword.backToLogin")}</span>
          </button>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
            {t("forgotPassword.title")}
          </h2>
          <p className="text-[var(--color-text-secondary)] text-sm">
            {t("forgotPassword.description")}
          </p>
        </div>

        <form
          action={handleForgotPasswordSubmit}
          className="space-y-4 sm:space-y-6"
        >
          <div className="space-y-1.5 sm:space-y-2">
            <Label
              htmlFor="forgot-email"
              className="text-sm font-medium text-[var(--color-text-primary)]"
            >
              {t("pages.login.emailLabel")}
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
              <Input
                id="forgot-email"
                name="email"
                placeholder={t("pages.login.emailPlaceholder")}
                type="email"
                required
                disabled={isPending}
                className="pl-10 h-11 sm:h-12 text-base border-[var(--color-border)] focus:border-[var(--color-secondary)] focus:ring-[var(--color-secondary)] transition-all duration-200"
                autoComplete="email"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-11 sm:h-12 bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white font-medium text-base shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {isPending ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t("forgotPassword.sendingEmail")}</span>
              </div>
            ) : (
              t("forgotPassword.sendResetLink")
            )}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <form
      action={handleLoginSubmit}
      className="space-y-4 sm:space-y-6"
      role="form"
      aria-label="Login form"
    >
      <div className="space-y-3 sm:space-y-4">
        <div className="space-y-1.5 sm:space-y-2">
          <Label
            htmlFor="email"
            className="text-sm font-medium text-[var(--color-text-primary)]"
          >
            {t("pages.login.emailLabel")}
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
            <Input
              id="email"
              name="email"
              placeholder={t("pages.login.emailPlaceholder")}
              type="email"
              required
              disabled={isPending}
              className="pl-10 h-11 sm:h-12 text-base border-[var(--color-border)] focus:border-[var(--color-secondary)] focus:ring-[var(--color-secondary)] transition-all duration-200"
              autoComplete="email"
            />
          </div>
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <Label
            htmlFor="password"
            className="text-sm font-medium text-[var(--color-text-primary)]"
          >
            {t("pages.login.passwordLabel")}
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
            <Input
              id="password"
              name="password"
              placeholder={t("pages.login.passwordPlaceholder")}
              type={showPassword ? "text" : "password"}
              required
              disabled={isPending}
              className="pl-10 pr-10 h-11 sm:h-12 text-base border-[var(--color-border)] focus:border-[var(--color-secondary)] focus:ring-[var(--color-secondary)] transition-all duration-200"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors duration-200"
              disabled={isPending}
              aria-label={showPassword ? t("hidePassword") : t("showPassword")}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-11 sm:h-12 bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white font-medium text-base shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {isPending ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{t("pages.login.signingIn")}</span>
            </div>
          ) : (
            t("pages.login.signIn")
          )}
        </Button>

        <div className="text-center space-y-2">
          <button
            type="button"
            onClick={() => setIsForgotPassword(true)}
            className="text-sm text-[var(--color-secondary)] hover:text-[var(--color-secondary-dark)] font-medium transition-colors duration-200"
          >
            {t("pages.login.forgotPassword")}
          </button>

          <p className="text-sm text-[var(--color-text-secondary)]">
            {t("pages.login.noAccount")}{" "}
            <Link
              href="/sign-up"
              className={`text-[var(--color-secondary)] hover:text-[var(--color-secondary-dark)] font-medium transition-colors duration-200 ${
                isPending ? "pointer-events-none opacity-50" : ""
              }`}
            >
              {t("pages.login.signUpHere")}
            </Link>
          </p>
        </div>
      </div>
    </form>
  );
}

export default LoginForm;
