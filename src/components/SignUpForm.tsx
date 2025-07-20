"use client";

import { useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { useTransition, useEffect } from "react";
import { toast } from "sonner";
import { CardContent, CardFooter } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { signUpAction } from "@/actions/users";
import { useUserStore } from "@/stores/userStore";

function SignUpForm() {
  const router = useRouter();
  const params = useParams();
  const user = useUserStore((state) => state.user);

  const [isPending, startTransition] = useTransition();

  // Get the current locale from URL params
  const locale = (params.locale as string) || "en";

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
        const result = await signUpAction(email, password, userRole, locale);

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
    <form action={handleSubmit}>
      <CardContent className="grid w-full items-center gap-4">
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            placeholder="Enter your email"
            type="email"
            required
            disabled={isPending}
            autoComplete="email"
          />
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            placeholder="Enter your password (min. 6 characters)"
            type="password"
            required
            disabled={isPending}
            minLength={6}
            autoComplete="new-password"
          />
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="userRole">I want to:</Label>
          <select
            id="userRole"
            name="userRole"
            className="h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
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
      </CardContent>
      <CardFooter className="mt-4 flex flex-col gap-6">
        <Button className="w-full" disabled={isPending}>
          {isPending ? <Loader2 className="animate-spin" /> : "Sign Up"}
        </Button>
        <p className="text-xs">
          Already have an account?{" "}
          <Link
            href="/login"
            className={`text-blue-500 underline ${
              isPending ? "pointer-events-none opacity-50" : ""
            }`}
          >
            Login
          </Link>
        </p>
      </CardFooter>
    </form>
  );
}

export default SignUpForm;
