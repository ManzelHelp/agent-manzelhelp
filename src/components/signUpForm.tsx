"use client";

import { useRouter } from "next/navigation";
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
      const name = formData.get("name") as string;
      const phone = formData.get("phone") as string;
      const location = formData.get("location") as string;
      const isProvider = formData.get("isProvider") === "on";

      const errorMessage = (
        await signUpAction(email, password, {
          name,
          phone,
          location,
          isProvider,
        })
      ).errorMessage;

      if (!errorMessage) {
        toast.success("sign up successful", {
          description: "Please check your email for verification",
        });
        router.replace("/"); // redirect to waiting for verification later
      } else {
        toast.error(errorMessage);
      }
    });
  };

  return (
    <form action={handleSubmit}>
      <CardContent className="grid w-full items-center gap-4">
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="Enter your full name"
            type="text"
            required
            disabled={isPending}
          />
        </div>
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
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            name="phone"
            placeholder="Enter your phone number"
            type="tel"
            disabled={isPending}
          />
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="location"
            placeholder="Enter your city/location"
            type="text"
            disabled={isPending}
          />
        </div>
        <div className="flex items-center space-x-2">
          <input
            id="isProvider"
            name="isProvider"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300"
            disabled={isPending}
          />
          <Label htmlFor="isProvider" className="text-sm">
            I want to offer services as a provider
          </Label>
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
