import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isCheckoutRoute = createRouteMatcher(["/checkout(.*)"]);

export default clerkMiddleware(
  async (auth, req) => {
    const pathname = req.nextUrl.pathname;

    // Strict Brand Isolation: Always route users to our internal branded /login and /register
    // Never expose Clerk's unbranded generic sign-in or sign-up portals
    if (pathname.startsWith("/sign-in")) {
      const loginUrl = new URL("/login", req.url);
      if (req.nextUrl.search) loginUrl.search = req.nextUrl.search;
      return NextResponse.redirect(loginUrl);
    }

    if (pathname.startsWith("/sign-up")) {
      const registerUrl = new URL("/register", req.url);
      if (req.nextUrl.search) registerUrl.search = req.nextUrl.search;
      return NextResponse.redirect(registerUrl);
    }

    // Server-Side Guard for /checkout: Mandatory Customer Login
    if (isCheckoutRoute(req)) {
      const session = await auth();
      if (!session.userId) {
        const loginUrl = new URL("/login", req.url);
        const destination = req.nextUrl.search ? `${pathname}${req.nextUrl.search}` : pathname;
        loginUrl.searchParams.set("redirect_url", destination);
        return NextResponse.redirect(loginUrl);
      }
    }

    // Server-Side Guard for /admin: Redirect unauthenticated requests to login immediately
    if (isAdminRoute(req)) {
      const session = await auth();
      if (!session.userId) {
        const loginUrl = new URL("/login", req.url);
        const destination = pathname.startsWith("/admin/login") ? "/admin" : pathname;
        loginUrl.searchParams.set("redirect_url", destination);
        return NextResponse.redirect(loginUrl);
      }
    }
  },
  {
    signInUrl: "/login",
    signUpUrl: "/register",
  }
);

export const config = {
  matcher: [
    // Skip Next.js internals, static files, and public assets
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
