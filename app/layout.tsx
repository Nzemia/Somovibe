import type { Metadata, Viewport } from "next"
import { Manrope } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/ThemeProvider"
import { Toaster } from "sonner"
import { SessionProvider } from "next-auth/react"
import { DevTools } from "@/components/DevTools"

const manrope = Manrope({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-manrope",
    weight: ["400", "700"],
})

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    themeColor: "#ffffff",
}

export const metadata: Metadata = {
    metadataBase: new URL("https://somovibe.com"),
    title: {
        default: "Somovibe - CBC Learning Platform",
        template: "%s | Somovibe",
    },
    description: "Quality learning materials for CBC curriculum",
    // Explicitly allow indexing so Next.js never inherits noindex from framework internals.
    // Individual pages that should NOT be indexed must override this themselves.
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
        },
    },
    // Point to the canonical HTTPS non-www version so Google doesn't treat
    // http://somovibe.com and http://www.somovibe.com as alternate pages.
    alternates: {
        canonical: "https://somovibe.com",
    },
    // Supply public/favicon.svg — SVG with an embedded <style> that switches
    // on prefers-color-scheme. Do not generate artwork here. app/favicon.ico
    // remains until that file exists.
    icons: {
        icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    },
    openGraph: {
        title: "Somovibe - CBC Learning Platform",
        description: "Quality learning materials for CBC curriculum",
        url: "https://somovibe.com",
        siteName: "Somovibe",
        type: "website",
        locale: "en_KE",
        images: [
            {
                url: "/og.png",
                width: 1200,
                height: 630,
                alt: "Somovibe",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        site: "@somovibe",
        title: "Somovibe - CBC Learning Platform",
        description: "Quality learning materials for CBC curriculum",
        images: ["/og.png"],
    },
}

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" className={manrope.variable} suppressHydrationWarning>
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
              (function() {
                const theme = localStorage.getItem('theme') || 
                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                document.documentElement.classList.toggle('dark', theme === 'dark');
              })();
            `
                    }}
                />
            </head>
            <body className="font-sans antialiased">
                <SessionProvider>
                    <ThemeProvider>
                        {children}
                        <Toaster
                            position="top-right"
                            richColors
                        />
                        <DevTools />
                    </ThemeProvider>
                </SessionProvider>
            </body>
        </html>
    )
}
