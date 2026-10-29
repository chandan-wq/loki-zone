import { redirect } from "next/navigation";

/**
 * /admin/login → redirect to the branded login page.
 * Do NOT redirect to /sign-in (the unbranded Clerk portal).
 * The branded /login page handles Clerk sign-in via useSignIn().
 */
export default function AdminLoginPage() {
  redirect("/login?redirect_url=/admin");
}
