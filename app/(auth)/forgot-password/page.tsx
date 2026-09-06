"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { isSafeReturnPath, loginHref } from "@/lib/returnTicket";
import { ArrowLeft, Loader2, Mail } from "lucide-react";

const fieldClass =
  "w-full h-space-7 rounded-full border border-border bg-surface pl-space-7 pr-space-5 font-sans text-body text-text-primary placeholder:text-text-muted focus-visible:shadow-focus focus-visible:outline-none";

const primaryBtnClass =
  "fold-cta-sell inline-flex h-space-7 w-full items-center justify-center gap-space-2 rounded-full bg-accent-hover px-space-6 font-sans text-body font-bold text-surface focus-visible:shadow-focus focus-visible:outline-none disabled:opacity-60";

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div />}>
      <ForgotPasswordForm />
    </Suspense>
  );
}

function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const ticket = isSafeReturnPath(searchParams.get("callbackUrl"))
    ? searchParams.get("callbackUrl")
    : null;
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, callbackUrl: ticket }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        setEmail("");
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch {
      setError("Failed to send reset email");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-space-6">
      <div className="text-center">
        <h1 className="font-sans text-title font-bold text-primary">
          Forgot password?
        </h1>
        <p className="mt-space-2 font-sans text-body text-text-muted">
          Enter your email and we&apos;ll send you a reset link
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

      {message && (
        <div
          role="status"
          className="rounded-soft border border-border bg-surface-muted px-space-4 py-space-3 text-left font-sans text-caption font-bold text-accent-hover"
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-space-4">
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

        <button type="submit" disabled={loading} className={primaryBtnClass}>
          {loading ? (
            <>
              <Loader2 className="size-space-4 animate-spin" strokeWidth={2} />
              Sending link...
            </>
          ) : (
            "Send reset link"
          )}
        </button>
      </form>

      <Link
        href={loginHref(ticket)}
        className="inline-flex items-center justify-center gap-space-2 font-sans text-caption font-bold text-accent-hover focus-visible:shadow-focus focus-visible:outline-none"
      >
        <ArrowLeft className="size-space-4" strokeWidth={2} />
        Back to login
      </Link>
    </div>
  );
}
