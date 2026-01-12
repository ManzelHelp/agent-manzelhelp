"use client";

import { useRouter } from "@/i18n/navigation";
import { useEffect, useTransition, useState } from "react";
import { useToast } from "@/hooks/use-toast"; // Changement : Système Shadcn
import { useTranslations } from "next-intl";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader2, Mail, Lock, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { loginAction, resetPasswordAction, getUserProfileAction } from "@/actions/auth";
import { useUserStore } from "@/stores/userStore";
import { loginSchema, forgotPasswordSchema } from "@/lib/schemas/auth"; // Schémas centralisés

function LoginForm({ showToast }: { showToast?: boolean }) {
  const router = useRouter();
  const { toast } = useToast();
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [forgotPasswordError, setForgotPasswordError] = useState("");
  const t = useTranslations("auth");
  const [isPending, startTransition] = useTransition();

  // Toast de bienvenue si on vient du Sign-up
  useEffect(() => {
    if (showToast) {
      toast({
        variant: "success",
        title: "Compte créé !",
        description: t("pages.login.accountCreated"),
      });
    }
  }, [showToast, t, toast]);

  // Redirection automatique si déjà connecté
  useEffect(() => {
    if (user) {
      router.replace(`/${user.role}/dashboard`);
    }
  }, [user, router]);

  // --- LOGIQUE DE CONNEXION ---
  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Nettoyage des données pour Zod
    const rawData = {
      email: (formData.get("email") || "").toString(),
      password: (formData.get("password") || "").toString(),
    };

    // 1. Validation Zod (Front-end) - Messages inline sous les champs
    const validation = loginSchema.safeParse(rawData);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        errors[field] = issue.message;
      });
      setFormErrors(errors);
      // Pas de toast pour les erreurs de validation front-end
      return;
    }
    
    // Clear errors if validation passes
    setFormErrors({});

    startTransition(async () => {
      try {
        const result = await loginAction(rawData.email, rawData.password);
        
        if (result.success && result.user) {
          const profileResult = await getUserProfileAction();

          if (profileResult.success && profileResult.user) {
            setUser(profileResult.user);
            
            // TOAST SUCCÈS PREMIUM
            toast({
              variant: "success",
              title: "Heureux de vous revoir !",
              description: t("pages.login.loginSuccessful"),
            });
            
            router.push(`/${profileResult.user.role}/dashboard`);
          }
        } else {
          // Erreur serveur (back-end) - Toast uniquement
          // Exemples : "Aucun compte trouvé avec cet email", "Mot de passe incorrect", etc.
          const errorMessage = result.errorMessage || "Vérifiez vos identifiants.";
          
          // Messages spécifiques pour améliorer l'UX
          let title = "Échec de connexion";
          if (errorMessage.includes("Aucun compte trouvé")) {
            title = "Compte introuvable";
          } else if (errorMessage.includes("mot de passe incorrect")) {
            title = "Mot de passe incorrect";
          }
          
          toast({
            variant: "destructive",
            title: title,
            description: errorMessage,
          });
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: t("pages.login.unexpectedError"),
        });
      }
    });
  };

  // --- LOGIQUE MOT DE PASSE OUBLIÉ ---
  const handleForgotPasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") || "").toString();

    // Validation Zod (Front-end) - Message inline sous le champ
    const validation = forgotPasswordSchema.safeParse({ email });
    if (!validation.success) {
      const errorMessage = validation.error.issues[0].message;
      setForgotPasswordError(errorMessage);
      // Pas de toast pour les erreurs de validation front-end
      return;
    }
    
    // Clear error if validation passes
    setForgotPasswordError("");

    startTransition(async () => {
      try {
        const result = await resetPasswordAction(email);
        if (!result.errorMessage) {
          // Succès serveur - Toast
          toast({
            variant: "success",
            title: "E-mail envoyé !",
            description: t("forgotPassword.resetEmailSent"),
          });
          setIsForgotPassword(false);
        } else {
          // Erreur serveur (back-end) - Toast uniquement
          toast({ variant: "destructive", description: result.errorMessage });
        }
      } catch (error) {
        toast({ variant: "destructive", description: "Une erreur est survenue." });
      }
    });
  };

  // --- VUE MOT DE PASSE OUBLIÉ ---
  if (isForgotPassword) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setIsForgotPassword(false)}
          className="inline-flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t("forgotPassword.backToLogin")}</span>
        </button>

        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">{t("forgotPassword.title")}</h2>
          <p className="text-[var(--color-text-secondary)] text-sm">{t("forgotPassword.description")}</p>
        </div>

        <form onSubmit={handleForgotPasswordSubmit} noValidate className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="forgot-email">{t("pages.login.emailLabel")}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
              <Input
                id="forgot-email"
                name="email"
                type="email"
                placeholder={t("pages.login.emailPlaceholder")}
                required
                disabled={isPending}
                className={`pl-10 h-12 ${forgotPasswordError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                onChange={() => {
                  // Clear error when user starts typing
                  if (forgotPasswordError) {
                    setForgotPasswordError("");
                  }
                }}
              />
            </div>
            {forgotPasswordError && (
              <p className="text-sm text-red-500">{forgotPasswordError}</p>
            )}
          </div>
          <Button type="submit" disabled={isPending} className="w-full h-12 bg-[#48bb93] hover:bg-[#3da682] text-white">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : t("forgotPassword.sendResetLink")}
          </Button>
        </form>
      </div>
    );
  }

  // --- VUE CONNEXION NORMALE ---
  return (
    <form onSubmit={handleLoginSubmit} noValidate className="space-y-6">
      <div className="space-y-4">
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">{t("pages.login.emailLabel")}</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder={t("pages.login.emailPlaceholder")}
              required
              disabled={isPending}
              className={`pl-10 h-12 ${formErrors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              onChange={() => {
                // Clear error when user starts typing
                if (formErrors.email) {
                  setFormErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.email;
                    return newErrors;
                  });
                }
              }}
            />
          </div>
          {formErrors.email && (
            <p className="text-sm text-red-500">{formErrors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">{t("pages.login.passwordLabel")}</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder={t("pages.login.passwordPlaceholder")}
              required
              disabled={isPending}
              className={`pl-10 pr-10 h-12 ${formErrors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              onChange={() => {
                // Clear error when user starts typing
                if (formErrors.password) {
                  setFormErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.password;
                    return newErrors;
                  });
                }
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {formErrors.password && (
            <p className="text-sm text-red-500">{formErrors.password}</p>
          )}
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="w-full h-12 bg-[#48bb93] hover:bg-[#3da682] text-white">
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
          className="text-sm text-[#48bb93] font-medium hover:underline"
        >
          {t("pages.login.forgotPassword")}
        </button>

        <p className="text-sm text-[var(--color-text-secondary)]">
          {t("pages.login.noAccount")}{" "}
          <Link href="/sign-up" className="text-[#48bb93] font-medium hover:underline">
            {t("pages.login.signUpHere")}
          </Link>
        </p>
      </div>
    </form>
  );
}

export default LoginForm;