import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/ThemeProvider"
import { Toaster } from "sonner"
import { SessionProvider } from "next-auth/react"

export const metadata: Metadata = {
    title: {
        default: "Somovibe - CBC Learning Materials & Resources",
        template: "%s | Somovibe"
    },
    description:
        "Discover quality learning materials for CBC curriculum. Access comprehensive educational resources, lesson plans, schemes of work, and exam materials for all grades. Join Somovibe today!",
    keywords: [
        "Somovibe",
        "CBC learning materials",
        "Kenya education",
        "CBC curriculum",
        "teaching resources",
        "lesson plans",
        "schemes of work",
        "educational materials",
        "CBC resources"
    ],
    authors: [{ name: "Somovibe" }],
    creator: "Somovibe",
    publisher: "Somovibe",
    metadataBase: new URL("https://somovibe.com"),
    alternates: {
        canonical: "/"
    },
    openGraph: {
        type: "website",
        locale: "en_KE",
        url: "https://somovibe.com",
        siteName: "Somovibe",
        title: "Somovibe - Quality CBC Learning Materials & Resources",
        description:
            "Discover quality learning materials for CBC curriculum. Access comprehensive educational resources, lesson plans, schemes of work, and exam materials for all grades.",
        images: [
            {
                url: "/logos/somovibe-logo.png",
                width: 1200,
                height: 630,
                alt: "Somovibe - CBC Learning Platform"
            }
        ]
    },
    twitter: {
        card: "summary_large_image",
        title: "Somovibe - Quality CBC Learning Materials & Resources",
        description:
            "Discover quality learning materials for CBC curriculum. Access comprehensive educational resources for all grades.",
        images: ["/logos/somovibe-logo.png"]
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1
        }
    },
    verification: {
        google: "LVbxIFIxz_dT8jkWbYpQ6cnmH9GYZhhcYlIjPrYaKlA"
    }
}

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
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
            <body className="antialiased">
                <SessionProvider>
                    <ThemeProvider>
                        {children}
                        <Toaster
                            position="top-right"
                            richColors
                        />
                    </ThemeProvider>
                </SessionProvider>
            </body>
        </html>
    )
}
