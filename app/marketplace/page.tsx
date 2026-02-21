import { getCurrentUser } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { getCachedApprovedPdfs, getUserPurchasedPdfIds } from "@/lib/marketplace";
import { MarketplaceHeader } from "@/components/marketplace/MarketplaceHeader";
import { MarketplaceClientWrapper } from "@/components/marketplace/MarketplaceClientWrapper";

export default async function Marketplace({
  searchParams,
}: {
  searchParams: Promise<{
    cursor?: string;
    search?: string;
    sort?: string;
    grade?: string | string[];
    subject?: string | string[];
    type?: string | string[];
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
  const materialTypes = Array.isArray(params.type) ? params.type : params.type ? [params.type] : [];
  const minPrice = params.minPrice ? parseInt(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? parseInt(params.maxPrice) : undefined;
  const verifiedOnly = params.verifiedOnly === "true";

  const [user, cachedPdfs] = await Promise.all([
    getCurrentUser(),
    getCachedApprovedPdfs({
      take: 50,
      cursor: null,
      // Server fetches all; client does the filtering for instant UX
      search: "",
      sort: "newest",
      grades: [],
      subjects: [],
      materialTypes: [],
      minPrice: undefined,
      maxPrice: undefined,
      verifiedOnly: false,
    }),
  ]);

  const purchasedPdfIds = user
    ? await getUserPurchasedPdfIds(user.id, cachedPdfs.items.map(p => p.id))
    : new Set<string>();

  const userForNavbar = user ? { email: user.email, role: user.role } : null;

  return (
    <>
      <Navbar user={userForNavbar} />
      <main className="min-h-screen bg-[#f5faf7]">
        <MarketplaceHeader />
        <MarketplaceClientWrapper
          initialPdfs={cachedPdfs.items}
          purchasedPdfIds={purchasedPdfIds}
          user={user}
          initialSearch={search}
          initialSort={sort}
          initialGrades={grades}
          initialSubjects={subjects}
          initialMaterialTypes={materialTypes}
          initialMinPrice={minPrice}
          initialMaxPrice={maxPrice}
          initialVerifiedOnly={verifiedOnly}
        />
      </main>
    </>
  );
}
