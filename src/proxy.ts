import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/database.types";

/** Routes accessible by anyone (unauthenticated or clients). Admins cannot access these. */
const PUBLIC_ROUTES: (string | RegExp)[] = [
  "/",
  /^\/[^/]+$/, // /[country] e.g. /us, /uk
  /^\/[^/]+\/apply$/, // /[country]/apply
  /^\/[^/]+\/application$/, // /[country]/application
];

/** Routes for authenticated client users only. Admins cannot access these. */
const CLIENT_ROUTES: (string | RegExp)[] = [
  "/applications",
  "/account",
];

/** Routes for admins only. Non-admins cannot access these. */
const ADMIN_ROUTES: (string | RegExp)[] = [
  /^\/admin(\/.*)?$/, // /admin and /admin/*
];

function matchesRoute(pathname: string, routes: (string | RegExp)[]): boolean {
  return routes.some((p) =>
    typeof p === "string" ? pathname === p : p.test(pathname)
  );
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: isAdminData } = await supabase.from("admin").select("id").eq("id", user?.id!).single();
    if (isAdminData) {
      isAdmin = true;
    }
  }

  const pathname = request.nextUrl.pathname;

  // Helper: redirect while preserving Supabase session cookies (avoids "too many redirects")
  const redirectWithCookies = (url: URL) => {
    const res = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => res.cookies.set(c.name, c.value));
    return res;
  };

  // Admins can ONLY access admin routes — redirect from public and client routes.
  // Must check isAdminRoute first: the PUBLIC_ROUTES regex /^\/[^/]+$/ also matches
  // /admin, so without this guard an admin on /admin would loop-redirect to /admin.
  if (user && isAdmin) {
    const isAdminRoute = matchesRoute(pathname, ADMIN_ROUTES);
    const isPublic = matchesRoute(pathname, PUBLIC_ROUTES);
    const isClient = matchesRoute(pathname, CLIENT_ROUTES);
    const isAuthPage = pathname === "/login" || pathname === "/signup" || pathname === "/forgot-password" || pathname === "/reset-password";
    if (!isAdminRoute && (isPublic || isClient || isAuthPage)) {
      return redirectWithCookies(new URL("/admin", request.url));
    }
  }

  // Login/signup/forgot-password are for unauthenticated users only (reset-password excluded: user may have recovery session)
  if ((pathname === "/login" || pathname === "/signup" || pathname === "/forgot-password") && user) {
    return redirectWithCookies(new URL("/", request.url));
  }

  // Client routes: require authenticated user (non-admin)
  if (matchesRoute(pathname, CLIENT_ROUTES)) {
    if (!user) {
      return redirectWithCookies(new URL("/login", request.url));
    }
  }

  // Admin routes: require auth and admin role
  if (matchesRoute(pathname, ADMIN_ROUTES)) {
    if (!user) {
      return redirectWithCookies(new URL("/login", request.url));
    }
    if (!isAdmin) {
      return redirectWithCookies(new URL("/", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, images, etc.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
