import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";

export async function updateSession(
  request: NextRequest,
  response?: NextResponse
) {
  let supabaseResponse =
    response ||
    NextResponse.next({
      request,
    });

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const protectedRoutes = ["/dashboard", "/settings"];
  const guestOnlyRoutes = ["/login", "/sign-up"];

  // Extract locale and pathname using next-intl routing config
  const { locale, pathname } = getLocaleInfo(request);

  if (!user && protectedRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  if (user && guestOnlyRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}

// Helper function to extract locale and clean pathname using next-intl config
function getLocaleInfo(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Find the locale in the pathname using your routing config
  const locale =
    routing.locales.find(
      (loc) => pathname.startsWith(`/${loc}/`) || pathname === `/${loc}`
    ) || routing.defaultLocale;

  // Remove locale from pathname
  const cleanPathname = pathname.startsWith(`/${locale}`)
    ? pathname.slice(`/${locale}`.length) || "/"
    : pathname;

  return { locale, pathname: cleanPathname };
}
