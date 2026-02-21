import { getCurrentUser } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { getCachedApprovedPdfs, getUserPurchasedPdfIds } from "@/lib/marketplace";
import { MarketplaceHeader } from "@/components/marketplace/MarketplaceHeader";
import { MarketplaceClientWrapper } from "@/components/marketplace/MarketplaceClientWrapper";

/**
 * PERFORMANCE OPTIMIZATIONS:
 * 
 * 1. CACHING: The approved PDFs list is cached for 60 seconds using unstable_cache.
 * 2. OPTIMISTIC UI: Load larger batch (50 PDFs) for client-side instant filtering
 * 3. CLIENT-SIDE FILTERING: Instant filtering/search without server round-trips
 * 4. BACKGROUND SYNC: URL updates happen in background, non-blocking
 */

export default async function Marketplace({
    searchParams,
}: {
    searchParams: Promise<{
        cursor?: string;
        search?: string;
        sort?: string;
        grade?: string | string[];
        subject?: string | string[];
        minPrice?: string;
        maxPrice?: string;
        verifiedOnly?: string;
    }>;
}) {
    const params = await searchParams;
    const search = params.search || "";
    const sort = params.sort || "newest";
    const grades = Array.isArray(params.grade) ? params.grade : params.grade ? [params.grade] : [];
    const subjects = Array.isArray(params.subject) ? params.subject : params.subject ? [params.subject] : [];
    const minPrice = params.minPrice ? parseInt(params.minPrice) : undefined;
    const maxPrice = params.maxPrice ? parseInt(params.maxPrice) : undefined;
    const verifiedOnly = params.verifiedOnly === "true";
    
    // Load larger batch for optimistic UI (50 instead of 12)
    const INITIAL_BATCH_SIZE = 50;

    // Fetch these in parallel for maximum speed
    const [user, cachedPdfs] = await Promise.all([
        getCurrentUser(),
        getCachedApprovedPdfs({
            take: INITIAL_BATCH_SIZE,
            cursor: null, // Load first batch
            search: "", // Don't filter on server - let client do it
            sort: "newest", // Default sort, client will re-sort
            grades: [],
            subjects: [],
            minPrice: undefined,
            maxPrice: undefined,
            verifiedOnly: false,
        }),
    ]);

    // Get purchases for visible PDFs only
    const purchasedPdfIds = user
        ? await getUserPurchasedPdfIds(
            user.id,
            cachedPdfs.items.map((p) => p.id)
        )
        : new Set<string>();

    const userForNavbar = user ? { email: user.email, role: user.role } : null;

    return (
        <>
            <Navbar user={userForNavbar} />
            <main className="min-h-screen bg-slate-50">
                <MarketplaceHeader />
                <MarketplaceClientWrapper
                    initialPdfs={cachedPdfs.items}
                    purchasedPdfIds={purchasedPdfIds}
                    user={user}
                    initialSearch={search}
                    initialSort={sort}
                    initialGrades={grades}
                    initialSubjects={subjects}
                    initialMinPrice={minPrice}
                    initialMaxPrice={maxPrice}
                    initialVerifiedOnly={verifiedOnly}
                />
            </main>
        </>
    );
}
