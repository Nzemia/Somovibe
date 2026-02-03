"use client";

import { supabase } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState<"STUDENT" | "TEACHER">("STUDENT");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess(false);

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

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        if (data?.user?.identities?.length === 0) {
            setError("This email is already registered. Please login instead.");
            setLoading(false);
            setTimeout(() => router.push("/login"), 2000);
            return;
        }

        try {
            await fetch("/api/auth/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, role }),
            });

            setSuccess(true);
            setLoading(false);

            if (role === "TEACHER") {
                setTimeout(() => router.push("/teacher-register"), 1500);
            } else {
                setTimeout(() => router.push("/"), 1500);
            }
        } catch (err) {
            setError("Account created but sync failed. Please contact support.");
            setLoading(false);
        }
    }

    return (
        <div className="p-8">
            <div className="text-center space-y-4 mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl mx-auto">
                    <svg
                        className="w-8 h-8 text-primary-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold text-foreground">Join Questy</h1>
                <p className="text-muted-foreground">Start your learning journey today</p>
            </div>

            <div className="space-y-6">
                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {success && (
                    <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300">
                        <AlertDescription>
                            Account created successfully! Redirecting...
                        </AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-foreground">
                            Email Address
                        </label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="email@gmail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">I am a...</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setRole("STUDENT")}
                                className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all ${role === "STUDENT"
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-border hover:border-primary/50"
                                    }`}
                            >
                                <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                <span className="font-medium">Student</span>
                                <span className="text-xs text-muted-foreground mt-1">Learn & Purchase</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole("TEACHER")}
                                className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all ${role === "TEACHER"
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-border hover:border-primary/50"
                                    }`}
                            >
                                <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span className="font-medium">Teacher</span>
                                <span className="text-xs text-muted-foreground mt-1">Teach & Earn</span>
                            </button>
                        </div>
                        {role === "TEACHER" && (
                            <p className="text-xs text-muted-foreground mt-2">
                                Note: Teachers require a one-time KES 100 verification fee
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium text-foreground">
                            Password
                        </label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                            Confirm Password
                        </label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading || success}
                        className="w-full"
                        size="lg"
                    >
                        {loading ? "Creating Account..." : "Create Account"}
                    </Button>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-card/80 text-muted-foreground">
                            Already have an account?
                        </span>
                    </div>
                </div>

                <Link href="/login" className="block">
                    <Button variant="outline" className="w-full" size="lg">
                        Sign In
                    </Button>
                </Link>
            </div>
        </div>
    );
}
