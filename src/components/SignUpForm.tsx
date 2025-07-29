"use client";

import { useRouter } from "@/i18n/navigation";
import { useTransition, useEffect } from "react";
import { toast } from "sonner";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader2, Mail, Lock, User } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { signUpAction } from "@/actions/users";
import { useUserStore } from "@/stores/userStore";

function SignUpForm() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);

  const [isPending, startTransition] = useTransition();

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
      const userRole = formData.get("userRole") as string;

      // Validate inputs
      if (!email || !password || !userRole) {
        toast.error("Please fill in all fields");
        return;
      }

      if (password.length < 6) {
        toast.error("Password must be at least 6 characters long");
        return;
      }

      try {
        const result = await signUpAction(email, password, userRole);

        if (!result.errorMessage) {
          toast.success("Sign up successful", {
            description: "Please check your email for verification",
          });
          router.replace("/wait-for-confirmation");
        } else {
          toast.error(result.errorMessage);
        }
      } catch (error) {
        console.error("Signup error:", error);
        toast.error("An unexpected error occurred. Please try again.");
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-4 sm:space-y-6">
      <div className="space-y-3 sm:space-y-4">
        <div className="space-y-1.5 sm:space-y-2">
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
              className="pl-10 h-11 sm:h-12 text-base border-[var(--color-border)] focus:border-[var(--color-secondary)] focus:ring-[var(--color-secondary)] transition-all duration-200"
              autoComplete="email"
            />
          </div>
        </div>

        <div className="space-y-1.5 sm:space-y-2">
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
              placeholder="Enter your password (min. 6 characters)"
              type="password"
              required
              disabled={isPending}
              minLength={6}
              className="pl-10 h-11 sm:h-12 text-base border-[var(--color-border)] focus:border-[var(--color-secondary)] focus:ring-[var(--color-secondary)] transition-all duration-200"
              autoComplete="new-password"
            />
          </div>
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <Label
            htmlFor="userRole"
            className="text-sm font-medium text-[var(--color-text-primary)]"
          >
            I want to:
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
            <select
              id="userRole"
              name="userRole"
              className="w-full h-11 sm:h-12 pl-10 pr-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-[var(--color-secondary)] disabled:opacity-50 text-base transition-all duration-200 bg-white"
              disabled={isPending}
              required
              defaultValue=""
            >
              <option value="" disabled>
                Select an option
              </option>
              <option value="customer">Find Help</option>
              <option value="tasker">Become a Helper</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-11 sm:h-12 bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white font-medium text-base shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {isPending ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Creating account...</span>
            </div>
          ) : (
            "Create Account"
          )}
        </Button>

        <div className="text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Already have an account?{" "}
            <Link
              href="/login"
              className={`text-[var(--color-secondary)] hover:text-[var(--color-secondary-dark)] font-medium transition-colors duration-200 ${
                isPending ? "pointer-events-none opacity-50" : ""
              }`}
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </form>
  );
}

export default SignUpForm;
