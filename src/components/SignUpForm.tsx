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

function SignUpForm() {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      const isProvider = formData.get("isProvider") === "helper";

      const errorMessage = (await signUpAction(email, password, isProvider))
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
          <Label>I want to:</Label>
          <div className="flex gap-6">
            <div className="flex items-center space-x-2">
              <input
                id="find-help"
                name="isProvider"
                type="radio"
                value="seeker"
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                disabled={isPending}
                required
              />
              <Label htmlFor="find-help" className="text-sm font-medium">
                Find Help
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                id="helper"
                name="isProvider"
                type="radio"
                value="helper"
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                disabled={isPending}
              />
              <Label htmlFor="helper" className="text-sm font-medium">
                Become a Helper
              </Label>
            </div>
          </div>
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
