import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // 1. Check if the post exists
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      select: { id: true, views: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // 2. Read 'viewed_posts' cookie to debounce view inflation
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

    // 3. If they haven't viewed this post recently, increment the view count
    if (!viewedSlugs.includes(slug)) {
      await prisma.blogPost.update({
        where: { slug },
        data: { views: { increment: 1 } },
      });
      
      viewedSlugs.push(slug);
      
      // Update cookie to expire in 24 hours
      cookieStore.set("viewed_posts", JSON.stringify(viewedSlugs), {
        maxAge: 60 * 60 * 24, // 24 hours
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });

      return NextResponse.json({ incremented: true, views: post.views + 1 });
    }

    return NextResponse.json({ incremented: false, views: post.views });
  } catch (error) {
    console.error("Increment view API error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
