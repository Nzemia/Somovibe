import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

export default async function Home() {
  const user = await getCurrentUser();

  if (user) {
    if (user.role === "ADMIN") redirect("/admin");
    if (user.role === "TEACHER") redirect("/teacher");
    if (user.role === "STUDENT") redirect("/student");
  }

  return (
    <>
      <Navbar user={null} />
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Welcome to <span className="text-primary">Questy</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Quality CBC learning materials from verified teachers. Learn, teach, and earn.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/marketplace"
                className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Browse Materials
              </Link>
              <Link
                href="/teacher-register"
                className="px-8 py-4 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/80 transition-colors"
              >
                Become a Teacher
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* For Students */}
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <div className="mb-4">
                <svg className="w-12 h-12 mx-auto text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">For Students</h3>
              <p className="text-muted-foreground">
                Access quality CBC learning materials from verified teachers at affordable prices.
              </p>
            </div>

            {/* For Teachers */}
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <div className="mb-4">
                <svg className="w-12 h-12 mx-auto text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">For Teachers</h3>
              <p className="text-muted-foreground">
                Share your teaching materials and earn 75% of every sale. One-time KES 100 verification.
              </p>
            </div>

            {/* Secure Payments */}
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <div className="mb-4">
                <svg className="w-12 h-12 mx-auto text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Secure Payments</h3>
              <p className="text-muted-foreground">
                All transactions powered by M-Pesa. Safe, fast, and reliable payment processing.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-primary/10 border-y border-border py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to get started?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of students and teachers on Questy today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Sign Up Now
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 bg-card border border-border text-foreground rounded-lg font-semibold hover:bg-accent transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

