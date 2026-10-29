"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
  ArrowLeft,
  Key,
} from "lucide-react";
import { useSignUp } from "@clerk/nextjs/legacy";
import { useUser, useClerk } from "@clerk/nextjs";
import { useAdminStore } from "@/store/useAdminStore";
import { resolveAdminRole } from "@/lib/adminAuth";

export default function RegisterPage() {
  const router = useRouter();
  const { isLoaded, signUp, setActive } = useSignUp();
  const { user, isSignedIn, isLoaded: isUserLoaded } = useUser();
  const { signOut } = useClerk();
  const { loginAdmin } = useAdminStore();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  // In-page Email Verification State
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendSuccess, setResendSuccess] = useState("");
  const [duplicateEmail, setDuplicateEmail] = useState(false);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // If already signed in, show clean switch/continue prompt instead of trapping the user
  if (isUserLoaded && isSignedIn && user) {
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
                if (adminRole) {
                  router.push("/admin");
                } else {
                  router.push("/account");
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
              {loading ? "Signing out..." : "Sign Out & Register New Account"}
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

  // 1. Initial Registration Submit
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setDuplicateEmail(false);
    setResendSuccess("");

    if (!isLoaded || !signUp) return;
    if (!form.name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!form.email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!form.password || form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    const cleanEmail = form.email.trim().toLowerCase();
    const cleanName = form.name.trim();

    try {
      const result = await signUp.create({
        emailAddress: cleanEmail,
        password: form.password,
        firstName: cleanName,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        const role = resolveAdminRole(cleanEmail);
        if (role === "main" || role === "normal") {
          loginAdmin(cleanEmail, role);
          router.push("/admin");
        } else {
          router.push("/account");
        }
      } else {
        // Email verification is required by Clerk:
        // Trigger verification email code and stay on this branded page
        await signUp.prepareEmailAddressVerification({
          strategy: "email_code",
        });
        setVerifyingEmail(cleanEmail);
        setIsVerifying(true);
        setResendCooldown(60);
      }
    } catch (err: unknown) {
      const errors = (err as { errors?: Array<{ code?: string; message?: string; longMessage?: string }> })?.errors;
      const isTaken = errors?.some(
        (e) =>
          e.code === "form_identifier_exists" ||
          e.message?.toLowerCase().includes("taken") ||
          e.message?.toLowerCase().includes("already") ||
          e.message?.toLowerCase().includes("exists")
      );

      if (isTaken) {
        setDuplicateEmail(true);
        setError("An account with this email address already exists.");
      } else {
        const clerkError =
          errors?.[0]?.longMessage ||
          errors?.[0]?.message ||
          "Could not create account. Please check your information and try again.";
        setError(clerkError);
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. Verification Code Submit
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResendSuccess("");

    if (!isLoaded || !signUp) return;
    if (!verificationCode.trim() || verificationCode.trim().length < 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verificationCode.trim(),
      });

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        const cleanEmail = verifyingEmail || form.email.trim().toLowerCase();
        const role = resolveAdminRole(cleanEmail);
        if (role === "main" || role === "normal") {
          loginAdmin(cleanEmail, role);
          router.push("/admin");
        } else {
          router.push("/account");
        }
      } else {
        setError("Verification is pending additional requirements. Please try again.");
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
      setLoading(false);
    }
  };

  // 3. Resend Verification Code
  const handleResendCode = async () => {
    if (!isLoaded || !signUp || resendCooldown > 0) return;
    setError("");
    setResendSuccess("");
    try {
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });
      setResendSuccess("A new verification code has been sent to your email!");
      setResendCooldown(60);
    } catch (err: unknown) {
      const clerkError =
        (err as { errors?: Array<{ longMessage?: string; message?: string }> })
          ?.errors?.[0]?.longMessage ||
        (err as { errors?: Array<{ longMessage?: string; message?: string }> })
          ?.errors?.[0]?.message ||
        "Could not resend verification code. Please wait a moment.";
      setError(clerkError);
    }
  };

  // 4. Google One-Click Auth via direct Clerk OAuth
  const handleGoogleSignUp = async () => {
    if (!isLoaded || !signUp) return;
    setError("");
    setLoadingGoogle(true);
    try {
      await signUp.authenticateWithRedirect({
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
        "Could not connect with Google. Please try again.";
      setError(clerkError);
      setLoadingGoogle(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/70 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl border border-gray-150 shadow-xl p-8 sm:p-10 space-y-6">
        {/* VIEW A: VERIFY EMAIL SCREEN (STAYS IN-PAGE) */}
        {isVerifying ? (
          <>
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
              <div className="inline-flex items-center justify-center w-12 h-12 bg-red-50 text-red-600 rounded-2xl mb-2 shadow-sm">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
                Verify Your Email
              </h1>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto leading-relaxed">
                We sent a 6-digit verification code to{" "}
                <strong className="text-gray-900 font-bold">{verifyingEmail}</strong>.
                Enter it below to complete your registration.
              </p>
            </div>

            {/* Success Notice for Resend */}
            {resendSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{resendSuccess}</span>
              </div>
            )}

            {/* Error Notice */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-600">
                {error}
              </div>
            )}

            {/* Verification Form */}
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 text-center">
                  6-Digit Verification Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    required
                    autoFocus
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-center text-xl font-mono font-black tracking-[0.3em] focus:bg-white focus:border-red-600 focus:ring-2 focus:ring-red-600/10 outline-none transition"
                  />
                </div>
                <p className="text-[11px] text-gray-400 text-center mt-1.5">
                  Check your inbox or spam folder for your LOKI activation code.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || verificationCode.length < 6}
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-600/25 transition active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? (
                  <span>Activating Account...</span>
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Resend & Edit Options */}
            <div className="space-y-2 pt-2 border-t border-gray-100 text-center">
              <button
                type="button"
                disabled={resendCooldown > 0}
                onClick={handleResendCode}
                className="text-xs font-semibold text-gray-700 hover:text-red-600 disabled:text-gray-400 transition inline-flex items-center justify-center gap-1.5 mx-auto"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${resendCooldown > 0 ? "animate-spin" : ""}`} />
                <span>
                  {resendCooldown > 0
                    ? `Resend code in ${resendCooldown}s`
                    : "Didn't receive code? Resend"}
                </span>
              </button>

              <div>
                <button
                  type="button"
                  onClick={() => {
                    setIsVerifying(false);
                    setError("");
                  }}
                  className="text-[11px] text-gray-400 hover:text-gray-700 transition inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Entered wrong email? Edit details</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          /* VIEW B: INITIAL REGISTRATION FORM */
          <>
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
                Create an Account
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Join the LOKI Club for tournament gear, match rewards &amp; fast checkout.
              </p>
            </div>

            {/* Error Notice */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-600 space-y-1">
                <p>{error}</p>
                {duplicateEmail && (
                  <p className="text-[11px] text-gray-700">
                    Already registered?{" "}
                    <Link
                      href="/login"
                      className="font-bold text-red-600 underline hover:text-red-700 ml-1"
                    >
                      Sign In to your account →
                    </Link>
                  </p>
                )}
              </div>
            )}

            {/* Google One-Click Direct OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleSignUp}
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
              <span>{loadingGoogle ? "Connecting Google..." : "Sign Up with Google"}</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-[1px] bg-gray-200" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                or sign up with email
              </span>
              <div className="flex-1 h-[1px] bg-gray-200" />
            </div>

            {/* Form */}
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Rohan Sharma"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium focus:bg-white focus:border-red-600 focus:ring-2 focus:ring-red-600/10 outline-none transition"
                  />
                </div>
              </div>

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
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium focus:bg-white focus:border-red-600 focus:ring-2 focus:ring-red-600/10 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="9841000000"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium focus:bg-white focus:border-red-600 focus:ring-2 focus:ring-red-600/10 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Minimum 8 characters"
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
                <p className="mt-1 text-[11px] text-gray-400">
                  Minimum 8 characters. Clerk enforces additional strength requirements.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !isLoaded}
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-600/25 transition active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Sign In Link */}
            <div className="text-center pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Already have an account?{" "}
                <Link href="/login" className="font-bold text-red-600 hover:underline">
                  Sign In
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
