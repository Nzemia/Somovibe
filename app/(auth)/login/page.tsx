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

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError("")

        const result = await signIn("credentials", {
            email,
            password,
            redirect: false
        })

        if (result?.error) {
            setError("Invalid email or password")
            setLoading(false)
        } else {
            router.push("/")
            router.refresh()
        }
    }

    async function handleOAuthLogin(
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
                    Welcome Back
                </h1>
                <p className="text-muted-foreground">
                    Sign in to continue to Somovibe
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
                    onSubmit={handleLogin}
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
                            placeholder="you@example.com"
                            value={email}
                            onChange={e =>
                                setEmail(e.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="password"
                            className="text-sm font-medium text-foreground"
                        >
                            Password
                        </label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={e =>
                                setPassword(e.target.value)
                            }
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full"
                        size="lg"
                    >
                        {loading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            "Sign In"
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
                    onClick={() => handleOAuthLogin("google")}
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
                            New to Somovibe?
                        </span>
                    </div>
                </div>

                <Link href="/register" className="block">
                    <Button
                        variant="outline"
                        className="w-full"
                        size="lg"
                    >
                        Create an Account
                    </Button>
                </Link>
            </div>
        </div>
    )
}
