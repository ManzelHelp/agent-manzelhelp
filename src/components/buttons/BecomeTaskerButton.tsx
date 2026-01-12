"use client";

import { useUserStore } from "@/stores/userStore";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";

interface BecomeTaskerButtonProps {
  variant?: "gradient" | "white";
  text?: string;
  className?: string;
  showWrapper?: boolean;
}

export default function BecomeTaskerButton({
  variant = "gradient",
  text,
  className = "",
  showWrapper = false,
}: BecomeTaskerButtonProps) {
  const router = useRouter();
  const { user } = useUserStore();
  const t = useTranslations("common");

  const handleGetStarted = () => {
    if (!user) {
      // No user - redirect to login
      router.push("/login");
    } else if (user.role === "tasker") {
      // User is already a tasker - go to dashboard
      router.push("/tasker/dashboard");
    } else {
      // User is customer - redirect to become-a-tasker page
      router.push("/become-a-tasker");
    }
  };

  const buttonText =
    text || (variant === "gradient" ? t("getStartedToday") : t("getStartedNow"));

  const buttonClasses =
    variant === "gradient"
      ? "bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover-lift btn-modern"
      : "bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover-lift";

  const button = (
    <Button
      onClick={handleGetStarted}
      size="lg"
      className={`${buttonClasses} ${className}`}
    >
      {buttonText}
      <ArrowRight className="ml-2 h-5 w-5" />
    </Button>
  );

  if (showWrapper) {
    return (
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in-up animate-delay-300">
        {button}
      </div>
    );
  }

  return button;
}
