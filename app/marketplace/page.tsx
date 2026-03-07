import { getCurrentUser } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { getCachedApprovedPdfs, getUserPurchasedPdfIds } from "@/lib/marketplace";
import { MarketplaceHeader } from "@/components/marketplace/MarketplaceHeader";
import { MarketplaceClientWrapper } from "@/components/marketplace/MarketplaceClientWrapper";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Marketplace - Browse CBC Learning Materials",
  description:
    "Browse our extensive collection of CBC learning materials. Find lesson plans, schemes of work, exam materials, and educational resources for all grades and subjects.",
  keywords: [
    "CBC materials marketplace",
    "learning resources Kenya",
    "teaching materials",
    "lesson plans",
    "schemes of work",
    "educational resources",
  ],
  openGraph: {
    title: "Marketplace - Browse CBC Learning Materials | Somovibe",
    description:
      "Browse our extensive collection of CBC learning materials for all grades and subjects.",
    type: "website",
  },
  alternates: {
    canonical: "/marketplace",
  },
};

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
  const sort = params.sort || "newest";
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
              <Link
                href={dashboardHref}
                className="flex items-center gap-2 text-white/70 hover:text-white text-sm font-semibold transition-colors group"
              >
                <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Back to Dashboard
              </Link>
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
