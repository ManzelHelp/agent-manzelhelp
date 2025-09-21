"use client";

import { useRouter } from "@/i18n/navigation";
import { useTransition, useEffect, useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader2, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { signUpAction } from "@/actions/auth";
import { useUserStore } from "@/stores/userStore";

function SignUpForm() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const t = useTranslations("auth");

  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if user already exists
  useEffect(() => {
    if (user) {
      router.replace(`/${user.role}/dashboard`);
    }
  }, [user, router]);

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      const userRole = formData.get("userRole") as string;

      try {
        const result = await signUpAction(email, password, userRole);

        if (result.success) {
          toast.success(t("pages.signUp.signUpSuccessful"), {
            description: t("pages.signUp.checkEmailVerification"),
          });
          router.replace("/wait-for-confirmation");
        } else {
          toast.error(result.errorMessage);
        }
      } catch (error) {
        console.error("Signup error:", error);
        toast.error(t("pages.signUp.unexpectedError"));
      }
    });
  };

  return (
    <form
      action={handleSubmit}
      className="space-y-4 sm:space-y-6"
      role="form"
      aria-label="Sign up form"
    >
      <div className="space-y-3 sm:space-y-4">
        <div className="space-y-1.5 sm:space-y-2">
          <Label
            htmlFor="email"
            className="text-sm font-medium text-[var(--color-text-primary)]"
          >
            {t("pages.signUp.emailLabel")}
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
            <Input
              id="email"
              name="email"
              placeholder={t("pages.signUp.emailPlaceholder")}
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
            {t("pages.signUp.passwordLabel")}
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
            <Input
              id="password"
              name="password"
              placeholder={t("pages.signUp.passwordPlaceholder")}
              type={showPassword ? "text" : "password"}
              required
              disabled={isPending}
              minLength={8}
              pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
              className="pl-10 pr-10 h-11 sm:h-12 text-base border-[var(--color-border)] focus:border-[var(--color-secondary)] focus:ring-[var(--color-secondary)] transition-all duration-200"
              autoComplete="new-password"
              aria-describedby="password-requirements"
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
          <div
            id="password-requirements"
            className="text-xs text-[var(--color-text-secondary)] space-y-1"
          >
            <p>{t("passwordRequirements.title")}</p>
            <ul className="list-disc list-inside space-y-0.5 ml-2">
              <li>{t("passwordRequirements.minCharacters")}</li>
              <li>{t("passwordRequirements.uppercaseLetter")}</li>
              <li>{t("passwordRequirements.lowercaseLetter")}</li>
              <li>{t("passwordRequirements.number")}</li>
              <li>{t("passwordRequirements.specialCharacter")}</li>
            </ul>
          </div>
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <Label
            htmlFor="userRole"
            className="text-sm font-medium text-[var(--color-text-primary)]"
          >
            {t("pages.signUp.userRoleLabel")}
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
            <select
              id="userRole"
              name="userRole"
              className="w-full h-11 sm:h-12 pl-10 pr-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-[var(--color-secondary)] disabled:opacity-50 text-base transition-all duration-200 bg-white"
              disabled={isPending}
              required
              defaultValue=""
            >
              <option value="" disabled>
                {t("pages.signUp.selectOption")}
              </option>
              <option value="customer">{t("pages.signUp.findHelp")}</option>
              <option value="tasker">{t("pages.signUp.becomeHelper")}</option>
            </select>
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
              <span>{t("pages.signUp.creatingAccount")}</span>
            </div>
          ) : (
            t("pages.signUp.createAccount")
          )}
        </Button>

        <div className="text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">
            {t("pages.signUp.alreadyHaveAccount")}{" "}
            <Link
              href="/login"
              className={`text-[var(--color-secondary)] hover:text-[var(--color-secondary-dark)] font-medium transition-colors duration-200 ${
                isPending ? "pointer-events-none opacity-50" : ""
              }`}
            >
              {t("pages.signUp.signInHere")}
            </Link>
          </p>
        </div>
      </div>
    </form>
  );
}

export default SignUpForm;
