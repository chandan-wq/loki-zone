import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware(
  async (_auth, req) => {
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
