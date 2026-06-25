"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  ThumbsUp,
  MessageSquare,
  Trash2,
  CornerDownRight,
  Lock,
  MessageCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
}

interface Comment {
  id: string;
  content: string;
  likes: number;
  createdAt: string;
  parentId: string | null;
  authorId: string;
  author: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    role: string;
  };
}

interface BlogCommentsProps {
  postId: string;
  postAuthorId: string;
  initialComments: Comment[];
  currentUser: User | null;
}

export function BlogComments({
  postId,
  postAuthorId,
  initialComments,
  currentUser,
}: BlogCommentsProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [content, setContent] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"newest" | "likes">("newest");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  
  // Track liked comment IDs locally (using localStorage or cookies)
  const [localLikes, setLocalLikes] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const cookies = document.cookie.split(";");
        const likeCookie = cookies.find((c) => c.trim().startsWith("liked_comments="));
        if (likeCookie) {
          const val = decodeURIComponent(likeCookie.trim().split("=")[1]);
          return JSON.parse(val);
        }
      } catch {}
    }
    return [];
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sorting logic
  const parentComments = comments.filter((c) => c.parentId === null);
  const repliesMap = comments.filter((c) => c.parentId !== null);

  const sortedParents = [...parentComments].sort((a, b) => {
    if (sortOrder === "likes") {
      return b.likes - a.likes || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const getRepliesForParent = (parentId: string) => {
    return repliesMap
      .filter((r) => r.parentId === parentId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  };

  // Login check redirect helper
  const triggerLoginGate = () => {
    if (!currentUser) {
      setShowLoginModal(true);
      return true;
    }
    return false;
  };

  // Add a parent comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (triggerLoginGate()) return;
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/blog/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit comment");
      }

      const newComment = await res.json();
      setComments((prev) => [newComment, ...prev]);
      setContent("");
      toast.success("Comment posted successfully.");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to submit comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add a reply
  const handleSubmitReply = async (parentId: string) => {
    if (triggerLoginGate()) return;
    if (!replyContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/blog/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyContent, parentId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit reply");
      }

      const newReply = await res.json();
      setComments((prev) => [...prev, newReply]);
      setReplyContent("");
      setActiveReplyId(null);
      toast.success("Reply posted successfully.");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to submit reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Comment Like
  const handleLike = async (commentId: string) => {
    if (triggerLoginGate()) return;

    try {
      const res = await fetch(`/api/blog/comments/${commentId}/like`, {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to toggle like");
      }

      const data = await res.json();
      
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, likes: data.likes } : c))
      );

      setLocalLikes((prev) => {
        const next = data.liked ? [...prev, commentId] : prev.filter((id) => id !== commentId);
        return next;
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to toggle like. Try again.");
    }
  };

  // Delete Comment
  const handleDeleteComment = async (commentId: string) => {
    try {
      const res = await fetch(`/api/blog/comments/${commentId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete comment");
      }

      // Filter out deleted comment and all its replies
      setComments((prev) => prev.filter((c) => c.id !== commentId && c.parentId !== commentId));
      toast.success("Comment deleted successfully.");
      setCommentToDelete(null);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to delete comment");
    }
  };

  const getRoleBadge = (role: string) => {
    if (role === "ADMIN") return "Admin 👑";
    if (role === "TEACHER") return "Teacher ✓";
    return "Student";
  };

  // Build login link
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
  const loginLink = `/login?callbackUrl=${encodeURIComponent(currentPath)}`;
  const registerLink = `/register?callbackUrl=${encodeURIComponent(currentPath)}`;

  return (
    <div className="space-y-8">
      {/* Comments Header & Sorting */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-[#008c43]" />
          {comments.length} Comment{comments.length !== 1 && "s"}
        </h3>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as "newest" | "likes")}
          className="text-xs font-semibold text-gray-500 bg-transparent border-0 focus:ring-0 cursor-pointer"
        >
          <option value="newest">Newest First</option>
          <option value="likes">Most Liked</option>
        </select>
      </div>

      {/* Main Comment Form */}
      <form onSubmit={handleSubmitComment} className="space-y-3">
        <textarea
          rows={3}
          maxLength={1000}
          placeholder={
            currentUser
              ? "Share your thoughts on this educational topic..."
              : "Log in to join the conversation and comment..."
          }
          value={content}
          onClick={() => !currentUser && setShowLoginModal(true)}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-4 py-3 border border-[#d1e8dc] rounded-2xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008c43] bg-white resize-none"
        />
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-gray-400 font-medium">
            {content.length}/1000 characters
          </span>
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="px-5 py-2 bg-[#008c43] text-white text-xs font-bold rounded-xl hover:bg-[#006832] disabled:opacity-50 transition-colors shadow-sm"
          >
            Post Comment
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-6">
        {sortedParents.map((comment) => {
          const replies = getRepliesForParent(comment.id);
          const isLiked = localLikes.includes(comment.id);
          
          const isAllowedToDelete =
            currentUser &&
            (currentUser.role === "ADMIN" ||
              comment.authorId === currentUser.id ||
              postAuthorId === currentUser.id);

          return (
            <div key={comment.id} className="space-y-4">
              {/* Parent Comment Card */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative group">
                <div className="flex items-start justify-between gap-4">
                  {/* Author Meta */}
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-full bg-gradient-to-br from-[#008c43] to-[#00b856] text-white flex items-center justify-center font-extrabold text-sm shrink-0">
                      {comment.author.name?.[0]?.toUpperCase() || "S"}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-gray-900">
                          {comment.author.name || "Somovibe User"}
                        </span>
                        <span
                          className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${
                            comment.author.role === "ADMIN"
                              ? "bg-red-50 text-red-700 border border-red-100"
                              : comment.author.role === "TEACHER"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : "bg-blue-50 text-blue-700 border border-blue-100"
                          }`}
                        >
                          {getRoleBadge(comment.author.role)}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5 font-medium">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>

                  {/* Actions (Delete icon) */}
                  {isAllowedToDelete && (
                    <button
                      onClick={() => setCommentToDelete(comment.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors p-1"
                      title="Delete Comment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Comment Content */}
                <p className="text-gray-700 text-sm leading-relaxed mt-3 whitespace-pre-wrap">
                  {comment.content}
                </p>

                {/* Interaction row */}
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-50 text-xs font-semibold text-gray-500 select-none">
                  <button
                    onClick={() => handleLike(comment.id)}
                    className={`flex items-center gap-1 transition-colors ${
                      isLiked ? "text-[#008c43] font-bold" : "hover:text-gray-900"
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? "fill-current" : ""}`} />
                    {comment.likes} Like{comment.likes !== 1 && "s"}
                  </button>
                  <button
                    onClick={() =>
                      currentUser
                        ? setActiveReplyId(activeReplyId === comment.id ? null : comment.id)
                        : setShowLoginModal(true)
                    }
                    className="flex items-center gap-1 hover:text-gray-900"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Reply
                  </button>
                </div>

                {/* Reply Form (nested inside card if active) */}
                {activeReplyId === comment.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                    <div className="flex gap-2">
                      <CornerDownRight className="w-4 h-4 text-gray-400 shrink-0 mt-2.5" />
                      <textarea
                        rows={2}
                        maxLength={1000}
                        placeholder={`Reply to ${comment.author.name || "user"}...`}
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008c43] bg-white resize-none"
                      />
                    </div>
                    <div className="flex items-center justify-end gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveReplyId(null);
                          setReplyContent("");
                        }}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSubmitReply(comment.id)}
                        disabled={isSubmitting || !replyContent.trim()}
                        className="px-4 py-1.5 bg-[#008c43] text-white font-bold rounded-lg hover:bg-[#006832] disabled:opacity-50"
                      >
                        Post Reply
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Nested Replies List (1 level deep) */}
              {replies.length > 0 && (
                <div className="pl-6 sm:pl-10 space-y-3">
                  {replies.map((reply) => {
                    const isReplyLiked = localLikes.includes(reply.id);
                    const isReplyAllowedToDelete =
                      currentUser &&
                      (currentUser.role === "ADMIN" ||
                        reply.authorId === currentUser.id ||
                        postAuthorId === currentUser.id);

                    return (
                      <div
                        key={reply.id}
                        className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 shadow-sm relative group flex items-start gap-3"
                      >
                        <CornerDownRight className="w-4 h-4 text-gray-400 shrink-0 mt-1" />
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <span className="w-7 h-7 rounded-full bg-gradient-to-br from-[#008c43] to-[#00b856] text-white flex items-center justify-center font-extrabold text-[10px] shrink-0">
                                {reply.author.name?.[0]?.toUpperCase() || "S"}
                              </span>
                              <div>
                                <div className="flex items-center gap-1 flex-wrap">
                                  <span className="text-xs font-bold text-gray-900">
                                    {reply.author.name || "Somovibe User"}
                                  </span>
                                  <span
                                    className={`text-[8px] font-black px-1.5 py-0.5 rounded-md ${
                                      reply.author.role === "ADMIN"
                                        ? "bg-red-50 text-red-700"
                                        : reply.author.role === "TEACHER"
                                        ? "bg-emerald-50 text-emerald-700"
                                        : "bg-blue-50 text-blue-700"
                                    }`}
                                  >
                                    {getRoleBadge(reply.author.role)}
                                  </span>
                                </div>
                                <div className="text-[9px] text-gray-400 font-medium">
                                  {formatDistanceToNow(new Date(reply.createdAt), {
                                    addSuffix: true,
                                  })}
                                </div>
                              </div>
                            </div>

                            {isReplyAllowedToDelete && (
                              <button
                                onClick={() => setCommentToDelete(reply.id)}
                                className="text-gray-400 hover:text-red-600 transition-colors p-1"
                                title="Delete Reply"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <p className="text-gray-700 text-xs leading-relaxed whitespace-pre-wrap">
                            {reply.content}
                          </p>

                          <div className="flex items-center gap-3 text-[10px] font-semibold text-gray-500 select-none pt-1">
                            <button
                              onClick={() => handleLike(reply.id)}
                              className={`flex items-center gap-1 transition-colors ${
                                isReplyLiked ? "text-[#008c43] font-bold" : "hover:text-gray-900"
                              }`}
                            >
                              <ThumbsUp className={`w-3 h-3 ${isReplyLiked ? "fill-current" : ""}`} />
                              {reply.likes} Like{reply.likes !== 1 && "s"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Guest Login Modal prompt */}
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="max-w-md bg-white p-6 rounded-3xl border border-gray-100">
          <DialogHeader className="text-center flex flex-col items-center">
            <div className="w-12 h-12 bg-[#f0faf5] text-[#008c43] rounded-full flex items-center justify-center mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <DialogTitle className="text-lg font-black text-gray-900">
              Join the conversation
            </DialogTitle>
            <p className="text-gray-500 text-xs leading-relaxed mt-2">
              You need to be logged in to comment on this educational post. Sign in or register to share your thoughts.
            </p>
          </DialogHeader>
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <a
              href={loginLink}
              className="flex-1 text-center py-2.5 bg-[#008c43] hover:bg-[#006832] text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
            >
              Log In
            </a>
            <a
              href={registerLink}
              className="flex-1 text-center py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl transition-colors"
            >
              Create Account
            </a>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <Dialog open={!!commentToDelete} onOpenChange={(open) => !open && setCommentToDelete(null)}>
        <DialogContent className="max-w-sm bg-white p-5 rounded-2xl border border-gray-100">
          <DialogHeader>
            <DialogTitle className="text-gray-900 font-extrabold">Delete Comment?</DialogTitle>
            <p className="text-gray-500 text-xs leading-relaxed mt-1">
              Are you sure you want to delete this comment? If this is a parent comment, all of its nested replies will be deleted too.
            </p>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4 text-xs font-semibold">
            <button
              onClick={() => setCommentToDelete(null)}
              className="px-3.5 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => commentToDelete && handleDeleteComment(commentToDelete)}
              className="px-3.5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
