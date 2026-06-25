import { prisma } from "@/lib/prisma";
import { requireAuth, handleAuthError } from "@/lib/apiAuth";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: postId } = await params;
    
    // 1. Authenticate user
    const user = await requireAuth();
    
    const { content, parentId } = await req.json();

    // 2. Validate input
    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 });
    }

    if (content.length > 1000) {
      return NextResponse.json({ error: "Comment must be under 1000 characters" }, { status: 400 });
    }

    // 3. Check rate limiting (Max 5 comments per user per post per hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const commentCount = await prisma.blogComment.count({
      where: {
        postId,
        authorId: user.id,
        createdAt: { gte: oneHourAgo },
      },
    });

    if (commentCount >= 5) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Maximum 5 comments per post per hour." },
        { status: 429 }
      );
    }

    // 4. Threaded reply check (limit to 1 level deep)
    let finalParentId: string | null = null;
    if (parentId) {
      const parentComment = await prisma.blogComment.findUnique({
        where: { id: parentId },
      });
      if (parentComment) {
        // Enforce 1 level depth: if the replied comment is already a reply (has parentId),
        // we attach this new reply to its parent instead.
        finalParentId = parentComment.parentId || parentComment.id;
      }
    }

    // 5. Create comment
    const comment = await prisma.blogComment.create({
      data: {
        content: content.trim(),
        postId,
        authorId: user.id,
        parentId: finalParentId,
      },
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
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Create comment API error:", error);
    return handleAuthError(error);
  }
}
