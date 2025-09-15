"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/userStore";

interface TaskerLayoutProps {
  children: React.ReactNode;
}

export default function TaskerLayout({ children }: TaskerLayoutProps) {
  const router = useRouter();
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    // Only redirect if user is loaded and has a role
    if (user?.role) {
      // If user is a customer, redirect to customer dashboard
      if (user.role === "customer") {
        router.replace("/customer/dashboard");
        return;
      }
    }
  }, [user, router]);

  return <>{children}</>;
}
