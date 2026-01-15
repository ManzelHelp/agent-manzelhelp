"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserStore } from "@/stores/userStore";
import { getUserProfileAction } from "@/actions/auth";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

function ConfirmSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useUserStore((state) => state.setUser);
  const t = useTranslations("auth");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleConfirmation = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get user role from URL params (passed from signup)
        const userRole = searchParams.get("userRole") || "customer";

        // Fetch the user profile data using server action
        const profileResult = await getUserProfileAction();

        if (profileResult.success && profileResult.user) {
          const user = profileResult.user;

          // Store user data in Zustand
          setUser(user);

          // Show success message based on user role
          const roleMessage =
            user.role === "tasker"
              ? t("pages.confirmSuccess.taskerWelcome")
              : t("pages.confirmSuccess.customerWelcome");

          toast.success(t("pages.confirmSuccess.emailConfirmed"), {
            description: roleMessage,
          });

          // Redirect based on role (fresh signup, so taskers haven't completed profile yet)
          const role = user.role || userRole;

          // Small delay for better UX
          setTimeout(() => {
            if (role === "tasker") {
              // Tasker just signed up, send to finish-signUp
              router.replace("/finish-signUp");
            } else {
              // Customer goes to how-it-works page
              router.replace("/how-does-It-work");
            }
          }, 1500);
        } else {
          // Handle profile fetch failure
          const errorMessage =
            profileResult.errorMessage ||
            t("pages.confirmSuccess.failedToFetchProfile");
          setError(errorMessage);
          toast.error(t("pages.confirmSuccess.accountSetupIncomplete"), {
            description: t("pages.confirmSuccess.tryLoggingIn"),
          });

          setTimeout(() => {
            router.replace("/login");
          }, 2000);
        }
      } catch (error) {
        console.error("Error during confirmation:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : t("pages.confirmSuccess.unexpectedError");
        setError(errorMessage);
        toast.error(t("pages.confirmSuccess.somethingWentWrong"), {
          description: t("pages.confirmSuccess.tryLoggingInToAccess"),
        });

        setTimeout(() => {
          router.replace("/login");
        }, 2000);
      } finally {
        setIsLoading(false);
      }
    };

    handleConfirmation();
  }, [router, setUser, searchParams, t]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center space-y-4 p-8">
          {error ? (
            <>
              <div className="relative">
                <AlertCircle className="h-12 w-12 text-red-500" />
              </div>
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-semibold text-red-700">
                  {t("pages.confirmSuccess.setupIncomplete")}
                </h1>
                <p className="text-gray-600">
                  {t("pages.confirmSuccess.setupIssue")}
                  <br />
                  {t("pages.confirmSuccess.redirectingToLogin")}
                </p>
                {error && (
                  <p className="text-sm text-red-500 mt-2">
                    {t("pages.confirmSuccess.error")}: {error}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t("pages.confirmSuccess.redirectingToLogin")}</span>
              </div>
            </>
          ) : (
            <>
              <div className="relative">
                <CheckCircle className="h-12 w-12 text-green-500" />
                {isLoading && (
                  <Loader2 className="absolute -top-1 -right-1 h-4 w-4 animate-spin text-blue-500" />
                )}
              </div>

              <div className="text-center space-y-2">
                <h1 className="text-2xl font-semibold text-green-700">
                  {t("pages.confirmSuccess.emailConfirmedTitle")}
                </h1>
                <p className="text-gray-600">
                  {t("pages.confirmSuccess.emailVerified")}
                  <br />
                  {isLoading
                    ? t("pages.confirmSuccess.settingUpAccount")
                    : t("pages.confirmSuccess.accountSetupComplete")}
                </p>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>
                  {isLoading
                    ? t("pages.confirmSuccess.settingUpAccount")
                    : t("pages.confirmSuccess.redirectingToDashboard")}
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ConfirmSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center space-y-4 p-8">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
              <p className="text-gray-600">Loading...</p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <ConfirmSuccessContent />
    </Suspense>
  );
}
