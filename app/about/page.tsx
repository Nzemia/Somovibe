import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getCurrentUser } from "@/lib/auth";

export default async function AboutPage() {
    const user = await getCurrentUser();

    return (
        <>
            <Navbar user={user} />
            <div className="min-h-screen bg-background">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                            About <span className="text-primary">Questy</span>
                        </h1>
                        <p className="text-xl text-muted-foreground">
                            Empowering education through quality CBC learning materials
                        </p>
                    </div>

                    {/* Mission Section */}
                    <div className="bg-card border border-border rounded-lg p-8 mb-8">
                        <h2 className="text-2xl font-bold text-foreground mb-4">Our Mission</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Questy is dedicated to revolutionizing access to quality CBC learning materials in Kenya.
                            We connect verified teachers with students, creating a marketplace where knowledge is shared,
                            and educators are fairly compensated for their expertise.
                        </p>
                    </div>

                    {/* What We Do */}
                    <div className="bg-card border border-border rounded-lg p-8 mb-8">
                        <h2 className="text-2xl font-bold text-foreground mb-4">What We Do</h2>
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <svg className="w-6 h-6 text-primary mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <p className="text-muted-foreground">
                                    Provide students with affordable, high-quality CBC learning materials
                                </p>
                            </div>
                            <div className="flex items-start space-x-3">
                                <svg className="w-6 h-6 text-primary mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <p className="text-muted-foreground">
                                    Enable teachers to monetize their teaching materials and earn passive income
                                </p>
                            </div>
                            <div className="flex items-start space-x-3">
                                <svg className="w-6 h-6 text-primary mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <p className="text-muted-foreground">
                                    Ensure quality through a rigorous verification and approval process
                                </p>
                            </div>
                            <div className="flex items-start space-x-3">
                                <svg className="w-6 h-6 text-primary mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <p className="text-muted-foreground">
                                    Facilitate secure payments through M-Pesa integration
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* How It Works */}
                    <div className="bg-card border border-border rounded-lg p-8 mb-8">
                        <h2 className="text-2xl font-bold text-foreground mb-6">How It Works</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl font-bold text-primary">1</span>
                                </div>
                                <h3 className="font-semibold text-foreground mb-2">Teachers Upload</h3>
                                <p className="text-sm text-muted-foreground">
                                    Verified teachers upload quality CBC materials
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl font-bold text-primary">2</span>
                                </div>
                                <h3 className="font-semibold text-foreground mb-2">Admin Approves</h3>
                                <p className="text-sm text-muted-foreground">
                                    Our team reviews and approves quality content
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl font-bold text-primary">3</span>
                                </div>
                                <h3 className="font-semibold text-foreground mb-2">Students Learn</h3>
                                <p className="text-sm text-muted-foreground">
                                    Students purchase and access materials instantly
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Values */}
                    <div className="bg-card border border-border rounded-lg p-8">
                        <h2 className="text-2xl font-bold text-foreground mb-4">Our Values</h2>
                        <ul className="space-y-3 text-muted-foreground">
                            <li className="flex items-start space-x-2">
                                <span className="text-primary font-bold">•</span>
                                <span><strong className="text-foreground">Quality:</strong> We ensure all materials meet high educational standards</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <span className="text-primary font-bold">•</span>
                                <span><strong className="text-foreground">Fairness:</strong> Teachers receive 75% of every sale</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <span className="text-primary font-bold">•</span>
                                <span><strong className="text-foreground">Accessibility:</strong> Affordable pricing for all students</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <span className="text-primary font-bold">•</span>
                                <span><strong className="text-foreground">Security:</strong> Safe and reliable M-Pesa payments</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
