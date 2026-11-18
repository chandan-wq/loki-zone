import { redirect } from "next/navigation";
import { getVerifiedAdmin } from "@/lib/adminAuthServer";

export const instant = false;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminSession = await getVerifiedAdmin();

  // 1. Unauthenticated visitors -> Redirect on the server to login
  if (!adminSession.userId) {
    redirect("/login?redirect_url=/admin");
  }

  // 2. Authenticated users without admin privileges (e.g. normal customers) -> Redirect on the server to account
  if (!adminSession.authorized || !adminSession.role) {
    redirect("/account?error=unauthorized_admin");
  }

  // 3. Authorized Staff or Administrator -> Render protected admin content
  return <>{children}</>;
}
