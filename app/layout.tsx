<<<<<<< HEAD
import type { Metadata } from "next";
import { Geist, Geist_Mono, Oswald } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
=======
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/ThemeProvider"
import { Toaster } from "sonner"
import { SessionProvider } from "next-auth/react"
>>>>>>> master

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
<<<<<<< HEAD
  title: "Somovibe - CBC Learning Platform",
  description: "Quality CBC learning materials from verified teachers. Learn, teach, and earn with Somovibe — Kenya's premier educational marketplace.",
  icons: {
    icon: [
      { url: "/logos/Somovibe logo.png", type: "image/png" },
    ],
    apple: "/logos/Somovibe logo.png",
  },
  openGraph: {
    title: "Somovibe - CBC Learning Platform",
    description: "Quality CBC learning materials from verified teachers. Learn, teach, and earn.",
    type: "website",
  },
};
=======
    title: "Somovibe - CBC Learning Platform",
    description:
        "Quality learning materials for CBC curriculum",
    icons: {
        icon: "/somovibe-favicon.png",
        apple: "/somovibe-favicon.png",
    },
}
>>>>>>> master

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
<<<<<<< HEAD
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${oswald.variable} antialiased`}
      >
        <SessionProvider>
          <ThemeProvider>
            {children}
            <Toaster position="top-right" richColors />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
=======
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
>>>>>>> master
}
