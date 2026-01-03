"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useUserStore } from "@/stores/userStore";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    // Only redirect if user is loaded and has a role
    if (user?.role) {
      // If user is not admin, redirect to their dashboard
      if (user.role !== "admin") {
        const redirectPath = user.role === "tasker" ? "/tasker/dashboard" : "/customer/dashboard";
        router.replace(redirectPath);
        return;
      }
    }
  }, [user, router]);

  return <>{children}</>;
}

