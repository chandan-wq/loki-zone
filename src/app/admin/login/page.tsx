import { redirect } from "next/navigation";
import { getVerifiedAdmin } from "@/lib/adminAuthServer";

/**
 * /admin/login entry point.
 * If already an authorized administrator, redirect directly to /admin.
 * Otherwise redirect to the branded login page.
 */
export default async function AdminLoginPage() {
  const adminSession = await getVerifiedAdmin();
  if (adminSession.authorized) {
    redirect("/admin");
  }
  redirect("/login?redirect_url=/admin");
}
