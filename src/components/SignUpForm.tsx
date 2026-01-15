"use client";
import { useRouter } from "@/i18n/navigation";
import { useTransition, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader2, Mail, Lock, Eye, EyeOff, Search, Briefcase, Check } from "lucide-react";
import { signUpAction } from "@/actions/auth";
import { useUserStore } from "@/stores/userStore";
import { signupSchema } from "@/lib/schemas/auth";

function SignUpForm() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const t = useTranslations("auth");
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) router.replace(`/${user.role}/dashboard`);
  }, [user, router]);

  const handleOnSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const rawData = {
      email: (formData.get("email") || "").toString(),
      password: (formData.get("password") || "").toString(),
      userRole: (formData.get("userRole") || "").toString(),
    };
    const validation = signupSchema.safeParse(rawData);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        errors[field] = issue.message;
      });
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    startTransition(async () => {
      try {
        const result = await signUpAction(
          rawData.email,
          rawData.password,
          rawData.userRole
        );
        if (result.success) {
          toast({
            variant: "success",
            title: t("pages.signUp.signUpSuccessful"),
            description: t("pages.signUp.checkEmailVerification"),
          });
          router.replace("/wait-for-confirmation");
        } else {
          const errorMessage =
            result.errorMessage || "Une erreur est survenue";
          let title = "Erreur";
          if (
            errorMessage.includes("déjà utilisé") ||
            errorMessage.includes("already")
          ) {
            title = "Email déjà utilisé";
          }
          toast({
            variant: "destructive",
            title,
            description: errorMessage,
          });
        }
      } catch {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: t("pages.signUp.unexpectedError"),
        });
      }
    });
  };

  return (
    <form onSubmit={handleOnSubmit} noValidate className="space-y-6">
      {/* EMAIL */}
      <div className="space-y-2">
        <Label htmlFor="email">{t("pages.signUp.emailLabel")}</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            name="email"
            type="email"
            disabled={isPending}
            placeholder={t("pages.signUp.emailPlaceholder")}
            className={`pl-10 h-12 ${
              formErrors.email ? "border-red-500 focus-visible:ring-red-500" : ""
            }`}
            onChange={() => {
              if (formErrors.email) {
                setFormErrors((prev) => {
                  const e = { ...prev };
                  delete e.email;
                  return e;
                });
              }
            }}
          />
        </div>
        {formErrors.email && (
          <p className="text-sm text-red-500">{formErrors.email}</p>
        )}
      </div>
      {/* PASSWORD */}
      <div className="space-y-2">
        <Label htmlFor="password">{t("pages.signUp.passwordLabel")}</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            disabled={isPending}
            className={`pl-10 pr-10 h-12 ${
              formErrors.password
                ? "border-red-500 focus-visible:ring-red-500"
                : ""
            }`}
            onChange={() => {
              if (formErrors.password) {
                setFormErrors((prev) => {
                  const e = { ...prev };
                  delete e.password;
                  return e;
                });
              }
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {formErrors.password && (
          <p className="text-sm text-red-500">{formErrors.password}</p>
        )}
      </div>
      {/* USER ROLE – STYLE PREMIUM WOW */}
      <div className="space-y-2">
        <Label>{t("pages.signUp.userRoleLabel")}</Label>
        <div className="flex gap-4">
          {/* CUSTOMER */}
          <label className="flex-1 group relative">
            <input
              type="radio"
              name="userRole"
              value="customer"
              className="peer hidden"
              required
              disabled={isPending}
              onChange={() => {
                if (formErrors.userRole) {
                  setFormErrors((prev) => {
                    const e = { ...prev };
                    delete e.userRole;
                    return e;
                  });
                }
              }}
            />
            <div className="h-11 px-5 flex items-center justify-center rounded-2xl border-2 border-transparent bg-white/80 dark:bg-[var(--color-surface)] backdrop-blur-sm shadow-md text-sm font-semibold text-gray-800 dark:text-[var(--color-text-primary)] cursor-pointer
                transition-all duration-300 ease-out
                peer-checked:border-[#48bb93] peer-checked:bg-gradient-to-r peer-checked:from-[#48bb93] peer-checked:to-[#3da682] peer-checked:text-white peer-checked:shadow-2xl peer-checked:shadow-[#48bb93]/50 peer-checked:scale-105 peer-checked:ring-4 peer-checked:ring-[#48bb93]/30
                hover:border-[#48bb93]/50 hover:bg-[#48bb93]/10 dark:hover:bg-[#48bb93]/20 hover:shadow-xl hover:scale-[1.02] hover:ring-2 hover:ring-[#48bb93]/20">
              <div className="flex items-center">
                <Search className="mr-2 h-5 w-5 text-[#48bb93] group-hover:scale-110 transition-transform peer-checked:text-white" />
                <span>{t("pages.signUp.findHelp")}</span>
                <Check className="ml-2 h-4 w-4 opacity-0 peer-checked:opacity-100 transition-opacity text-white" />
              </div>
            </div>
          </label>
          {/* TASKER */}
          <label className="flex-1 group relative">
            <input
              type="radio"
              name="userRole"
              value="tasker"
              className="peer hidden"
              required
              disabled={isPending}
              onChange={() => {
                if (formErrors.userRole) {
                  setFormErrors((prev) => {
                    const e = { ...prev };
                    delete e.userRole;
                    return e;
                  });
                }
              }}
            />
            <div className="h-11 px-5 flex items-center justify-center rounded-2xl border-2 border-transparent bg-white/80 dark:bg-[var(--color-surface)] backdrop-blur-sm shadow-md text-sm font-semibold text-gray-800 dark:text-[var(--color-text-primary)] cursor-pointer
                transition-all duration-300 ease-out
                peer-checked:border-[#48bb93] peer-checked:bg-gradient-to-r peer-checked:from-[#48bb93] peer-checked:to-[#3da682] peer-checked:text-white peer-checked:shadow-2xl peer-checked:shadow-[#48bb93]/50 peer-checked:scale-105 peer-checked:ring-4 peer-checked:ring-[#48bb93]/30
                hover:border-[#48bb93]/50 hover:bg-[#48bb93]/10 dark:hover:bg-[#48bb93]/20 hover:shadow-xl hover:scale-[1.02] hover:ring-2 hover:ring-[#48bb93]/20">
              <div className="flex items-center">
                <Briefcase className="mr-2 h-5 w-5 text-[#48bb93] group-hover:scale-110 transition-transform peer-checked:text-white" />
                <span>{t("pages.signUp.becomeHelper")}</span>
                <Check className="ml-2 h-4 w-4 opacity-0 peer-checked:opacity-100 transition-opacity text-white" />
              </div>
            </div>
          </label>
        </div>
        {formErrors.userRole && (
          <p className="text-sm text-red-500">{formErrors.userRole}</p>
        )}
      </div>
      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-12 bg-gradient-to-r from-[#48bb93] to-[#3da682] hover:from-[#3da682] hover:to-[#48bb93] text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
      >
        {isPending ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          t("pages.signUp.createAccount")
        )}
      </Button>
    </form>
  );
}

export default SignUpForm;