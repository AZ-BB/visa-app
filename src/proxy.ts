import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import type { Database } from "@/database.types";

const intlMiddleware = createIntlMiddleware(routing);

const LOCALES = ["en", "es", "fr", "de", "it"] as const;

/** Routes accessible by anyone (unauthenticated or clients). Admins cannot access these. */
const PUBLIC_ROUTES: (string | RegExp)[] = [
  /^\/(en|es|fr|de|it)\/?$/, // /[locale] or /[locale]/
  /^\/(en|es|fr|de|it)\/[^/]+$/, // /[locale]/[country]
  /^\/(en|es|fr|de|it)\/[^/]+\/apply$/, // /[locale]/[country]/apply
  /^\/(en|es|fr|de|it)\/[^/]+\/application$/, // /[locale]/[country]/application
  /^\/(en|es|fr|de|it)\/(terms|contact-us)$/, // /[locale]/terms, contact-us
];

/** Routes for authenticated client users only. Admins cannot access these. */
const CLIENT_ROUTES: (string | RegExp)[] = [
  /^\/(en|es|fr|de|it)\/applications/,
  /^\/(en|es|fr|de|it)\/account/,
];

/** Auth pages (login, signup, etc.) */
const AUTH_PAGES = [
  /^\/(en|es|fr|de|it)\/login$/,
  /^\/(en|es|fr|de|it)\/signup$/,
  /^\/(en|es|fr|de|it)\/forgot-password$/,
  /^\/(en|es|fr|de|it)\/reset-password$/,
];

/** Routes for admins only. Non-admins cannot access these. */
const ADMIN_ROUTES: (string | RegExp)[] = [
  /^\/admin(\/.*)?$/, // /admin and /admin/*
];

function getLocaleFromPath(pathname: string): string {
  const match = pathname.match(/^\/(en|es|fr|de|it)/);
  return match ? match[1] : "en";
}

function matchesRoute(pathname: string, routes: (string | RegExp)[]): boolean {
  return routes.some((p) =>
    typeof p === "string" ? pathname === p : p.test(pathname)
  );
}

function isAuthPage(pathname: string): boolean {
  return AUTH_PAGES.some((p) => p.test(pathname));
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Run auth/admin checks BEFORE intl middleware so we can redirect admins away from client/public routes.
  // (Intl middleware returns a response for all locale paths, so we'd never reach the admin check if we ran it after.)
  let response = NextResponse.next({ request });

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

  const locale = getLocaleFromPath(pathname);

  const redirectWithCookies = (url: URL) => {
    const res = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => res.cookies.set(c.name, c.value));
    return res;
  };

  // Admins can ONLY access admin routes — redirect from root, public, and client routes.
  if (user && isAdmin) {
    const isAdminRoute = matchesRoute(pathname, ADMIN_ROUTES);
    const isPublic = matchesRoute(pathname, PUBLIC_ROUTES);
    const isClient = matchesRoute(pathname, CLIENT_ROUTES);
    const isRoot = pathname === "/" || pathname === "";
    if (!isAdminRoute && (isRoot || isPublic || isClient || isAuthPage(pathname))) {
      return redirectWithCookies(new URL("/admin", request.url));
    }
  }

  // Login/signup/forgot-password are for unauthenticated users only (reset-password excluded: user may have recovery session)
  if (isAuthPage(pathname) && pathname !== `/${locale}/reset-password` && user) {
    return redirectWithCookies(new URL(`/${locale}`, request.url));
  }

  // Client routes: require authenticated user (non-admin)
  if (matchesRoute(pathname, CLIENT_ROUTES)) {
    if (!user) {
      return redirectWithCookies(new URL(`/${locale}/login`, request.url));
    }
  }

  // Admin routes: require auth and admin role
  if (matchesRoute(pathname, ADMIN_ROUTES)) {
    if (!user) {
      return redirectWithCookies(new URL("/en/login", request.url));
    }
    if (!isAdmin) {
      return redirectWithCookies(new URL(`/${locale}`, request.url));
    }
  }

  // Run next-intl for paths that need locale (exclude /admin, /api)
  if (!pathname.startsWith("/admin") && !pathname.startsWith("/api")) {
    const intlResponse = intlMiddleware(request);
    if (intlResponse) {
      return intlResponse;
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
