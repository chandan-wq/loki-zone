import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const pathname = req.nextUrl.pathname;

  // Seamless brand routing: direct visits to /sign-in or /sign-up route to branded /login and /register
  // Subpaths (like /sign-in/sso-callback) are preserved for OAuth flows
  if (pathname === "/sign-in") {
    const loginUrl = new URL("/login", req.url);
    if (req.nextUrl.search) {
      loginUrl.search = req.nextUrl.search;
    }
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/sign-up") {
    const registerUrl = new URL("/register", req.url);
    if (req.nextUrl.search) {
      registerUrl.search = req.nextUrl.search;
    }
    return NextResponse.redirect(registerUrl);
  }

  if (isAdminRoute(req)) {
    const { userId } = await auth();
    if (!userId) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }
});

export const config = {
  matcher: [
    "/admin(.*)",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/(api|trpc)(.*)",
  ],
};
