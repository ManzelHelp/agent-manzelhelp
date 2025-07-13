import { type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { updateSession } from "@/supabase/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const intlResponse = intlMiddleware(request);

  // If next-intl wants to redirect (e.g., for locale detection), respect that
  if (intlResponse && intlResponse.status >= 300 && intlResponse.status < 400) {
    return intlResponse;
  }

  return await updateSession(request, intlResponse);
}

export const config = {
  matcher: [
    "/((?!api|trpc|_next|_vercel|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
