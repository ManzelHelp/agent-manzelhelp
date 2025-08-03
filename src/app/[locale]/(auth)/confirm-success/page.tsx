"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/userStore";
import { getProfile } from "@/supabase/client";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle } from "lucide-react";

export default function ConfirmSuccessPage() {
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);

  useEffect(() => {
    const handleConfirmation = async () => {
      try {
        // Fetch the user profile data
        const user = await getProfile();

        if (user) {
          // Store user data in Zustand
          setUser(user);

          // Show success message based on user role
          const roleMessage =
            user.role === "tasker"
              ? "Welcome! Your account is ready. Complete your profile to start helping others."
              : "Welcome! Your account is ready. Start finding help for your tasks.";

          toast.success("Email confirmed successfully!", {
            description: roleMessage,
          });

          // Redirect to appropriate dashboard based on role from user object
          const role = user.role || "customer";

          // Small delay for better UX
          setTimeout(() => {
            router.replace(`/${role}/dashboard`);
          }, 1500);
        } else {
          // Fallback: user is authenticated but profile fetch failed
          toast.success("Email confirmed successfully!");

          setTimeout(() => {
            router.replace("/customer/dashboard");
          }, 1500);
        }
      } catch (error) {
        console.error("Error during confirmation:", error);
        toast.error("Something went wrong. Please try logging in.");

        setTimeout(() => {
          router.replace("/login");
        }, 2000);
      }
    };

    handleConfirmation();
  }, [router, setUser]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center space-y-4 p-8">
          <div className="relative">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <Loader2 className="absolute -top-1 -right-1 h-4 w-4 animate-spin text-blue-500" />
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold text-green-700">
              Email Confirmed!
            </h1>
            <p className="text-gray-600">
              Your email has been successfully verified.
              <br />
              Setting up your account...
            </p>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Redirecting to your dashboard...</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
