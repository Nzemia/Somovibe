import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // 1. Fetch single post
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            name: true,
            email: true,
            image: true,
            role: true,
          },
        },
        tags: true,
        comments: {
          orderBy: { createdAt: "desc" },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
              },
            },
          },
        },
      },
    });

    // 2. Post verification
    if (!post || !post.published || (post.publishedAt && post.publishedAt > new Date())) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // 3. Debounce and increment view count
    const cookieStore = await cookies();
    const viewedCookie = cookieStore.get("viewed_posts")?.value;
    let viewedSlugs: string[] = [];

    if (viewedCookie) {
      try {
        viewedSlugs = JSON.parse(viewedCookie);
      } catch {
        viewedSlugs = [];
      }
    }

    let currentViews = post.views;
    if (!viewedSlugs.includes(slug)) {
      await prisma.blogPost.update({
        where: { slug },
        data: { views: { increment: 1 } },
      });
      currentViews += 1;
      viewedSlugs.push(slug);

      cookieStore.set("viewed_posts", JSON.stringify(viewedSlugs), {
        maxAge: 60 * 60 * 24, // 24 hours
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }

    // Return post details with updated views count
    return NextResponse.json({
      ...post,
      views: currentViews,
    });
  } catch (error) {
    console.error("Public get post details API error:", error);
    return NextResponse.json({ error: "Failed to fetch post details" }, { status: 500 });
  }
}
