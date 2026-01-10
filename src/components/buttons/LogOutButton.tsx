"use client";

import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { logOutAction } from "@/actions/auth";
import { useUserStore } from "@/stores/userStore";
import { useTranslations } from "next-intl";

function LogOutButton() {
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);
  const t = useTranslations("auth");

  const [loading, setLoading] = useState(false);

  const handleLogOut = async () => {
    setLoading(true);

    // Clear store and localStorage IMMEDIATELY before logout action
    // This ensures UI updates immediately
    if (typeof window !== "undefined") {
      setUser(null);
      localStorage.removeItem("user-storage");
    } else {
      setUser(null);
    }

    const { errorMessage } = await logOutAction();
    if (!errorMessage) {
      toast(t("logoutSuccess"));
      // Force a full page reload to ensure all cookies are cleared and state is reset
      // Using window.location.href ensures complete page reload and cookie cleanup
      if (typeof window !== "undefined") {
        window.location.href = "/";
      } else {
        router.replace("/");
      }
    } else {
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleLogOut}
      disabled={loading}
      className="w-24"
    >
      {loading ? <Loader2 className="animate-spin" /> : t("logout")}
    </Button>
  );
}

export default LogOutButton;
