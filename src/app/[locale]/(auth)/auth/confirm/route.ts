import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest } from "next/server";

import { createClient, getUserRole } from "@/supabase/server";
import { redirect } from "next/navigation";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  //const next = searchParams.get("next") ?? "/";

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      const role = await getUserRole();
      if (role === "helper") {
        redirect("/tasker/dashboard");
      } else {
        redirect("/customer/dashboard");
      }
    }
  }

  // redirect the user to an error page with some instructions
  redirect("/error");
}
