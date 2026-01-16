"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ArrowRight } from "lucide-react";

function WaitForConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations("auth");
  
  const email = searchParams.get("email") || "";
  const userRole = searchParams.get("userRole") || "";
  
  const handleGoToVerify = () => {
    const params = new URLSearchParams();
    if (email) params.set("email", email);
    if (userRole) params.set("userRole", userRole);
    router.push(`/verify-otp?${params.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {t("pages.waitForConfirmation.title")}
          </CardTitle>
          <p className="text-muted-foreground">
            {t("pages.waitForConfirmation.subtitle")}
          </p>
          {email && (
            <p className="text-sm text-muted-foreground mt-2">
              {t("pages.waitForConfirmation.emailSentTo")} <span className="font-semibold">{email}</span>
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              {t("pages.waitForConfirmation.otpInstructions")}
            </p>
          </div>
          
          <Button
            onClick={handleGoToVerify}
            className="w-full"
            size="lg"
          >
            {t("pages.waitForConfirmation.enterCode")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          
          <p className="text-xs text-center text-muted-foreground">
            {t("pages.waitForConfirmation.didntReceive")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function WaitForConfirmation() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse">Loading...</div>
        </div>
      }
    >
      <WaitForConfirmationContent />
    </Suspense>
  );
}
