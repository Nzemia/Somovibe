import type { Metadata } from "next";
import { Geist, Geist_Mono, Oswald } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
        <Analytics />
      </body>
    </html>
  );
}
