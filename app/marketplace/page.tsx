import { getCurrentUser } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";
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
  }>;
}) {
  const params = await searchParams;
  const search = params.search || "";
  const sort = params.sort || "trending";
  const grades = Array.isArray(params.grade) ? params.grade : params.grade ? [params.grade] : [];
  const subjects = Array.isArray(params.subject) ? params.subject : params.subject ? [params.subject] : [];
  const materialTypes = Array.isArray(params.type) ? params.type : params.type ? [params.type] : [];
  const minPrice = params.minPrice ? parseInt(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? parseInt(params.maxPrice) : undefined;

  const [user, cachedPdfs] = await Promise.all([
    getCurrentUser(),
    getCachedApprovedPdfs({
      take: 50,
      cursor: null,
      search: "",
      sort: "trending",
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
  const dashboardHref =
    user?.role === "TEACHER" ? "/teacher"
    : user?.role === "STUDENT" ? "/student"
    : user?.role === "ADMIN" ? "/admin"
    : "/";

  return (
    <>
      <Navbar user={userForNavbar} />
      {user && (
        <div className="sticky top-14 z-40 border-b border-white/10 backdrop-blur-md"
          style={{ background: "linear-gradient(135deg, rgba(0,20,10,0.97) 0%, rgba(0,60,30,0.94) 50%, rgba(0,120,58,0.91) 100%)" }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-11">
              
            </div>
          </div>
        </div>
      )}
      <main className="min-h-screen bg-[#f5faf7]">
        <MarketplaceHeader userRole={user?.role ?? null} />
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
        />
      </main>
    </>
  );
}
