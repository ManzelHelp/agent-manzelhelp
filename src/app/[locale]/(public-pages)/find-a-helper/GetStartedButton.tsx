"use client";

import { useRouter } from "@/i18n/navigation";
import { useUserStore } from "@/stores/userStore";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface GetStartedButtonProps {
  locale: string;
}

export default function GetStartedButton({ locale }: GetStartedButtonProps) {
  const router = useRouter();
  const { user } = useUserStore();
  const t = useTranslations("findAHelper");

  const handleGetStarted = () => {
    if (!user) {
      // No user - redirect to login
      router.push("/login");
    } else {
      // User is logged in - redirect to search services
      router.push("/search/services");
    }
  };

  return (
    <Button
      onClick={handleGetStarted}
      size="lg"
      className="rounded-full px-8 py-4 text-lg"
    >
      {t("cta.getStarted")}
    </Button>
  );
}
