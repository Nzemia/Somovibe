import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/cron/publish - Cron job endpoint to publish scheduled drafts
export async function GET(req: Request) {
  try {
    // 1. Basic security check: Validate Authorization header if CRON_SECRET is configured
    const authHeader = req.headers.get("authorization");
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    // 2. Find and update posts whose publication date has arrived but remain drafts
    const result = await prisma.blogPost.updateMany({
      where: {
        published: false,
        publishedAt: {
          lte: now,
          not: null,
        },
      },
      data: {
        published: true,
      },
    });

    return NextResponse.json({
      success: true,
      publishedCount: result.count,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("Cron publish job error:", error);
    return NextResponse.json({ error: "Failed to publish scheduled posts" }, { status: 500 });
  }
}
