import { prisma } from "@/lib/prisma";
import { requireRole, handleAuthError } from "@/lib/apiAuth";
import { calculateReadingTime, generateBlogPostSlug } from "@/lib/blog-utils";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole("ADMIN");
    const { id } = await params;

    const post = await prisma.blogPost.findUnique({
      where: { id },
      include: { tags: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Admin get post API error:", error);
    return handleAuthError(error);
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole("ADMIN");
    const { id } = await params;
    
    const body = await req.json();
    const {
      title,
      excerpt,
      content,
      coverImage,
      coverImageAlt,
      tags = [], // Array of tag names e.g. ["CBC", "Grade 8"]
      published,
      publishedAt,
    } = body;

    // Fetch existing post
    const existingPost = await prisma.blogPost.findUnique({
      where: { id },
      include: { tags: true },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Validate inputs
    if (!title || !content || !excerpt) {
      return NextResponse.json(
        { error: "Title, excerpt, and content are required." },
        { status: 400 }
      );
    }

    // Recalculate reading time
    const readingTime = calculateReadingTime(content);

    // Determine slug (only change slug if title has changed)
    let slug = existingPost.slug;
    if (title !== existingPost.title) {
      let baseSlug = generateBlogPostSlug(title);
      if (!baseSlug) baseSlug = "post";
      slug = baseSlug;
      let counter = 1;
      while (true) {
        const duplicate = await prisma.blogPost.findFirst({
          where: {
            slug,
            id: { not: id },
          },
        });
        if (!duplicate) break;
        counter++;
        slug = `${baseSlug}-${counter}`;
      }
    }

    // Handle published date
    let parsedPublishedAt = existingPost.publishedAt;
    if (published && !existingPost.published) {
      // Transitioning from draft to published
      parsedPublishedAt = publishedAt ? new Date(publishedAt) : new Date();
    } else if (publishedAt) {
      // Explicit publishing date provided
      parsedPublishedAt = new Date(publishedAt);
    } else if (!published) {
      // Reverted to draft, clear publication time
      parsedPublishedAt = null;
    }

    // Connect/create new tags
    const tagConnectOrCreate = tags.map((tagName: string) => {
      const nameClean = tagName.trim();
      const slugClean = nameClean.toLowerCase().replace(/\s+/g, "-");
      return {
        where: { name: nameClean },
        create: { name: nameClean, slug: slugClean },
      };
    });

    // Update BlogPost (disconnect existing tags, connect new tags)
    const updatedPost = await prisma.blogPost.update({
      where: { id },
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
        tags: {
          set: [], // Disconnect all previous tags
          connectOrCreate: tagConnectOrCreate, // Connect new/existing tags
        },
      },
      include: {
        tags: true,
      },
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Admin update post API error:", error);
    return handleAuthError(error);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole("ADMIN");
    const { id } = await params;

    const existingPost = await prisma.blogPost.findUnique({
      where: { id },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Delete post - comments will cascade delete automatically
    await prisma.blogPost.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin delete post API error:", error);
    return handleAuthError(error);
  }
}
