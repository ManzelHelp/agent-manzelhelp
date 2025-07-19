import { getUser } from "@/supabase/server";
import LoginForm from "@/components/LoginForm";

export default async function LoginPage() {
  const user = await getUser();

  // Optionally, redirect if already logged in
  // if (user) redirect("/dashboard");

  return <LoginForm user={user} />;
}
