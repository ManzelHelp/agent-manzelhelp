"use client";

import { useRouter } from "@/i18n/navigation";
import { useTransition, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast"; 
import { useTranslations } from "next-intl";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader2, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { signUpAction } from "@/actions/auth";
import { useUserStore } from "@/stores/userStore";
import { signupSchema } from "@/lib/schemas/auth"; // Import du schéma unique

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
    
    // FIX : On force des strings vides pour éviter le message "received null" de Zod
    const rawData = {
      email: (formData.get("email") || "").toString(),
      password: (formData.get("password") || "").toString(),
      userRole: (formData.get("userRole") || "").toString(),
    };

    // Validation Zod (Front-end) - Messages inline sous les champs
    const validation = signupSchema.safeParse(rawData);
    
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
        const result = await signUpAction(rawData.email, rawData.password, rawData.userRole);

        if (result.success) {
          // Succès serveur - Toast
          toast({
            variant: "success",
            title: t("pages.signUp.signUpSuccessful"),
            description: t("pages.signUp.checkEmailVerification"),
          });
          router.replace("/wait-for-confirmation");
        } else {
          // Erreur serveur (back-end) - Toast uniquement
          // Exemples : "Cet email est déjà utilisé", "Erreur serveur", etc.
          const errorMessage = result.errorMessage || "Une erreur est survenue";
          
          // Messages spécifiques pour améliorer l'UX
          let title = "Erreur";
          if (errorMessage.includes("déjà utilisé") || errorMessage.includes("already")) {
            title = "Email déjà utilisé";
          }
          
          toast({ 
            variant: "destructive", 
            title: title,
            description: errorMessage 
          });
        }
      } catch (error) {
        toast({ 
          variant: "destructive", 
          title: "Erreur",
          description: t("pages.signUp.unexpectedError") 
        });
      }
    });
  };

  return (
    <form onSubmit={handleOnSubmit} noValidate className="space-y-4 sm:space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t("pages.signUp.emailLabel")}</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              id="email" 
              name="email" 
              type="email" 
              placeholder={t("pages.signUp.emailPlaceholder")} 
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

        <div className="space-y-2">
          <Label htmlFor="password">{t("pages.signUp.passwordLabel")}</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              id="password" 
              name="password" 
              type={showPassword ? "text" : "password"} 
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
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {formErrors.password && (
            <p className="text-sm text-red-500">{formErrors.password}</p>
          )}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>{t("passwordRequirements.title")}</p>
            <ul className="list-disc list-inside ml-2">
              <li>{t("passwordRequirements.minCharacters")}</li>
              <li>{t("passwordRequirements.uppercaseLetter")}</li>
              <li>{t("passwordRequirements.lowercaseLetter")}</li>
              <li>{t("passwordRequirements.number")}</li>
            </ul>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="userRole">{t("pages.signUp.userRoleLabel")}</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <select 
              id="userRole" 
              name="userRole" 
              className={`w-full h-12 pl-10 pr-3 border rounded-md bg-background text-sm ${formErrors.userRole ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              disabled={isPending} 
              required 
              defaultValue=""
              onChange={() => {
                // Clear error when user selects an option
                if (formErrors.userRole) {
                  setFormErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.userRole;
                    return newErrors;
                  });
                }
              }}
            >
              <option value="" disabled>{t("pages.signUp.selectOption")}</option>
              <option value="customer">{t("pages.signUp.findHelp")}</option>
              <option value="tasker">{t("pages.signUp.becomeHelper")}</option>
            </select>
          </div>
          {formErrors.userRole && (
            <p className="text-sm text-red-500">{formErrors.userRole}</p>
          )}
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="w-full h-12 bg-[#48bb93] hover:bg-[#3da682] text-white">
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : t("pages.signUp.createAccount")}
      </Button>
    </form>
  );
}

export default SignUpForm;