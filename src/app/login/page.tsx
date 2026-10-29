"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, KeyRound, CheckCircle2, RefreshCw } from "lucide-react";
import { useSignIn } from "@clerk/nextjs/legacy";
import { useUser, useClerk } from "@clerk/nextjs";
import { useAdminStore } from "@/store/useAdminStore";
import { resolveAdminRole } from "@/lib/adminAuth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoaded, signIn, setActive } = useSignIn();
  const { user, isSignedIn, isLoaded: isUserLoaded } = useUser();
  const { signOut } = useClerk();
  const { loginAdmin } = useAdminStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  // 2-Factor Authentication (OTP code) state
  const [is2FA, setIs2FA] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [loading2FA, setLoading2FA] = useState(false);
  const [resendingCode, setResendingCode] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");

  // Check if switching accounts was requested via query param
  useEffect(() => {
    if (searchParams.get("switch") === "true" && isSignedIn) {
      signOut();
    }
  }, [searchParams, isSignedIn, signOut]);

  // If already signed in, show clean switch/continue prompt instead of trapping the user
  if (isUserLoaded && isSignedIn && user && searchParams.get("switch") !== "true") {
    const currentEmail = user.primaryEmailAddress?.emailAddress || "";
    const adminRole = resolveAdminRole(currentEmail, user.publicMetadata?.role);

    return (
      <div className="min-h-screen bg-gray-50/70 flex items-center justify-center py-12 px-4 sm:px-6">
        <div className="max-w-md w-full bg-white rounded-3xl border border-gray-150 shadow-xl p-8 sm:p-10 space-y-6 text-center">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center border border-emerald-200 shadow-sm">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-gray-950 tracking-tight">
              Already Signed In
            </h2>
            <p className="text-xs text-gray-500 mt-1.5">
              You are currently authenticated as:
            </p>
            <div className="mt-2 py-1.5 px-3 bg-gray-50 border border-gray-200 rounded-xl inline-block max-w-full">
              <span className="text-xs font-bold text-gray-900 truncate block">
                {currentEmail}
              </span>
            </div>
            {adminRole && (
              <span className="block mt-1 text-[10px] font-extrabold text-red-600 uppercase tracking-wider">
                👑 {adminRole === "main" ? "Store Owner / Main Admin" : "Staff Desk"}
              </span>
            )}
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              onClick={() => {
                const redirectUrl = searchParams.get("redirect_url");
                if (redirectUrl && redirectUrl.includes("/admin") && adminRole) {
                  router.push(redirectUrl);
                } else if (adminRole) {
                  router.push("/admin");
                } else {
                  router.push(redirectUrl || "/account");
                }
              }}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-600/25 transition active:scale-[0.99]"
            >
              <span>Continue to {adminRole ? "Admin Workspace" : "My Account"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={async () => {
                setLoading(true);
                try {
                  await signOut();
                  router.refresh();
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="w-full py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-2xl font-bold text-xs uppercase tracking-wider transition active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? "Signing out..." : "Sign Out & Switch Account"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show spinner while checking session
  if (!isUserLoaded) {
    return (
      <div className="min-h-screen bg-gray-50/70 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleGoogleAuth = async () => {
    if (!isLoaded || !signIn) return;
    setError("");
    setLoadingGoogle(true);
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/",
      });
    } catch (err: unknown) {
      const clerkError =
        (err as { errors?: Array<{ longMessage?: string; message?: string }> })
          ?.errors?.[0]?.longMessage ||
        (err as { errors?: Array<{ longMessage?: string; message?: string }> })
          ?.errors?.[0]?.message ||
        "Could not initiate Google sign in. Please try again.";
      setError(clerkError);
      setLoadingGoogle(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");

    if (!isLoaded || !signIn) return;
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    try {
      const result = await signIn.create({
        identifier: cleanEmail,
        password: password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });

        const redirectUrl = searchParams.get("redirect_url");
        const resolvedRole = resolveAdminRole(cleanEmail);
        if (resolvedRole) {
          loginAdmin(cleanEmail, resolvedRole);
          router.push(redirectUrl && redirectUrl.includes("/admin") ? redirectUrl : "/admin");
        } else {
          router.push(redirectUrl || "/account");
        }
      } else if (result.status === "needs_second_factor") {
        // Clerk 2-Factor Authentication requested (Email OTP code)
        try {
          await signIn.prepareSecondFactor({
            strategy: "email_code",
          });
          setIs2FA(true);
          setInfoMessage(`We sent a 6-digit security code to ${cleanEmail}. Please check your inbox.`);
        } catch {
          // Fallback if email code prep doesn't work, direct to full sign in
          setError("Additional verification required. Redirecting to full portal...");
          router.push("/sign-in");
        }
      } else if (result.status === "needs_first_factor") {
        const emailFactor = signIn.supportedFirstFactors?.find(
          (f) => f.strategy === "email_code"
        ) as { strategy: "email_code"; emailAddressId: string } | undefined;

        if (emailFactor?.emailAddressId) {
          await signIn.prepareFirstFactor({
            strategy: "email_code",
            emailAddressId: emailFactor.emailAddressId,
          });
          setIs2FA(true);
          setInfoMessage(`We sent a 6-digit security code to ${cleanEmail}.`);
        } else {
          router.push("/sign-in");
        }
      } else {
        router.push("/sign-in");
      }
    } catch (err: unknown) {
      const clerkError =
        (err as { errors?: Array<{ longMessage?: string; message?: string }> })
          ?.errors?.[0]?.longMessage ||
        (err as { errors?: Array<{ longMessage?: string; message?: string }> })
          ?.errors?.[0]?.message ||
        "Invalid email or password. Please check your credentials and try again.";
      setError(clerkError);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn) return;
    setError("");
    setInfoMessage("");

    if (!verificationCode.trim()) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setLoading2FA(true);
    try {
      let result;
      if (signIn.status === "needs_second_factor") {
        result = await signIn.attemptSecondFactor({
          strategy: "email_code",
          code: verificationCode.trim(),
        });
      } else {
        result = await signIn.attemptFirstFactor({
          strategy: "email_code",
          code: verificationCode.trim(),
        });
      }

      if (result && result.status === "complete") {
        await setActive({ session: result.createdSessionId });

        const cleanEmail = email.trim().toLowerCase();
        const redirectUrl = searchParams.get("redirect_url");
        const resolvedRole = resolveAdminRole(cleanEmail);
        if (resolvedRole) {
          loginAdmin(cleanEmail, resolvedRole);
          router.push(redirectUrl && redirectUrl.includes("/admin") ? redirectUrl : "/admin");
        } else {
          router.push(redirectUrl || "/account");
        }
      } else {
        setError("Verification code could not be verified. Please try again.");
      }
    } catch (err: unknown) {
      const clerkError =
        (err as { errors?: Array<{ longMessage?: string; message?: string }> })
          ?.errors?.[0]?.longMessage ||
        (err as { errors?: Array<{ longMessage?: string; message?: string }> })
          ?.errors?.[0]?.message ||
        "Invalid or expired verification code. Please check and try again.";
      setError(clerkError);
    } finally {
      setLoading2FA(false);
    }
  };

  const handleResendCode = async () => {
    if (!isLoaded || !signIn) return;
    setError("");
    setResendingCode(true);
    try {
      if (signIn.status === "needs_second_factor") {
        await signIn.prepareSecondFactor({
          strategy: "email_code",
        });
      } else {
        const emailFactor = signIn.supportedFirstFactors?.find(
          (f) => f.strategy === "email_code"
        ) as { strategy: "email_code"; emailAddressId: string } | undefined;

        if (emailFactor?.emailAddressId) {
          await signIn.prepareFirstFactor({
            strategy: "email_code",
            emailAddressId: emailFactor.emailAddressId,
          });
        }
      }
      setInfoMessage("A new verification code has been sent to your email.");
    } catch {
      setError("Could not resend code. Please try again in a few moments.");
    } finally {
      setResendingCode(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/70 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl border border-gray-150 shadow-xl p-8 sm:p-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <Link href="/" className="inline-block mb-3 group">
            <div className="w-12 h-12 bg-black rounded-2xl p-2 mx-auto flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Image
                src="/images/loki-logo.png"
                alt="LOKI"
                width={36}
                height={36}
                className="object-contain"
              />
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
            {is2FA ? "Two-Factor Verification" : "Sign In to LOKI Zone"}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {is2FA
              ? "Enter the 6-digit code sent to your email to complete authentication."
              : "Sign in to access your orders, track shipments, and manage your account."}
          </p>
        </div>

        {/* Notices */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-600 animate-in fade-in">
            {error}
          </div>
        )}
        {infoMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 animate-in fade-in">
            {infoMessage}
          </div>
        )}

        {is2FA ? (
          /* 2FA OTP Code Verification Screen */
          <form onSubmit={handleVerify2FA} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                6-Digit Security Code
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="123456"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-center text-lg font-mono font-bold tracking-widest focus:bg-white focus:border-red-600 focus:ring-2 focus:ring-red-600/10 outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading2FA || verificationCode.length < 6}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-600/25 transition active:scale-[0.99] disabled:opacity-50"
            >
              {loading2FA ? (
                <span>Verifying...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify &amp; Sign In</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-between pt-2 text-xs">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendingCode}
                className="text-gray-600 hover:text-gray-900 font-semibold flex items-center gap-1 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resendingCode ? "animate-spin" : ""}`} />
                <span>Resend Code</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIs2FA(false);
                  setVerificationCode("");
                  setError("");
                }}
                className="text-red-600 hover:underline font-bold"
              >
                Back to Password
              </button>
            </div>
          </form>
        ) : (
          /* Standard Login Form */
          <>
            {/* Google One-Click Direct OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={loadingGoogle || !isLoaded}
              className="w-full py-3 px-4 bg-white hover:bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-700 flex items-center justify-center gap-2.5 transition shadow-sm active:scale-[0.99] disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.92 0 12s.45 3.85 1.24 5.42l4.04-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{loadingGoogle ? "Connecting Google..." : "Continue with Google"}</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-[1px] bg-gray-200" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                or sign in with email
              </span>
              <div className="flex-1 h-[1px] bg-gray-200" />
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium focus:bg-white focus:border-red-600 focus:ring-2 focus:ring-red-600/10 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[11px] font-bold text-red-600 hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium focus:bg-white focus:border-red-600 focus:ring-2 focus:ring-red-600/10 outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !isLoaded}
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-600/25 transition active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Fallback to Clerk Full Portal */}
            <div className="text-center pt-2 border-t border-gray-100 space-y-1">
              <p className="text-xs text-gray-500">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="font-bold text-red-600 hover:underline">
                  Create an account
                </Link>
              </p>
              <p className="text-[11px] text-gray-400">
                Having sign-in issues?{" "}
                <Link href="/sign-in" className="text-gray-700 underline font-semibold">
                  Open Clerk Full Portal
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50/70 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
