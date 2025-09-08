"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { updatePasswordAction } from "@/actions/auth";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const password = formData.get("password") as string;
      const confirmPassword = formData.get("confirmPassword") as string;

      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      if (password.length < 6) {
        toast.error("Password must be at least 6 characters long");
        return;
      }

      const result = await updatePasswordAction(password);

      if (!result.errorMessage) {
        toast.success("Password updated successfully!");
        router.replace("/login");
      } else {
        toast.error(result.errorMessage);
      }
    });
  };

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
          href="/login"
          className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors duration-200 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="font-medium">Back to Login</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-4 sm:px-6 py-6">
        <div className="w-full max-w-md mx-auto">
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl sm:shadow-2xl">
            <CardHeader className="text-center pb-4 sm:pb-6 pt-6 sm:pt-8">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-[var(--color-secondary)] rounded-full mb-3 sm:mb-4">
                <Lock className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--color-text-primary)] mb-1 sm:mb-2">
                Reset Password
              </CardTitle>
              <p className="text-[var(--color-text-secondary)] text-sm sm:text-base">
                Enter your new password below
              </p>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
              <form action={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="space-y-3 sm:space-y-4">
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-sm font-medium text-[var(--color-text-primary)]"
                    >
                      New Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
                      <Input
                        id="password"
                        name="password"
                        placeholder="Enter new password"
                        type="password"
                        required
                        disabled={isPending}
                        minLength={6}
                        className="pl-10 h-11 sm:h-12 text-base border-[var(--color-border)] focus:border-[var(--color-secondary)] focus:ring-[var(--color-secondary)] transition-all duration-200"
                        autoComplete="new-password"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-sm font-medium text-[var(--color-text-primary)]"
                    >
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        placeholder="Confirm new password"
                        type="password"
                        required
                        disabled={isPending}
                        minLength={6}
                        className="pl-10 h-11 sm:h-12 text-base border-[var(--color-border)] focus:border-[var(--color-secondary)] focus:ring-[var(--color-secondary)] transition-all duration-200"
                        autoComplete="new-password"
                      />
                    </div>
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
                      <span>Updating password...</span>
                    </div>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 px-4 sm:px-6 py-3 sm:py-6 text-center">
        <p className="text-xs text-white/60">
          Remember your password?{" "}
          <Link
            href="/login"
            className="text-white/80 hover:text-white underline"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
