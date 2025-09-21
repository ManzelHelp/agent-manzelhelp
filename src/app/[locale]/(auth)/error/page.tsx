"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Mail } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams?.get("error");
  const message = searchParams?.get("message");
  const t = useTranslations("auth");

  const getErrorContent = () => {
    switch (error) {
      case "confirmation_expired":
        return {
          title: t("pages.error.confirmationExpired.title"),
          description: t("pages.error.confirmationExpired.description"),
          icon: <Mail className="h-12 w-12 text-orange-500" />,
          actionText: t("pages.error.confirmationExpired.actionText"),
          actionHref: "/sign-up",
        };
      case "confirmation_invalid":
        return {
          title: t("pages.error.confirmationInvalid.title"),
          description: t("pages.error.confirmationInvalid.description"),
          icon: <AlertTriangle className="h-12 w-12 text-red-500" />,
          actionText: t("pages.error.confirmationInvalid.actionText"),
          actionHref: "/login",
        };
      case "already_confirmed":
        return {
          title: t("pages.error.alreadyConfirmed.title"),
          description: t("pages.error.alreadyConfirmed.description"),
          icon: <Mail className="h-12 w-12 text-green-500" />,
          actionText: t("pages.error.alreadyConfirmed.actionText"),
          actionHref: "/login",
        };
      default:
        return {
          title: t("pages.error.default.title"),
          description: message || t("pages.error.default.description"),
          icon: <AlertTriangle className="h-12 w-12 text-red-500" />,
          actionText: t("pages.error.default.actionText"),
          actionHref: "/login",
        };
    }
  };

  const errorContent = getErrorContent();

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex flex-col items-center space-y-4">
            {errorContent.icon}
            <CardTitle className="text-center text-2xl text-gray-800">
              {errorContent.title}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-gray-600">
            {errorContent.description}
          </p>

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href={errorContent.actionHref}>
                {errorContent.actionText}
              </Link>
            </Button>

            <Button variant="outline" asChild className="w-full">
              <Link href="/">{t("pages.error.goToHome")}</Link>
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              {t("pages.error.needHelp")}{" "}
              <Link
                href="/contact"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                {t("pages.error.contactSupport")}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
