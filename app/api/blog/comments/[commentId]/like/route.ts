import { prisma } from "@/lib/prisma";
import { requireAuth, handleAuthError } from "@/lib/apiAuth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const { commentId } = await params;
    
    // 1. Authenticate user
    const user = await requireAuth();

    // 2. Verify comment exists
    const comment = await prisma.blogComment.findUnique({
      where: { id: commentId },
      select: { id: true, likes: true },
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // 3. Read 'liked_comments' cookie to see if they've already liked it
    const cookieStore = await cookies();
    const likedCookie = cookieStore.get("liked_comments")?.value;
    let likedCommentIds: string[] = [];

    if (likedCookie) {
      try {
        likedCommentIds = JSON.parse(likedCookie);
      } catch {
        likedCommentIds = [];
      }
    }

    const hasLiked = likedCommentIds.includes(commentId);
    let updatedLikes = comment.likes;

    // 4. Toggle: If liked, decrement and remove from cookie. If not, increment and add.
    if (hasLiked) {
      updatedLikes = Math.max(0, comment.likes - 1);
      await prisma.blogComment.update({
        where: { id: commentId },
        data: { likes: updatedLikes },
      });

      likedCommentIds = likedCommentIds.filter((id) => id !== commentId);
    } else {
      updatedLikes = comment.likes + 1;
      await prisma.blogComment.update({
        where: { id: commentId },
        data: { likes: updatedLikes },
      });

      likedCommentIds.push(commentId);
    }

    // 5. Save updated likes in cookie (valid for 30 days)
    cookieStore.set("liked_comments", JSON.stringify(likedCommentIds), {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return NextResponse.json({ likes: updatedLikes, liked: !hasLiked });
  } catch (error) {
    console.error("Toggle comment like API error:", error);
    return handleAuthError(error);
  }
}
