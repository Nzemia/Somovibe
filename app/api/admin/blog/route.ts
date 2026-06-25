import { prisma } from "@/lib/prisma";
import { requireRole, handleAuthError } from "@/lib/apiAuth";
import { calculateReadingTime, generateBlogPostSlug } from "@/lib/blog-utils";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/admin/blog - List all posts (published + drafts) for Admin
export async function GET(req: Request) {
  try {
    await requireRole("ADMIN");

    const posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { name: true, email: true },
        },
        comments: {
          select: { id: true },
        },
        tags: true,
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Admin list posts API error:", error);
    return handleAuthError(error);
  }
}

// POST /api/admin/blog - Create a new blog post
export async function POST(req: Request) {
  try {
    const admin = await requireRole("ADMIN");
    
    const body = await req.json();
    const {
      title,
      excerpt,
      content,
      coverImage,
      coverImageAlt,
      tags = [], // Array of tag names e.g., ["CBC", "Grade 7"]
      published = false,
      publishedAt,
    } = body;

    // Validate required fields
    if (!title || !content || !excerpt) {
      return NextResponse.json(
        { error: "Title, excerpt, and content are required." },
        { status: 400 }
      );
    }

    // Auto-calculate reading time
    const readingTime = calculateReadingTime(content);

    // Generate unique slug
    let baseSlug = generateBlogPostSlug(title);
    if (!baseSlug) baseSlug = "post";
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const existing = await prisma.blogPost.findUnique({
        where: { slug },
      });
      if (!existing) break;
      counter++;
      slug = `${baseSlug}-${counter}`;
    }

    // Parse publishedAt
    let parsedPublishedAt: Date | null = null;
    if (published) {
      parsedPublishedAt = publishedAt ? new Date(publishedAt) : new Date();
    } else if (publishedAt) {
      // If it is scheduled in the future, published remains false until cron runs
      parsedPublishedAt = new Date(publishedAt);
    }

    // Connect/create tags
    const tagConnectOrCreate = tags.map((tagName: string) => {
      const nameClean = tagName.trim();
      const slugClean = nameClean.toLowerCase().replace(/\s+/g, "-");
      return {
        where: { name: nameClean },
        create: { name: nameClean, slug: slugClean },
      };
    });

    // Create BlogPost record
    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        excerpt: excerpt.substring(0, 160),
        content,
        coverImage,
        coverImageAlt,
        readingTime,
        published,
        publishedAt: parsedPublishedAt,
        authorId: admin.id,
        tags: {
          connectOrCreate: tagConnectOrCreate,
        },
      },
      include: {
        tags: true,
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Admin create post API error:", error);
    return handleAuthError(error);
  }
}
