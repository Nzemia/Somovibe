import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getCurrentUser } from "@/lib/auth";

export default async function TermsPage() {
    const user = await getCurrentUser();

    return (
        <>
            <Navbar user={user} />
            <div className="min-h-screen bg-background">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-8">
                        Terms of Service
                    </h1>

                    <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
                        <p className="text-muted-foreground">
                            Last updated: {new Date().toLocaleDateString()}
                        </p>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">1. Acceptance of Terms</h2>
                            <p className="text-muted-foreground">
                                By accessing and using Questy, you accept and agree to be bound by these Terms of Service.
                                If you do not agree to these terms, please do not use our platform.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">2. User Accounts</h2>
                            <p className="text-muted-foreground">
                                To use certain features, you must create an account. You are responsible for:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li>Maintaining the confidentiality of your account credentials</li>
                                <li>All activities that occur under your account</li>
                                <li>Notifying us immediately of any unauthorized use</li>
                                <li>Providing accurate and complete information</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">3. Teacher Verification</h2>
                            <p className="text-muted-foreground">
                                Teachers must pay a one-time verification fee of KES 100. This fee is non-refundable
                                and is used to verify the authenticity of teacher accounts and maintain platform quality.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">4. Content Guidelines</h2>
                            <p className="text-muted-foreground">
                                Teachers uploading materials must ensure:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li>Content is original or properly licensed</li>
                                <li>Materials are accurate and educationally sound</li>
                                <li>Content complies with CBC curriculum standards</li>
                                <li>No copyrighted material is uploaded without permission</li>
                                <li>Content is appropriate for the intended audience</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">5. Revenue Sharing</h2>
                            <p className="text-muted-foreground">
                                Teachers receive 75% of the sale price for each material sold. Questy retains 25%
                                to cover platform costs, payment processing, and maintenance. Payments are processed
                                through M-Pesa.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">6. Purchases and Refunds</h2>
                            <p className="text-muted-foreground">
                                All sales are final. Due to the digital nature of our products, we do not offer refunds
                                once a material has been downloaded. Please review material descriptions carefully before purchasing.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">7. Intellectual Property</h2>
                            <p className="text-muted-foreground">
                                Teachers retain ownership of their uploaded materials. By uploading, you grant Questy
                                a license to distribute and sell your materials on the platform. Students who purchase
                                materials receive a personal, non-transferable license for educational use only.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">8. Prohibited Activities</h2>
                            <p className="text-muted-foreground">
                                You may not:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li>Share purchased materials with others</li>
                                <li>Upload malicious or inappropriate content</li>
                                <li>Attempt to circumvent payment systems</li>
                                <li>Impersonate others or provide false information</li>
                                <li>Violate any applicable laws or regulations</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">9. Account Termination</h2>
                            <p className="text-muted-foreground">
                                We reserve the right to suspend or terminate accounts that violate these terms or
                                engage in fraudulent activity. Teachers may have materials removed if they fail to
                                meet quality standards.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">10. Limitation of Liability</h2>
                            <p className="text-muted-foreground">
                                Questy is provided "as is" without warranties. We are not liable for any indirect,
                                incidental, or consequential damages arising from your use of the platform.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">11. Changes to Terms</h2>
                            <p className="text-muted-foreground">
                                We may modify these terms at any time. Continued use of the platform after changes
                                constitutes acceptance of the new terms.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">12. Contact Information</h2>
                            <p className="text-muted-foreground">
                                For questions about these Terms of Service, contact us at:
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
