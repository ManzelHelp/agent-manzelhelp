"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter, Link } from "@/i18n/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, ArrowLeft, Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { updatePasswordAction } from "@/actions/auth";
import { createBrowserClient } from "@supabase/ssr";

function ResetPasswordContent() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Verify the reset token on mount
  useEffect(() => {
    const verifyToken = async () => {
      const code = searchParams.get("code");
      const token_hash = searchParams.get("token_hash");
      const type = searchParams.get("type");

      if (!code && !token_hash) {
        setError("Invalid or missing reset link");
        setVerifying(false);
        return;
      }

      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
        );

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else if (token_hash) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: (type as "recovery") || "recovery",
          });
          if (error) throw error;
        }

        setVerified(true);
      } catch (err: any) {
        console.error("Token verification error:", err);
        setError(err?.message || "Failed to verify reset link. It may have expired.");
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error(t("pages.resetPassword.passwordMismatch") || "Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error(t("pages.resetPassword.passwordTooShort") || "Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const result = await updatePasswordAction(password);
      
      if (result.errorMessage) {
        toast.error(result.errorMessage);
      } else {
        setSuccess(true);
        toast.success(t("pages.resetPassword.success") || "Password updated successfully");
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Loading state while verifying token
  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-primary-light)] to-[var(--color-primary-dark)] flex items-center justify-center px-4">
        <Card className="bg-white/95 dark:bg-[var(--color-surface)] backdrop-blur-sm border-0 shadow-xl w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)] mb-4" />
            <p className="text-[var(--color-text-secondary)]">
              {t("pages.resetPassword.verifying") || "Verifying your reset link..."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error || !verified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-primary-light)] to-[var(--color-primary-dark)] flex flex-col">
        <div className="relative z-10 px-4 sm:px-6 py-3 sm:py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors duration-200 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-medium">{t("pages.login.backToHome") || "Back to Home"}</span>
          </Link>
        </div>
        <main className="flex-1 flex items-center justify-center px-4 pb-8">
          <Card className="bg-white/95 dark:bg-[var(--color-surface)] backdrop-blur-sm border-0 shadow-xl w-full max-w-md">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
              <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
                {t("pages.resetPassword.invalidLink") || "Invalid Reset Link"}
              </h2>
              <p className="text-[var(--color-text-secondary)] mb-6">
                {error || t("pages.resetPassword.linkExpired") || "This password reset link is invalid or has expired."}
              </p>
              <Link href="/forgot-password">
                <Button>
                  {t("pages.resetPassword.requestNew") || "Request a New Link"}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-primary-light)] to-[var(--color-primary-dark)] flex items-center justify-center px-4">
        <Card className="bg-white/95 dark:bg-[var(--color-surface)] backdrop-blur-sm border-0 shadow-xl w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
              {t("pages.resetPassword.successTitle") || "Password Updated!"}
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-6">
              {t("pages.resetPassword.successMessage") || "Your password has been updated successfully. Redirecting to login..."}
            </p>
            <Loader2 className="h-5 w-5 animate-spin text-[var(--color-primary)]" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-primary-light)] to-[var(--color-primary-dark)] flex flex-col">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-48 h-48 sm:w-72 sm:h-72 bg-[var(--color-secondary)] rounded-full opacity-5 sm:opacity-10 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-[var(--color-accent)] rounded-full opacity-5 sm:opacity-10 -translate-x-1/2 translate-y-1/2"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 px-4 sm:px-6 py-3 sm:py-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors duration-200 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="font-medium">{t("pages.login.backToHome") || "Back to Home"}</span>
        </Link>
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col justify-center px-4 sm:px-6 py-8">
        <div className="w-full max-w-md mx-auto">
          <Card className="bg-white/95 dark:bg-[var(--color-surface)] backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="text-center pb-4 sm:pb-6 pt-6 sm:pt-8">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-[var(--color-primary)] rounded-full mb-3 sm:mb-4 mx-auto">
                <KeyRound className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)] mb-1 sm:mb-2">
                {t("pages.resetPassword.title") || "Reset Your Password"}
              </CardTitle>
              <p className="text-[var(--color-text-secondary)] text-sm sm:text-base">
                {t("pages.resetPassword.subtitle") || "Enter your new password below"}
              </p>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">
                    {t("pages.resetPassword.newPassword") || "New Password"}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={8}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    {t("pages.resetPassword.confirmPassword") || "Confirm Password"}
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={8}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("pages.resetPassword.updating") || "Updating..."}
                    </>
                  ) : (
                    t("pages.resetPassword.updatePassword") || "Update Password"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <div className="relative z-10 px-4 sm:px-6 py-3 sm:py-6 text-center">
        <p className="text-xs text-white/60">
          {t("pages.login.termsAndPrivacy") || "By continuing, you agree to our Terms and Privacy Policy"}
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-primary-light)] to-[var(--color-primary-dark)] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
