"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/userStore";

interface CustomerLayoutProps {
  children: React.ReactNode;
}

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  const router = useRouter();
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    // Only redirect if user is loaded and has a role
    if (user?.role) {
      // If user is a tasker, redirect to tasker dashboard
      if (user.role === "tasker") {
        router.replace("/tasker/dashboard");
        return;
      }
    }
  }, [user, router]);

  return <>{children}</>;
}
