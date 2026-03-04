"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Alert,
    AlertDescription
} from "@/components/ui/alert"
import { signIn } from "next-auth/react"
import { Loader2 } from "lucide-react"

// Password strength checker
function checkPasswordStrength(password: string): {
    strength: string
    color: string
    message: string
} {
    if (password.length === 0)
        return { strength: "", color: "", message: "" }

    let score = 0
    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password))
        score++
    if (/\d/.test(password)) score++
    if (/[^a-zA-Z0-9]/.test(password)) score++

    if (score <= 2)
        return {
            strength: "Weak",
            color: "text-red-500",
            message: "Add uppercase, numbers, and symbols"
        }
    if (score === 3)
        return {
            strength: "Fair",
            color: "text-orange-500",
            message: "Consider adding more characters"
        }
    if (score === 4)
        return {
            strength: "Good",
            color: "text-yellow-500",
            message: "Almost there!"
        }
    return {
        strength: "Strong",
        color: "text-green-500",
        message: "Great password!"
    }
}

export default function RegisterPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] =
        useState("")
    const [role, setRole] = useState<"STUDENT" | "TEACHER">(
        "STUDENT"
    )
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [showPassword, setShowPassword] = useState(false)

    const passwordStrength = checkPasswordStrength(password)

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError("")

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            setLoading(false)
            return
        }

        if (password.length < 8) {
            setError(
                "Password must be at least 8 characters long"
            )
            setLoading(false)
            return
        }

        // Strong password validation
        const hasUpperCase = /[A-Z]/.test(password)
        const hasLowerCase = /[a-z]/.test(password)
        const hasNumber = /\d/.test(password)

        if (!hasUpperCase || !hasLowerCase || !hasNumber) {
            setError(
                "Password must contain uppercase, lowercase, and numbers"
            )
            setLoading(false)
            return
        }

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password,
                    role
                })
            })

            const data = await res.json()

            if (!res.ok) {
                setError(
                    data.error || "Registration failed"
                )
                setLoading(false)
                return
            }

            // Auto sign in after registration
            const signInResult = await signIn(
                "credentials",
                {
                    email,
                    password,
                    redirect: false
                }
            )

            if (signInResult?.error) {
                setError(
                    "Account created but login failed. Please try logging in."
                )
                setLoading(false)
                return
            }

            // Redirect based on role
            if (role === "TEACHER") {
                router.push("/teacher-register")
            } else {
                router.push("/")
            }
            router.refresh()
        } catch (err) {
            setError(
                "Something went wrong. Please try again."
            )
            setLoading(false)
        }
    }

    async function handleOAuthRegister(
        provider: "google" | "github"
    ) {
        setLoading(true)
        setError("")
        await signIn(provider, { callbackUrl: "/" })
    }

    return (
        <div className="p-8">
            <div className="text-center space-y-4 mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-primary to-primary/80 rounded-2xl mx-auto">
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
                <h1 className="text-3xl font-bold text-foreground">
                    Join Somovibe
                </h1>
                <p className="text-muted-foreground">
                    Start your learning journey today
                </p>
            </div>

            <div className="space-y-6">
                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>
                            {error}
                        </AlertDescription>
                    </Alert>
                )}

                <form
                    onSubmit={handleRegister}
                    className="space-y-4"
                >
                    <div className="space-y-2">
                        <label
                            htmlFor="email"
                            className="text-sm font-medium text-foreground"
                        >
                            Email Address
                        </label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="email@gmail.com"
                            value={email}
                            onChange={e =>
                                setEmail(e.target.value)
                            }
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                            I am a...
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() =>
                                    setRole("STUDENT")
                                }
                                disabled={loading}
                                className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all ${
                                    role === "STUDENT"
                                        ? "border-primary bg-primary/10 text-primary"
                                        : "border-border hover:border-primary/50"
                                }`}
                            >
                                <svg
                                    className="w-8 h-8 mb-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                    />
                                </svg>
                                <span className="font-medium">
                                    Student
                                </span>
                                <span className="text-xs text-muted-foreground mt-1">
                                    Learn & Purchase
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    setRole("TEACHER")
                                }
                                disabled={loading}
                                className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all ${
                                    role === "TEACHER"
                                        ? "border-primary bg-primary/10 text-primary"
                                        : "border-border hover:border-primary/50"
                                }`}
                            >
                                <svg
                                    className="w-8 h-8 mb-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                    />
                                </svg>
                                <span className="font-medium">
                                    Teacher
                                </span>
                                <span className="text-xs text-muted-foreground mt-1">
                                    Teach & Earn
                                </span>
                            </button>
                        </div>
                        {role === "TEACHER" && (
                            <p className="text-xs text-muted-foreground mt-2">
                                Note: Teachers require a
                                one-time KES 100
                                verification fee
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="password"
                            className="text-sm font-medium text-foreground"
                        >
                            Password
                        </label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                placeholder="••••••••"
                                value={password}
                                onChange={e =>
                                    setPassword(
                                        e.target.value
                                    )
                                }
                                required
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword(
                                        !showPassword
                                    )
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showPassword ? (
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                        />
                                    </svg>
                                ) : (
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                        />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {password && (
                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                    <span
                                        className={
                                            passwordStrength.color
                                        }
                                    >
                                        {
                                            passwordStrength.strength
                                        }
                                    </span>
                                    <span className="text-muted-foreground">
                                        {
                                            passwordStrength.message
                                        }
                                    </span>
                                </div>
                                <div className="h-1 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all ${
                                            passwordStrength.strength ===
                                            "Weak"
                                                ? "w-1/4 bg-red-500"
                                                : passwordStrength.strength ===
                                                    "Fair"
                                                  ? "w-1/2 bg-orange-500"
                                                  : passwordStrength.strength ===
                                                      "Good"
                                                    ? "w-3/4 bg-yellow-500"
                                                    : "w-full bg-green-500"
                                        }`}
                                    />
                                </div>
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Must be 8+ characters with
                            uppercase, lowercase, and
                            numbers
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="confirmPassword"
                            className="text-sm font-medium text-foreground"
                        >
                            Confirm Password
                        </label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={e =>
                                setConfirmPassword(
                                    e.target.value
                                )
                            }
                            required
                            disabled={loading}
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full"
                        size="lg"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating account...
                            </>
                        ) : (
                            "Create Account"
                        )}
                    </Button>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-card/80 text-muted-foreground">
                            Or continue with
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                            handleOAuthRegister("google")
                        }
                        disabled={loading}
                    >
                        <svg
                            className="w-5 h-5 mr-2"
                            viewBox="0 0 24 24"
                        >
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Google
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                            handleOAuthRegister("github")
                        }
                        disabled={loading}
                    >
                        <svg
                            className="w-5 h-5 mr-2"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                        GitHub
                    </Button>
                </div>

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
                    <Button
                        variant="outline"
                        className="w-full"
                        size="lg"
                    >
                        Sign In
                    </Button>
                </Link>
            </div>
        </div>
    )
}
