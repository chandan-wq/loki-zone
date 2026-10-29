import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
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
    // Skip Next.js internals, static files, and public assets
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
