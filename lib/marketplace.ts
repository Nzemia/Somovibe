import { unstable_cache } from "next/cache";
import { prisma } from "./prisma";

/**
 * CACHING STRATEGY:
 * 
 * The approved PDFs list is PUBLIC data that rarely changes (only when admin approves new PDFs).
 * We cache this for 60 seconds using unstable_cache with tag-based invalidation.
 * 
 * This means:
 * - First request: Queries DB, caches result for 60 seconds
 * - Requests within 60s: Returns cached result (NO DB CALL)
 * - After 60s: Revalidates by querying DB again
 * - Admin approval: Can trigger revalidation via revalidateTag("marketplace-pdfs")
 * 
 * WHY THIS MAKES BACK NAVIGATION FAST:
 * When user returns to marketplace, instead of waiting for a fresh DB query,
 * they get the cached PDF list instantly. Pagination can still load new data dynamically.
 * 
 * PAGINATION:
 * We support cursor-based pagination to avoid overfetching.
 * Only load items needed for current page + next page preview.
 */

type GetCachedApprovedPdfsParams = {
  take?: number;
  cursor?: string | null;
  search?: string;
  sort?: string;
  grades?: string[];
  subjects?: string[];
  minPrice?: number;
  maxPrice?: number;
  verifiedOnly?: boolean;
};

export const getCachedApprovedPdfs = unstable_cache(
  async ({
    take = 12,
    cursor = null,
    search = "",
    sort = "newest",
    grades = [],
    subjects = [],
    minPrice,
    maxPrice,
    verifiedOnly = false,
  }: GetCachedApprovedPdfsParams) => {
    // Build where clause
    const whereConditions: any[] = [
      { status: "APPROVED" },
    ];

    // Search filter (title, description, or subject)
    if (search.trim()) {
      whereConditions.push({
        OR: [
          { title: { contains: search.trim(), mode: "insensitive" } },
          { description: { contains: search.trim(), mode: "insensitive" } },
          { subject: { contains: search.trim(), mode: "insensitive" } },
          { grade: { contains: search.trim(), mode: "insensitive" } },
        ],
      });
    }

    // Grade filter
    if (grades.length > 0) {
      const gradeConditions = grades.flatMap((gradeRange) => {
        if (gradeRange === "1-3") {
          return [
            { grade: { startsWith: "Grade 1" } },
            { grade: { startsWith: "Grade 2" } },
            { grade: { startsWith: "Grade 3" } },
          ];
        } else if (gradeRange === "4-6") {
          return [
            { grade: { startsWith: "Grade 4" } },
            { grade: { startsWith: "Grade 5" } },
            { grade: { startsWith: "Grade 6" } },
          ];
        } else if (gradeRange === "7-9") {
          return [
            { grade: { startsWith: "Grade 7" } },
            { grade: { startsWith: "Grade 8" } },
            { grade: { startsWith: "Grade 9" } },
          ];
        }
        return [];
      });
      
      if (gradeConditions.length > 0) {
        whereConditions.push({ OR: gradeConditions });
      }
    }

    // Subject filter
    if (subjects.length > 0) {
      whereConditions.push({ subject: { in: subjects } });
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceCondition: any = {};
      if (minPrice !== undefined) {
        priceCondition.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        priceCondition.lte = maxPrice;
      }
      whereConditions.push({ price: priceCondition });
    }

    // Verified only filter (requires teacher profile check)
    if (verifiedOnly) {
      whereConditions.push({
        teacher: {
          teacherProfile: {
            isActive: true,
          },
        },
      });
    }

    const where = whereConditions.length > 1 ? { AND: whereConditions } : whereConditions[0];

    // Build orderBy clause
    let orderBy: any = { createdAt: "desc" };
    if (sort === "price-low") {
      orderBy = { price: "asc" };
    } else if (sort === "price-high") {
      orderBy = { price: "desc" };
    } else if (sort === "newest") {
      orderBy = { createdAt: "desc" };
    } else if (sort === "popular" || sort === "rated") {
      // For now, fallback to newest since we don't have rating/popularity data yet
      orderBy = { createdAt: "desc" };
    }

    // Fetch one extra to determine if there's a next page
    const pdfs = await prisma.pdf.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        subject: true,
        grade: true,
        price: true,
        createdAt: true,
        teacher: {
          select: {
            email: true,
            teacherProfile: {
              select: {
                isActive: true,
              },
            },
          },
        },
      },
      orderBy,
      take: take + 1, // Fetch one extra to check hasNextPage
      ...(cursor && { skip: 1, cursor: { id: cursor } }),
    });

    const hasNextPage = pdfs.length > take;
    const items = pdfs.slice(0, take);

    return {
      items,
      hasNextPage,
      nextCursor: hasNextPage ? items[items.length - 1]?.id : null,
    };
  },
  ["marketplace-pdfs"], // Cache tag for revalidation
  {
    revalidate: 60, // Revalidate every 60 seconds
    tags: ["marketplace-pdfs"],
  }
);

/**
 * Get user's purchased PDF IDs (DYNAMIC - not cached)
 * 
 * We only query purchases for PDFs the user can see (filtered by pdfIds).
 * This is more efficient than fetching ALL purchases and checking membership.
 * 
 * This remains dynamic because it's user-specific data.
 * Executed only if user is logged in, so unauthenticated users don't trigger this.
 */
export async function getUserPurchasedPdfIds(
  userId: string,
  pdfIds: string[]
): Promise<Set<string>> {
  if (!pdfIds.length) return new Set();

  const purchases = await prisma.purchase.findMany({
    where: {
      userId,
      pdfId: { in: pdfIds },
    },
    select: { pdfId: true },
  });

  return new Set(purchases.map((p) => p.pdfId));
}

/**
 * Revalidate marketplace cache when needed (e.g., after admin approves a PDF)
 * Import this in your admin API routes:
 * 
 * import { revalidateTag } from "next/cache";
 * revalidateTag("marketplace-pdfs");
 */
export { revalidateTag } from "next/cache";
