import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import MarketplaceClient from "./MarketplaceClient";

export default async function Marketplace() {
    const user = await getCurrentUser();

    const pdfs = await prisma.pdf.findMany({
        where: { status: "APPROVED" },
        include: {
            teacher: {
                select: {
                    email: true,
                },
            },
            _count: {
                select: {
                    downloads: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    // Get user's purchases if logged in
    const userPurchases = user
        ? await prisma.purchase.findMany({
            where: { userId: user.id },
            select: { pdfId: true },
        })
        : [];

    const purchasedPdfIds = new Set(userPurchases.map((p) => p.pdfId));

    return (
        <>
            <Navbar user={user ? { email: user.email, role: user.role } : null} />
            <div className="min-h-screen bg-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-foreground mb-2">Marketplace</h1>
                        <p className="text-muted-foreground">
                            Quality CBC learning materials from verified teachers
                        </p>
                    </div>

                    {pdfs.length === 0 ? (
                        <div className="text-center py-16">
                            <svg className="w-16 h-16 mx-auto text-muted-foreground mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="text-xl font-semibold text-foreground mb-2">No materials yet</h3>
                            <p className="text-muted-foreground">Check back soon for quality learning materials!</p>
                        </div>
                    ) : (
                        <MarketplaceClient
                            materials={pdfs}
                            purchasedIds={purchasedPdfIds}
                            user={user ? { id: user.id, email: user.email, role: user.role, phone: user.phone } : null}
                        />
                    )}
                </div>
            </div>
        </>
    );
}
