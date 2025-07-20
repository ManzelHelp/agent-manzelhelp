"use client";

import { useRouter } from "@/i18n/navigation";
import { useTransition } from "react";
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
  const user = useUserStore((state) => state.user);

  const [isPending, startTransition] = useTransition();

  // Redirect if user already exists
  if (user) {
    router.replace(`/${user.role}/dashboard`);
    return null; // Don't render the form
  }

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      const userRole = formData.get("userRole") as string;

      const errorMessage = (await signUpAction(email, password, userRole))
        .errorMessage;

      if (!errorMessage) {
        toast.success("sign up successful", {
          description: "Please check your email for verification",
        });
        router.replace("/wait-for-confirmation");
      } else {
        toast.error(errorMessage);
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
          />
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            placeholder="Enter your password"
            type="password"
            required
            disabled={isPending}
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
        <Button className="w-full">
          {isPending ? <Loader2 className="animate-spin" /> : "signUp"}
        </Button>
        <p className="text-xs">
          already have an account?
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
