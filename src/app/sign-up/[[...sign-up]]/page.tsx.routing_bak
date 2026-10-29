import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center py-12 px-4 bg-gray-50/50">
      <Suspense fallback={<div className="h-96 w-80 animate-pulse rounded-2xl bg-gray-200" />}>
        <SignUp />
      </Suspense>
    </div>
  );
}
