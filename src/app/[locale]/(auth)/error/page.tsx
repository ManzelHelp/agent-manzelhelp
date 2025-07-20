"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Mail } from "lucide-react";
import { Link } from "@/i18n/navigation";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams?.get("error");
  const message = searchParams?.get("message");

  const getErrorContent = () => {
    switch (error) {
      case "confirmation_expired":
        return {
          title: "Confirmation Link Expired",
          description:
            "Your email confirmation link has expired. Please request a new one.",
          icon: <Mail className="h-12 w-12 text-orange-500" />,
          actionText: "Request New Link",
          actionHref: "/sign-up",
        };
      case "confirmation_invalid":
        return {
          title: "Invalid Confirmation Link",
          description:
            "The confirmation link is invalid or has already been used.",
          icon: <AlertTriangle className="h-12 w-12 text-red-500" />,
          actionText: "Try Again",
          actionHref: "/login",
        };
      case "already_confirmed":
        return {
          title: "Email Already Confirmed",
          description:
            "Your email has already been confirmed. You can now log in.",
          icon: <Mail className="h-12 w-12 text-green-500" />,
          actionText: "Go to Login",
          actionHref: "/login",
        };
      default:
        return {
          title: "Authentication Error",
          description:
            message ||
            "An error occurred during the authentication process. Please try again.",
          icon: <AlertTriangle className="h-12 w-12 text-red-500" />,
          actionText: "Try Again",
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
              <Link href="/">Go to Home</Link>
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              Need help?{" "}
              <Link
                href="/contact"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Contact Support
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
