"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { isSafeReturnPath, loginHref } from "@/lib/returnTicket";
import { ArrowLeft, Eye, EyeOff, Loader2, Lock } from "lucide-react";

const fieldClass =
  "w-full h-space-7 rounded-full border border-border bg-surface pl-space-7 pr-space-5 font-sans text-body text-text-primary placeholder:text-text-muted focus-visible:shadow-focus focus-visible:outline-none";

const primaryBtnClass =
  "fold-cta-sell inline-flex h-space-7 w-full items-center justify-center gap-space-2 rounded-full bg-accent-hover px-space-6 font-sans text-body font-bold text-surface focus-visible:shadow-focus focus-visible:outline-none disabled:opacity-60";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const ticket = isSafeReturnPath(searchParams.get("callbackUrl"))
    ? searchParams.get("callbackUrl")
    : null;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link");
    }
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push(loginHref(ticket));
        }, 2000);
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch {
      setError("Failed to reset password");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="flex flex-col gap-space-6 text-center">
        <h1 className="font-sans text-title font-bold text-primary">
          Link expired.
        </h1>
        <p className="font-sans text-body text-text-muted">
          This password reset link is invalid or has expired. Please request a
          new one.
        </p>
        <Link
          href="/forgot-password"
          className="font-sans text-caption font-bold text-accent-hover focus-visible:shadow-focus focus-visible:outline-none"
        >
          Request a new reset link
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-space-6">
      <div className="text-center">
        <h1 className="font-sans text-title font-bold text-primary">
          Reset password.
        </h1>
        <p className="mt-space-2 font-sans text-body text-text-muted">
          Enter your new password below
        </p>
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
          Password reset successfully! Redirecting to login...
        </div>
      )}

      {!success && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-space-4">
          <div className="text-left">
            <label
              htmlFor="password"
              className="mb-space-2 block font-sans text-caption font-bold text-text-primary"
            >
              New password
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
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
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className={cn(fieldClass, "pr-space-7")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-space-4 top-1/2 -translate-y-1/2 text-text-muted focus-visible:shadow-focus focus-visible:outline-none"
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="size-space-4" strokeWidth={2} />
                ) : (
                  <Eye className="size-space-4" strokeWidth={2} />
                )}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className={primaryBtnClass}>
            {loading ? (
              <>
                <Loader2 className="size-space-4 animate-spin" strokeWidth={2} />
                Resetting password...
              </>
            ) : (
              "Reset password"
            )}
          </button>
        </form>
      )}

      <Link
        href="/login"
        className="inline-flex items-center justify-center gap-space-2 font-sans text-caption font-bold text-accent-hover focus-visible:shadow-focus focus-visible:outline-none"
      >
        <ArrowLeft className="size-space-4" strokeWidth={2} />
        Back to login
      </Link>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <p className="text-center font-sans text-body text-text-muted">
          Loading...
        </p>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
