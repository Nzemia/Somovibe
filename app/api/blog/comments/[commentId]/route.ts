import { prisma } from "@/lib/prisma";
import { requireAuth, handleAuthError } from "@/lib/apiAuth";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const { commentId } = await params;
    
    // 1. Authenticate user
    const user = await requireAuth();

    // 2. Fetch comment along with its post details
    const comment = await prisma.blogComment.findUnique({
      where: { id: commentId },
      include: {
        post: {
          select: { authorId: true },
        },
      },
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // 3. Verify permissions:
    // - User is ADMIN
    // - User is the author of the post (can moderate discussions on their posts)
    // - User is the author of the comment (can delete their own comment)
    const isAdmin = user.role === "ADMIN";
    const isCommentAuthor = comment.authorId === user.id;
    const isPostAuthor = comment.post.authorId === user.id;

    if (!isAdmin && !isCommentAuthor && !isPostAuthor) {
      return NextResponse.json(
        { error: "You do not have permission to delete this comment" },
        { status: 403 }
      );
    }

    // 4. Delete comment
    await prisma.blogComment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete comment API error:", error);
    return handleAuthError(error);
  }
}
