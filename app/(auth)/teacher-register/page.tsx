"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowRight, Loader2, Mail, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

const fieldClass =
    "w-full h-space-7 rounded-full border border-border bg-surface pl-space-7 pr-space-5 font-sans text-body text-text-primary placeholder:text-text-muted focus-visible:shadow-focus focus-visible:outline-none";

const primaryBtnClass =
    "fold-cta-sell inline-flex h-space-7 w-full items-center justify-center gap-space-2 rounded-full bg-accent-hover px-space-6 font-sans text-body font-bold text-surface focus-visible:shadow-focus focus-visible:outline-none disabled:opacity-60";

export default function TeacherRegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState<"form" | "payment" | "checking" | "manual-verification">("form");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [referenceCode, setReferenceCode] = useState("");
    const [mpesaReceipt, setMpesaReceipt] = useState("");

    const [formData, setFormData] = useState({
        email: "",
        phone: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/teacher/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Registration failed");
            }

            setReferenceCode(data.referenceCode);
            setStep("payment");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async () => {
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/mpesa/stk/teacher", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ referenceCode }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Payment initiation failed");
            }



            setStep("checking");
            // Start polling for payment status
            pollPaymentStatus();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const pollPaymentStatus = async () => {
        const maxAttempts = 30; // 30 seconds
        let attempts = 0;

        const interval = setInterval(async () => {
            attempts++;

            try {
                const res = await fetch(`/api/payment/status?referenceCode=${referenceCode}&_t=${Date.now()}`, {
                    cache: "no-store",
                });
                const data = await res.json();

                if (data.status === "COMPLETED") {
                    clearInterval(interval);
                    router.push("/teacher?verified=true");
                } else if (data.status === "FAILED") {
                    clearInterval(interval);
                    setError("Payment failed. Please try again.");
                    setStep("payment");
                } else if (attempts >= maxAttempts) {
                    clearInterval(interval);
                    setError("Payment verification timeout. If you have been deducted, please provide your M-Pesa receipt below.");
                    setStep("manual-verification");
                }
            } catch (err) {
                console.error("Polling error:", err);
            }
        }, 1000);
    };

    const handleManualVerification = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/teacher/verify-manual", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    referenceCode,
                    mpesaReceipt
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Submission failed");
            }

            // Success message or redirect
            setError("");
            toast.success("Receipt submitted! The admin will review it and activate your account shortly.");
            router.push("/");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const stepIndex = step === "form" ? 1 : step === "payment" ? 2 : 3;

    return (
        <div className="flex flex-col gap-space-3">
            <div className="text-center">
                <h1 className="font-sans text-title font-bold text-primary">
                    Become a teacher.
                </h1>
                <p className="mt-space-1 font-sans text-caption text-text-muted">
                    Share your materials and earn 75% on every sale
                </p>
            </div>

            <div className="flex items-center justify-center gap-space-2">
                {[1, 2, 3].map((n) => (
                    <div key={n} className="flex items-center gap-space-2">
                        <div
                            className={cn(
                                "flex size-space-6 items-center justify-center rounded-full font-sans text-caption font-bold",
                                n <= stepIndex
                                    ? "bg-accent-hover text-surface"
                                    : "bg-surface-muted text-text-muted"
                            )}
                        >
                            {n}
                        </div>
                        {n < 3 && (
                            <div className={cn("h-0.5 w-8", n < stepIndex ? "bg-accent-hover" : "bg-border")} />
                        )}
                    </div>
                ))}
            </div>

            {error && (
                <div
                    role="alert"
                    className="rounded-soft border border-destructive/30 bg-destructive/5 px-space-4 py-space-3 text-left font-sans text-caption text-destructive"
                >
                    {error}
                </div>
            )}

            {step === "form" && (
                <form onSubmit={handleSubmit} className="flex flex-col gap-space-3">
                    <div className="text-left">
                        <label htmlFor="teacher-email" className="mb-space-2 block font-sans text-caption font-bold text-text-primary">
                            Email address
                        </label>
                        <div className="relative">
                            <Mail className="pointer-events-none absolute left-space-4 top-1/2 size-space-4 -translate-y-1/2 text-text-muted" strokeWidth={2} />
                            <input
                                id="teacher-email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className={fieldClass}
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    <div className="text-left">
                        <label htmlFor="teacher-phone" className="mb-space-2 block font-sans text-caption font-bold text-text-primary">
                            M-Pesa phone number
                        </label>
                        <div className="relative">
                            <Phone className="pointer-events-none absolute left-space-4 top-1/2 size-space-4 -translate-y-1/2 text-text-muted" strokeWidth={2} />
                            <input
                                id="teacher-phone"
                                type="tel"
                                required
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className={fieldClass}
                                placeholder="254712345678"
                            />
                        </div>
                        <p className="mt-space-1 font-sans text-caption text-text-muted">
                            Format: 254XXXXXXXXX — no spaces or +
                        </p>
                    </div>

                    <div className="rounded-soft border border-border bg-surface-muted px-space-4 py-space-3 text-left">
                        <p className="font-sans text-caption font-bold text-text-primary">One-time verification</p>
                        <p className="font-sans text-title font-bold text-accent-hover">KES 100</p>
                        <p className="font-sans text-caption text-text-muted">
                            Paid once via M-Pesa. Then you can upload and sell.
                        </p>
                    </div>

                    <button type="submit" disabled={loading} className={primaryBtnClass}>
                        {loading ? (
                            <>
                                <Loader2 className="size-space-4 animate-spin" strokeWidth={2} />
                                Processing...
                            </>
                        ) : (
                            <>
                                Continue to payment
                                <ArrowRight className="size-space-4" strokeWidth={2} />
                            </>
                        )}
                    </button>
                </form>
            )}

            {step === "payment" && (
                <div className="flex flex-col gap-space-3">
                    <div className="rounded-soft border border-border bg-surface-muted px-space-4 py-space-4 text-center">
                        <p className="font-sans text-body font-bold text-text-primary">Ready to pay</p>
                        <p className="mt-space-1 font-sans text-caption text-text-muted">
                            We&apos;ll send an M-Pesa prompt to your phone.
                        </p>
                        <p className="mt-space-3 font-sans text-caption text-text-muted">Reference</p>
                        <p className="font-mono text-sm font-bold text-text-primary">{referenceCode}</p>
                        <p className="mt-space-2 font-sans text-caption text-text-muted">
                            Amount <span className="font-bold text-accent-hover">KES 100</span>
                        </p>
                    </div>

                    <button type="button" onClick={handlePayment} disabled={loading} className={primaryBtnClass}>
                        {loading ? (
                            <>
                                <Loader2 className="size-space-4 animate-spin" strokeWidth={2} />
                                Sending STK Push...
                            </>
                        ) : (
                            "Pay with M-Pesa"
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => setStep("form")}
                        className="font-sans text-caption font-bold text-text-muted"
                    >
                        Back to form
                    </button>
                </div>
            )}

            {step === "checking" && (
                <div className="flex flex-col items-center gap-space-3 text-center">
                    <Loader2 className="size-space-7 animate-spin text-accent-hover" strokeWidth={2} />
                    <div>
                        <p className="font-sans text-body font-bold text-text-primary">Waiting for payment</p>
                        <p className="mt-space-1 font-sans text-caption text-text-muted">
                            Check your phone for the M-Pesa prompt and enter your PIN. Don&apos;t close this page.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            setError("");
                            setStep("manual-verification");
                        }}
                        className="font-sans text-caption font-bold text-accent-hover"
                    >
                        Enter M-Pesa receipt number
                    </button>
                </div>
            )}

            {step === "manual-verification" && (
                <form onSubmit={handleManualVerification} className="flex flex-col gap-space-3">
                    <div className="text-center">
                        <p className="font-sans text-body font-bold text-text-primary">Verify payment manually</p>
                        <p className="mt-space-1 font-sans text-caption text-text-muted">
                            If M-Pesa deducted you but nothing happened, enter the receipt number.
                        </p>
                    </div>
                    <input
                        type="text"
                        required
                        value={mpesaReceipt}
                        onChange={(e) => setMpesaReceipt(e.target.value.toUpperCase())}
                        className={cn(fieldClass, "pl-space-5 font-mono uppercase")}
                        placeholder="e.g. QWE123RTY4"
                    />
                    <button
                        type="submit"
                        disabled={loading || mpesaReceipt.length < 5}
                        className={primaryBtnClass}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="size-space-4 animate-spin" strokeWidth={2} />
                                Submitting...
                            </>
                        ) : (
                            "Submit receipt for review"
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => setStep("payment")}
                        className="font-sans text-caption font-bold text-text-muted"
                    >
                        Try M-Pesa payment again
                    </button>
                </form>
            )}

            <p className="text-center font-sans text-caption text-text-muted">
                Need an account first?{" "}
                <Link href="/register" className="font-bold text-accent-hover">
                    Create an account
                </Link>
                {" · "}
                Already a teacher?{" "}
                <Link href="/login" className="font-bold text-accent-hover">
                    Sign in
                </Link>
            </p>
        </div>
    );
}
