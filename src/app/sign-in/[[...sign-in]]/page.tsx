import { redirect } from "next/navigation";

export default function SignInCatchAll() {
  redirect("/login");
}
