"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

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

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-card border border-border rounded-lg shadow-lg p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-foreground mb-2">
                            Become a Teacher
                        </h1>
                        <p className="text-muted-foreground">
                            Share your knowledge and earn money
                        </p>
                    </div>

                    {/* Step Indicator */}
                    <div className="flex items-center justify-center mb-8">
                        <div className="flex items-center space-x-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "form" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                                }`}>
                                1
                            </div>
                            <div className="w-12 h-1 bg-border"></div>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "payment" || step === "checking" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                                }`}>
                                2
                            </div>
                            <div className="w-12 h-1 bg-border"></div>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "checking" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                                }`}>
                                3
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-destructive/10 border border-destructive rounded-md">
                            <p className="text-sm text-destructive">{error}</p>
                        </div>
                    )}

                    {/* Step 1: Form */}
                    {step === "form" && (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                                    placeholder="teacher@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    M-Pesa Phone Number
                                </label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                                    placeholder="254712345678"
                                />
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Format: 254XXXXXXXXX (no spaces or +)
                                </p>
                            </div>

                            <div className="bg-accent/50 border border-border rounded-md p-4">
                                <h3 className="font-semibold text-foreground mb-2">One-time Verification Fee</h3>
                                <p className="text-2xl font-bold text-primary mb-2">KES 100</p>
                                <p className="text-sm text-muted-foreground">
                                    This helps us verify genuine teachers and maintain quality on our platform.
                                </p>

                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                {loading ? "Processing..." : "Continue to Payment"}
                            </button>
                        </form>
                    )}

                    {/* Step 2: Payment */}
                    {step === "payment" && (
                        <div className="space-y-6">
                            <div className="bg-accent/50 border border-border rounded-md p-6 text-center">
                                <div className="mb-4">
                                    <svg className="w-16 h-16 mx-auto text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-2">Ready to Pay</h3>
                                <p className="text-muted-foreground mb-4">
                                    Click the button below to receive an M-Pesa prompt on your phone
                                </p>
                                <div className="bg-background border border-border rounded-md p-3 mb-4">
                                    <p className="text-xs text-muted-foreground mb-1">Reference Code</p>
                                    <p className="font-mono text-sm font-bold text-foreground">{referenceCode}</p>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Amount: <span className="font-bold text-primary">KES 100</span>
                                </p>
                            </div>

                            <button
                                onClick={handlePayment}
                                disabled={loading}
                                className="w-full py-3 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                {loading ? "Sending STK Push..." : "Pay with M-Pesa"}
                            </button>

                            <button
                                onClick={() => setStep("form")}
                                className="w-full py-2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Back to Form
                            </button>
                        </div>
                    )}

                    {/* Step 3: Checking Payment */}
                    {step === "checking" && (
                        <div className="space-y-6 text-center">
                            <div className="flex justify-center">
                                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-foreground mb-2">
                                    Waiting for Payment
                                </h3>
                                <p className="text-muted-foreground mb-4">
                                    Please check your phone for the M-Pesa prompt and enter your PIN
                                </p>
                                <div className="bg-accent/50 border border-border rounded-md p-4">
                                    <p className="text-sm text-muted-foreground">
                                        This may take a few seconds. Don't close this page.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="pt-6 border-t border-border mt-4">
                                <p className="text-sm text-muted-foreground mb-3">
                                    Took too long? If you have already paid, you can verify manually.
                                </p>
                                <button
                                    onClick={() => {
                                        setError("");
                                        setStep("manual-verification");
                                    }}
                                    className="text-sm text-primary hover:underline font-medium"
                                >
                                    Enter M-Pesa Receipt Number
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Manual Verification Entry */}
                    {step === "manual-verification" && (
                        <div className="space-y-6">
                            <div className="text-center mb-6">
                                <h3 className="text-xl font-bold text-foreground mb-2">
                                    Verify Payment Manually
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    If your payment was deducted but your account wasn't activated, enter the M-Pesa Message/Receipt Number below.
                                </p>
                            </div>

                            <form onSubmit={handleManualVerification} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">
                                        M-Pesa Receipt Number
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={mpesaReceipt}
                                        onChange={(e) => setMpesaReceipt(e.target.value.toUpperCase())}
                                        className="w-full px-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground font-mono uppercase"
                                        placeholder="e.g. QWE123RTY4"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || mpesaReceipt.length < 5}
                                    className="w-full py-3 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                    {loading ? "Submitting..." : "Submit Receipt for Review"}
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={() => setStep("payment")}
                                    className="w-full py-2 text-muted-foreground hover:text-foreground transition-colors mt-2"
                                >
                                    Try M-Pesa Payment Again
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-muted-foreground">
                            Already a teacher?{" "}
                            <Link href="/login" className="text-primary hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
