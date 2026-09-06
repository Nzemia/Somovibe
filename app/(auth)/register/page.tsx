"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { cn } from "@/lib/utils";
import { isSafeReturnPath, loginHref } from "@/lib/returnTicket";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
} from "lucide-react";

const fieldClass =
  "w-full h-space-7 rounded-full border border-border bg-surface pl-space-7 pr-space-5 font-sans text-body text-text-primary placeholder:text-text-muted focus-visible:shadow-focus focus-visible:outline-none";

const primaryBtnClass =
  "fold-cta-sell inline-flex h-space-7 w-full items-center justify-center gap-space-2 rounded-full bg-accent-hover px-space-6 font-sans text-body font-bold text-surface focus-visible:shadow-focus focus-visible:outline-none disabled:opacity-60";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div />}>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const ticket = isSafeReturnPath(callbackUrl) ? callbackUrl : null;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const passwordStrength = (() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  })();

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"][
    passwordStrength
  ];
  const strengthColor = [
    "",
    "bg-destructive",
    "bg-orange-400",
    "bg-yellow-400",
    "bg-accent-hover",
    "bg-primary",
  ][passwordStrength];

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (String(data.error ?? "").toLowerCase().includes("already exists")) {
        setError("That email already has an account. Sign in instead.");
      } else {
        setError(data.error ?? "Registration failed. Please try again.");
      }
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    window.location.href = ticket || "/marketplace";
  }

  return (
    <div className="flex flex-col gap-space-3">
      <div className="text-center">
        <h1 className="font-sans text-title font-bold text-primary">
          Create your account.
        </h1>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-soft border border-destructive/30 bg-destructive/5 px-space-4 py-space-3 text-left font-sans text-caption text-destructive"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="rounded-soft border border-border bg-surface-muted px-space-4 py-space-3 text-left font-sans text-caption font-bold text-accent-hover"
        >
          Account created! Redirecting…
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          const dest = ticket
            ? `/auth/callback?callbackUrl=${encodeURIComponent(ticket)}`
            : "/auth/callback";
          signIn("google", { callbackUrl: dest });
        }}
        className="inline-flex h-space-7 w-full items-center justify-center gap-space-2 rounded-full border border-border bg-surface px-space-6 font-sans text-body font-bold text-text-primary focus-visible:shadow-focus focus-visible:outline-none"
      >
        <GoogleMark />
        Continue with Google
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-surface px-space-3 font-sans text-caption font-bold uppercase tracking-wider text-text-muted">
            Or
          </span>
        </div>
      </div>

      <form onSubmit={handleRegister} className="flex flex-col gap-space-3">
        <div className="text-left">
          <label
            htmlFor="email"
            className="mb-space-2 block font-sans text-caption font-bold text-text-primary"
          >
            Email address
          </label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-space-4 top-1/2 size-space-4 -translate-y-1/2 text-text-muted"
              strokeWidth={2}
              aria-hidden="true"
            />
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={fieldClass}
            />
          </div>
        </div>

        <div className="text-left">
          <label
            htmlFor="password"
            className="mb-space-2 block font-sans text-caption font-bold text-text-primary"
          >
            Password
          </label>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-space-4 top-1/2 size-space-4 -translate-y-1/2 text-text-muted"
              strokeWidth={2}
              aria-hidden="true"
            />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={cn(fieldClass, "pr-space-7")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-space-4 top-1/2 -translate-y-1/2 text-text-muted focus-visible:shadow-focus focus-visible:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="size-space-4" strokeWidth={2} />
              ) : (
                <Eye className="size-space-4" strokeWidth={2} />
              )}
            </button>
          </div>

          {password && (
            <div className="mt-space-1 flex items-center gap-space-2">
              <div className="flex flex-1 gap-space-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors duration-200",
                      i <= passwordStrength ? strengthColor : "bg-border"
                    )}
                  />
                ))}
              </div>
              <p
                className={cn(
                  "shrink-0 font-sans text-caption font-bold",
                  passwordStrength <= 1
                    ? "text-destructive"
                    : passwordStrength <= 2
                      ? "text-orange-500"
                      : passwordStrength <= 3
                        ? "text-yellow-600"
                        : "text-accent-hover"
                )}
              >
                {strengthLabel}
              </p>
            </div>
          )}
        </div>

        <div className="text-left">
          <label
            htmlFor="confirmPassword"
            className="mb-space-2 block font-sans text-caption font-bold text-text-primary"
          >
            Confirm password
          </label>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-space-4 top-1/2 size-space-4 -translate-y-1/2 text-text-muted"
              strokeWidth={2}
              aria-hidden="true"
            />
            <input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={cn(
                fieldClass,
                "pr-space-7",
                confirmPassword && confirmPassword !== password
                  ? "border-destructive"
                  : confirmPassword && confirmPassword === password
                    ? "border-accent-hover"
                    : ""
              )}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-space-4 top-1/2 -translate-y-1/2 text-text-muted focus-visible:shadow-focus focus-visible:outline-none"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? (
                <EyeOff className="size-space-4" strokeWidth={2} />
              ) : (
                <Eye className="size-space-4" strokeWidth={2} />
              )}
            </button>
          </div>
          {confirmPassword && confirmPassword !== password && (
            <p className="mt-space-1 font-sans text-caption text-destructive">
              Passwords don&apos;t match
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || success}
          className={primaryBtnClass}
        >
          {loading ? (
            <>
              <Loader2 className="size-space-4 animate-spin" strokeWidth={2} />
              Creating account...
            </>
          ) : (
            <>
              Create account
              <ArrowRight className="size-space-4" strokeWidth={2} />
            </>
          )}
        </button>

        <p className="text-center font-sans text-caption leading-relaxed text-text-muted">
          By creating an account you agree to our{" "}
          <Link
            href="/terms"
            className="font-bold text-accent-hover focus-visible:shadow-focus focus-visible:outline-none"
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="font-bold text-accent-hover focus-visible:shadow-focus focus-visible:outline-none"
          >
            Privacy Policy
          </Link>
        </p>
      </form>

      <p className="text-center font-sans text-caption text-text-muted">
        Already have an account?{" "}
        <Link
          href={loginHref(ticket)}
          className="font-bold text-accent-hover focus-visible:shadow-focus focus-visible:outline-none"
        >
          Sign in instead
        </Link>
      </p>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg className="size-space-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}
