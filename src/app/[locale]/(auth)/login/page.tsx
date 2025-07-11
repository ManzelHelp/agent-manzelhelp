import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function LoginPage() {
  return (
    <div className="mt-20 flex flex-1 flex-col items-center">
      <Card className="w-full max-w-md">
        <CardHeader className="mb-4">
          <CardTitle className="text-center text-3xl">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Email"
                className="w-full rounded border px-3 py-2 text-sm bg-transparent"
                autoComplete="username"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="********"
                className="w-full rounded border px-3 py-2 text-sm bg-transparent"
                autoComplete="current-password"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[var(--color-primary)] text-white rounded py-2 font-semibold"
              disabled
            >
              Login
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
export default LoginPage;
