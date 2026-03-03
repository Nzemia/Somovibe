import { unstable_cache } from "next/cache";
import { prisma } from "./prisma";

/**
 * CACHING STRATEGY:
 *
 * The approved PDFs list is PUBLIC data that rarely changes.
 * Cached for 60 seconds with tag-based invalidation via revalidateTag("marketplace-pdfs").
 */

type GetCachedApprovedPdfsParams = {
  take?: number;
  cursor?: string | null;
  search?: string;
  sort?: string;
  grades?: string[];
  subjects?: string[];
  materialTypes?: string[];
  minPrice?: number;
  maxPrice?: number;
  verifiedOnly?: boolean;
};

export const getCachedApprovedPdfs = unstable_cache(
  async ({
    take = 50,
    cursor = null,
    search = "",
    sort = "newest",
    grades = [],
    subjects = [],
    materialTypes = [],
    minPrice,
    maxPrice,
    verifiedOnly = false,
  }: GetCachedApprovedPdfsParams) => {
    const whereConditions: any[] = [{ status: "APPROVED" }];

    if (search.trim()) {
      whereConditions.push({
        OR: [
          { title: { contains: search.trim(), mode: "insensitive" } },
          { description: { contains: search.trim(), mode: "insensitive" } },
          { subject: { contains: search.trim(), mode: "insensitive" } },
          { grade: { contains: search.trim(), mode: "insensitive" } },
          { teacher: { name: { contains: search.trim(), mode: "insensitive" } } },
          { teacher: { email: { contains: search.trim(), mode: "insensitive" } } },
        ],
      });
    }

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

    if (subjects.length > 0) {
      whereConditions.push({ subject: { in: subjects } });
    }

    if (materialTypes.length > 0) {
      whereConditions.push({ materialType: { in: materialTypes } });
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceCondition: any = {};
      if (minPrice !== undefined) priceCondition.gte = minPrice;
      if (maxPrice !== undefined) priceCondition.lte = maxPrice;
      whereConditions.push({ price: priceCondition });
    }

    if (verifiedOnly) {
      whereConditions.push({
        teacher: { teacherProfile: { isActive: true } },
      });
    }

    const where =
      whereConditions.length > 1 ? { AND: whereConditions } : whereConditions[0];

    // Build orderBy — popular uses real purchase count via Prisma relation ordering
    let orderBy: any = { createdAt: "desc" };
    if (sort === "price-low")   orderBy = { price: "asc" };
    if (sort === "price-high")  orderBy = { price: "desc" };
    if (sort === "oldest")      orderBy = { createdAt: "asc" };
    if (sort === "newest")      orderBy = { createdAt: "desc" };
    if (sort === "popular")     orderBy = { purchases: { _count: "desc" } };
    // "rated" is sorted client-side after computing avg from review ratings

    const pdfs = await prisma.pdf.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        subject: true,
        grade: true,
        price: true,
        materialType: true,
        thumbnailUrl: true,
        createdAt: true,
        teacher: {
          select: {
            name: true,
            email: true,
            teacherProfile: {
              select: { isActive: true },
            },
          },
        },
        _count: {
          select: { purchases: true },
        },
        reviews: {
          select: { rating: true },
        },
      },
      orderBy,
      take: take + 1,
      ...(cursor && { skip: 1, cursor: { id: cursor } }),
    });

    const hasNextPage = pdfs.length > take;
    const items = pdfs.slice(0, take);

    return { items, hasNextPage, nextCursor: hasNextPage ? items[items.length - 1]?.id : null };
  },
  ["marketplace-pdfs"],
  { revalidate: 60, tags: ["marketplace-pdfs"] }
);

/**
 * Get user's purchased PDF IDs — dynamic (user-specific, never cached)
 */
export async function getUserPurchasedPdfIds(
  userId: string,
  pdfIds: string[]
): Promise<Set<string>> {
  if (!pdfIds.length) return new Set();
  const purchases = await prisma.purchase.findMany({
    where: { userId, pdfId: { in: pdfIds } },
    select: { pdfId: true },
  });
  return new Set(purchases.map((p) => p.pdfId));
}

export { revalidateTag } from "next/cache";
