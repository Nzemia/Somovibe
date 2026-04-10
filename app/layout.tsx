import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/ThemeProvider"
import { Toaster } from "sonner"
import { SessionProvider } from "next-auth/react"

export const metadata: Metadata = {
    title: "Somovibe - CBC Learning Platform",
    description:
        "Quality learning materials for CBC curriculum"
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
