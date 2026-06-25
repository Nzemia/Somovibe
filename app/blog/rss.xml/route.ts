import { Feed } from "feed";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Fetch published posts
    const posts = await prisma.blogPost.findMany({
      where: {
        published: true,
        publishedAt: { lte: new Date() },
      },
      orderBy: { publishedAt: "desc" },
      include: {
        author: {
          select: { name: true, email: true },
        },
      },
    });

    // 2. Initialize RSS Feed generator
    const feed = new Feed({
      title: "Somovibe Blog Feed",
      description: "Educational tips, classroom prep guides, and CBC resources from Somovibe.",
      id: "https://somovibe.com/blog",
      link: "https://somovibe.com/blog",
      language: "en-KE",
      image: "https://somovibe.com/logos/somovibe-favicon.png",
      favicon: "https://somovibe.com/favicon.png",
      copyright: `All rights reserved ${new Date().getFullYear()}, Somovibe`,
      updated: posts.length > 0 ? posts[0].publishedAt || posts[0].updatedAt : new Date(),
      generator: "Somovibe Blog Feed Generator",
      feedLinks: {
        rss: "https://somovibe.com/blog/rss.xml",
      },
      author: {
        name: "Somovibe Team",
        email: "support@somovibe.com",
        link: "https://somovibe.com",
      },
    });

    // 3. Add items to feed
    posts.forEach((post: any) => {
      feed.addItem({
        title: post.title,
        id: `https://somovibe.com/blog/${post.slug}`,
        link: `https://somovibe.com/blog/${post.slug}`,
        description: post.excerpt,
        content: post.content,
        author: [
          {
            name: post.author.name || "Somovibe Writer",
            email: post.author.email,
          },
        ],
        date: post.publishedAt || post.createdAt,
        image: post.coverImage || undefined,
      });
    });

    // 4. Return XML response
    return new Response(feed.rss2(), {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=18000",
      },
    });
  } catch (error) {
    console.error("RSS feed generation failed:", error);
    return new Response("<error>Failed to generate RSS feed</error>", {
      status: 500,
      headers: { "Content-Type": "application/xml" },
    });
  }
}
