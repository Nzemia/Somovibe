<<<<<<< HEAD
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
=======
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { Navbar } from "@/components/Navbar"
import MarketplaceClient from "./MarketplaceClient"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Somovibe | Marketplace",
    description:
        "Discover quality CBC learning materials from verified teachers. Browse notes, schemes of work, lesson plans, and more for all grades.",
    openGraph: {
        title: "Somovibe Marketplace - Quality Learning Materials",
        description:
            "Browse and purchase quality learning materials from verified teachers",
        type: "website"
    }
}

export default async function Marketplace({
    searchParams
}: {
    searchParams: Promise<{
        material?: string
        teacher?: string
    }>
}) {
    const user = await getCurrentUser()
    const params = await searchParams

    const pdfs = await prisma.pdf.findMany({
        where: { status: "APPROVED" },
        include: {
            teacher: {
                select: {
                    id: true,
                    email: true
                }
            },
            _count: {
                select: {
                    downloads: true,
                    reviews: true
                }
            },
            reviews: {
                select: {
                    rating: true
                }
            }
        },
        orderBy: { createdAt: "desc" }
    })

    // Get user's purchases if logged in
    const userPurchases = user
        ? await prisma.purchase.findMany({
              where: { userId: user.id },
              select: { pdfId: true }
          })
        : []

    const purchasedPdfIds = new Set(
        userPurchases.map(p => p.pdfId)
    )

    return (
        <>
            <Navbar
                user={
                    user
                        ? {
                              email: user.email,
                              role: user.role
                          }
                        : null
                }
            />
            <div className="min-h-screen bg-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-foreground mb-2">
                            Marketplace
                        </h1>
                        <p className="text-muted-foreground">
                            Quality CBC learning materials
                            from verified teachers
                        </p>
                    </div>

                    {pdfs.length === 0 ? (
                        <div className="text-center py-16">
                            <svg
                                className="w-16 h-16 mx-auto text-muted-foreground mb-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                            <h3 className="text-xl font-semibold text-foreground mb-2">
                                No materials yet
                            </h3>
                            <p className="text-muted-foreground">
                                Check back soon for quality
                                learning materials!
                            </p>
                        </div>
                    ) : (
                        <MarketplaceClient
                            materials={pdfs}
                            purchasedIds={purchasedPdfIds}
                            user={
                                user
                                    ? {
                                          id: user.id,
                                          email: user.email,
                                          role: user.role,
                                          phone: user.phone
                                      }
                                    : null
                            }
                            highlightMaterialId={
                                params.material
                            }
                            filterTeacherId={params.teacher}
                        />
                    )}
                </div>
            </div>
        </>
    )
>>>>>>> master
}
