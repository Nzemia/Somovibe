import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/blog - Fetch all published blog posts with pagination, search, and tag filters
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const limit = Math.max(1, Number(searchParams.get("limit") || "12"));
    const search = searchParams.get("search") || "";
    const tag = searchParams.get("tag") || "";
    const sort = searchParams.get("sort") || "latest";

    // 1. Build Query Filters
    const where: any = {
      published: true,
      // Only return posts whose published date is in the past (handles scheduled publishing)
      publishedAt: {
        lte: new Date(),
      },
    };

    if (tag) {
      where.tags = {
        some: {
          slug: tag.toLowerCase(),
        },
      };
    }

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          excerpt: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    // 2. Build Sort Criteria
    let orderBy: any = { publishedAt: "desc" };
    if (sort === "oldest") {
      orderBy = { publishedAt: "asc" };
    } else if (sort === "views") {
      orderBy = { views: "desc" };
    }

    // 3. Query DB
    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          author: {
            select: {
              name: true,
              email: true,
              image: true,
            },
          },
          tags: true,
          _count: {
            select: { comments: true },
          },
        },
      }),
      prisma.blogPost.count({ where }),
    ]);

    return NextResponse.json({
      posts,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Public fetch blog posts API error:", error);
    return NextResponse.json({ error: "Failed to fetch blog posts" }, { status: 500 });
  }
}
