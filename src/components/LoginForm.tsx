"use client";

import { useRouter } from "@/i18n/navigation";
import { useEffect, useTransition } from "react";
import { toast } from "sonner";

import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader2, Mail, Lock } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { loginAction } from "@/actions/users";
import { getProfile } from "@/supabase/client";
import { useUserStore } from "@/stores/userStore";

function LoginForm({ showToast }: { showToast?: boolean }) {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (showToast) {
      toast.success("Account created! You can now log in.");
    }
  }, [showToast]);

  // Redirect if user already exists
  useEffect(() => {
    if (user) {
      router.replace(`/${user.role}/dashboard`);
    }
  }, [user, router]);

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      const errorMessage = (await loginAction(email, password)).errorMessage;

      if (!errorMessage) {
        const user = await getProfile();

        if (user) {
          setUser(user);
        }

        toast.success("Login successful");
        router.replace(`/${user?.role}/dashboard`);
      } else {
        toast.error(errorMessage);
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-sm font-medium text-[var(--color-text-primary)]"
          >
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
            <Input
              id="email"
              name="email"
              placeholder="Enter your email"
              type="email"
              required
              disabled={isPending}
              className="pl-10 h-12 text-base border-[var(--color-border)] focus:border-[var(--color-secondary)] focus:ring-[var(--color-secondary)] transition-all duration-200"
              autoComplete="email"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-sm font-medium text-[var(--color-text-primary)]"
          >
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
            <Input
              id="password"
              name="password"
              placeholder="Enter your password"
              type="password"
              required
              disabled={isPending}
              className="pl-10 h-12 text-base border-[var(--color-border)] focus:border-[var(--color-secondary)] focus:ring-[var(--color-secondary)] transition-all duration-200"
              autoComplete="current-password"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-12 bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white font-medium text-base shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {isPending ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Signing in...</span>
            </div>
          ) : (
            "Sign In"
          )}
        </Button>

        <div className="text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Don't have an account?{" "}
            <Link
              href="/sign-up"
              className={`text-[var(--color-secondary)] hover:text-[var(--color-secondary-dark)] font-medium transition-colors duration-200 ${
                isPending ? "pointer-events-none opacity-50" : ""
              }`}
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </form>
  );
}

export default LoginForm;
