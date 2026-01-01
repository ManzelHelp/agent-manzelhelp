"use client";

import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { logOutAction } from "@/actions/auth";
import { useUserStore } from "@/stores/userStore";

function LogOutButton() {
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);

  const [loading, setLoading] = useState(false);

  const handleLogOut = async () => {
    setLoading(true);

    const { errorMessage } = await logOutAction();
    if (!errorMessage) {
      // Clear localStorage AFTER setting user to null
      // This ensures the storage event fires for other tabs
      if (typeof window !== "undefined") {
        const oldValue = localStorage.getItem("user-storage");
        setUser(null);
        // Small delay to ensure state update happens first
        setTimeout(() => {
          localStorage.removeItem("user-storage");
        }, 100);
      } else {
        setUser(null);
      }
      toast("Logged out successfully");
      router.push("/");
    } else {
      toast.error(errorMessage);
    }

    setLoading(false);
  };

  return (
    <Button
      variant="outline"
      onClick={handleLogOut}
      disabled={loading}
      className="w-24"
    >
      {loading ? <Loader2 className="animate-spin" /> : "Log Out"}
    </Button>
  );
}

export default LogOutButton;
