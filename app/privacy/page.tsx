import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getCurrentUser } from "@/lib/auth";

export default async function PrivacyPage() {
    const user = await getCurrentUser();

    return (
        <>
            <Navbar user={user} />
            <div className="min-h-screen bg-background">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-8">
                        Privacy Policy
                    </h1>

                    <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
                        <p className="text-muted-foreground">
                            Last updated: {new Date().toLocaleDateString()}
                        </p>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">1. Information We Collect</h2>
                            <p className="text-muted-foreground">
                                We collect information you provide directly to us when you create an account,
                                upload materials, make purchases, or contact us. This includes:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li>Email address and password</li>
                                <li>Phone number for M-Pesa transactions</li>
                                <li>Payment information processed through M-Pesa</li>
                                <li>Educational materials you upload (for teachers)</li>
                                <li>Usage data and analytics</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">2. How We Use Your Information</h2>
                            <p className="text-muted-foreground">
                                We use the information we collect to:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li>Provide, maintain, and improve our services</li>
                                <li>Process transactions and send related information</li>
                                <li>Send you technical notices and support messages</li>
                                <li>Respond to your comments and questions</li>
                                <li>Monitor and analyze trends and usage</li>
                                <li>Detect and prevent fraud and abuse</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">3. Information Sharing</h2>
                            <p className="text-muted-foreground">
                                We do not sell your personal information. We may share your information only in the following circumstances:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li>With your consent</li>
                                <li>With service providers who assist in our operations (e.g., M-Pesa for payments)</li>
                                <li>To comply with legal obligations</li>
                                <li>To protect our rights and prevent fraud</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">4. Data Security</h2>
                            <p className="text-muted-foreground">
                                We implement appropriate security measures to protect your personal information.
                                However, no method of transmission over the internet is 100% secure, and we cannot
                                guarantee absolute security.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">5. Your Rights</h2>
                            <p className="text-muted-foreground">
                                You have the right to:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li>Access your personal information</li>
                                <li>Correct inaccurate information</li>
                                <li>Request deletion of your information</li>
                                <li>Object to processing of your information</li>
                                <li>Export your data</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">6. Cookies</h2>
                            <p className="text-muted-foreground">
                                We use cookies and similar technologies to provide and improve our services.
                                You can control cookies through your browser settings.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">7. Changes to This Policy</h2>
                            <p className="text-muted-foreground">
                                We may update this privacy policy from time to time. We will notify you of any
                                changes by posting the new policy on this page and updating the "Last updated" date.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">8. Contact Us</h2>
                            <p className="text-muted-foreground">
                                If you have any questions about this Privacy Policy, please contact us at:
                            </p>
                            <p className="text-muted-foreground">
                                Email: mualukofrank@gmail.com
                            </p>
                        </section>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
