"use client"

<<<<<<< HEAD
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"STUDENT" | "TEACHER">("STUDENT");
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

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"][passwordStrength];
  const strengthColor = ["", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-[#008c43]", "bg-[#00b856]"][passwordStrength];

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
      body: JSON.stringify({ email, password, role }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data.error ?? "Registration failed. Please try again.");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    const redirectRole = data.user?.role ?? "STUDENT";
    const dest = redirectRole === "ADMIN" ? "/admin" : redirectRole === "TEACHER" ? "/teacher" : "/student";
    router.push(dest);
    router.refresh();
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Green header strip */}
      <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, #003318, #008c43, #00b856)" }} />

      <div className="px-7 sm:px-10 pt-8 pb-10">
        {/* Heading */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
            Create your account
          </h1>
          <p className="text-gray-500 text-sm mt-1.5">
            Free forever · Pay only when you buy
          </p>
        </div>

        {/* Role toggle */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-2">I want to join as a</p>
          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
            <button
              type="button"
              onClick={() => setRole("STUDENT")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                role === "STUDENT"
                  ? "bg-white text-[#008c43] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Buyer
            </button>
            <button
              type="button"
              onClick={() => setRole("TEACHER")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                role === "TEACHER"
                  ? "bg-white text-[#008c43] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Teacher
            </button>
          </div>
          {role === "TEACHER" && (
            <p className="mt-2 text-xs text-[#008c43] flex items-start gap-1.5">
              <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              A one-time KES 100 verification fee applies to activate selling.
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="flex items-center gap-3 bg-[#f0faf5] border border-[#b7deca] text-[#006832] rounded-xl px-4 py-3 mb-5 text-sm">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Account created! Redirecting…
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#008c43] focus:border-transparent transition-shadow bg-gray-50 hover:bg-white"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#008c43] focus:border-transparent transition-shadow bg-gray-50 hover:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Password strength meter */}
            {password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= passwordStrength ? strengthColor : "bg-gray-200"}`}
                    />
                  ))}
                </div>
                <p className={`text-xs font-medium ${passwordStrength <= 1 ? "text-red-500" : passwordStrength <= 2 ? "text-orange-500" : passwordStrength <= 3 ? "text-yellow-600" : "text-[#008c43]"}`}>
                  {strengthLabel}
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </span>
              <input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={`w-full pl-11 pr-12 py-3 border rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-shadow bg-gray-50 hover:bg-white ${
                  confirmPassword && confirmPassword !== password
                    ? "border-red-300 focus:ring-red-400"
                    : confirmPassword && confirmPassword === password
                    ? "border-[#008c43]/50 focus:ring-[#008c43]"
                    : "border-gray-200 focus:ring-[#008c43]"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showConfirm ? "Hide" : "Show"}
              >
                {showConfirm ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {confirmPassword && confirmPassword !== password && (
              <p className="mt-1.5 text-xs text-red-500">Passwords don&apos;t match</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-bold text-sm transition-all duration-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl mt-1"
            style={{ background: "linear-gradient(135deg, #006832 0%, #008c43 60%, #00a854 100%)" }}
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating account...
              </>
            ) : (
              <>
                Create Free Account
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>

          <p className="text-center text-xs text-gray-400 leading-relaxed">
            By creating an account you agree to our{" "}
            <Link href="/terms" className="text-[#008c43] hover:underline font-medium">Terms</Link>
            {" "}and{" "}
            <Link href="/privacy" className="text-[#008c43] hover:underline font-medium">Privacy Policy</Link>
          </p>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 bg-white text-gray-400 text-xs">Already have an account?</span>
          </div>
        </div>

        <Link
          href="/login"
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl border-2 border-[#008c43]/30 text-[#008c43] font-bold text-sm hover:bg-[#f0faf5] hover:border-[#008c43] transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          Sign In Instead
        </Link>
      </div>
    </div>
  );
=======
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


                <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOAuthRegister("google")}
                    disabled={loading}
                    className="w-full"
                    size="lg"
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
>>>>>>> master
}
