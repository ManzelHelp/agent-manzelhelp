import LoginForm from "@/components/LoginForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ hasSignedUp?: string; emailConfirmed?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const emailConfirmed = resolvedSearchParams.emailConfirmed === "true";

  return (
    <div className="mt-20 flex flex-1 flex-col items-center">
      <Card className="w-full max-w-md">
        <CardHeader className="mb-4">
          <CardTitle className="text-center text-3xl">Sign Up</CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm showToast={emailConfirmed} />
        </CardContent>
      </Card>
    </div>
  );
}
