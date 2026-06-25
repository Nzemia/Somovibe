"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Edit, Trash, Globe, FileText, Plus, Eye, MessageSquare } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  views: number;
  author: {
    name: string | null;
    email: string;
  };
  _count: {
    comments: number;
  };
}

interface AdminBlogTableProps {
  initialPosts: BlogPost[];
}

export function AdminBlogTable({ initialPosts }: AdminBlogTableProps) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const togglePublish = async (id: string, currentPublished: boolean) => {
    try {
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Fetch existing fields to modify only published state
          ...posts.find((p) => p.id === id),
          published: !currentPublished,
          publishedAt: !currentPublished ? new Date().toISOString() : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update publish state");
      }

      const updated = await res.json();
      
      setPosts((prev) =>
        prev.map((post) =>
          post.id === id
            ? { ...post, published: updated.published, publishedAt: updated.publishedAt }
            : post
        )
      );

      toast.success(
        updated.published
          ? "Blog post published successfully!"
          : "Blog post reverted to draft."
      );
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update post status");
    }
  };

  const handleDelete = async () => {
    if (!postToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/blog/${postToDelete}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete post");
      }

      setPosts((prev) => prev.filter((p) => p.id !== postToDelete));
      toast.success("Blog post deleted successfully.");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to delete post");
    } finally {
      setIsDeleting(false);
      setPostToDelete(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#d1e8dc] overflow-hidden shadow-sm">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-5 border-b border-[#d1e8dc] gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">All Posts</h2>
          <p className="text-sm text-gray-500">Manage drafts and published educational content.</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-[#008c43] text-white text-sm font-bold rounded-xl hover:bg-[#006832] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Post
        </Link>
      </div>

      {/* Table Area */}
      {posts.length === 0 ? (
        <div className="p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-semibold mb-2">No blog posts found</p>
          <p className="text-gray-500 text-sm mb-5">Start writing and publishing content for Somovibe.</p>
          <Link
            href="/admin/blog/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#008c43] text-white text-sm font-semibold rounded-lg hover:bg-[#006832]"
          >
            Create Your First Post
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f0faf5] border-b border-[#d1e8dc] text-xs font-bold text-[#004d25] uppercase tracking-wider">
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Stats</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d1e8dc]">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50/50 transition-colors text-sm text-gray-700">
                  {/* Title */}
                  <td className="px-6 py-4 font-semibold text-gray-900 max-w-xs sm:max-w-md">
                    <div className="truncate" title={post.title}>
                      {post.title}
                    </div>
                    <div className="text-xs text-gray-500 font-normal mt-0.5 truncate max-w-xs">
                      Author: {post.author.name || post.author.email}
                    </div>
                  </td>
                  {/* Status Badge */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        post.published
                          ? "bg-green-100 text-green-800 border border-green-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${post.published ? "bg-green-600" : "bg-amber-600"}`} />
                      {post.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  {/* Date */}
                  <td className="px-6 py-4 text-xs font-medium text-gray-500">
                    {post.publishedAt ? (
                      <>
                        <div className="text-gray-800">Published:</div>
                        <div>{format(new Date(post.publishedAt), "dd MMM yyyy")}</div>
                      </>
                    ) : (
                      <>
                        <div>Created:</div>
                        <div>{format(new Date(post.createdAt), "dd MMM yyyy")}</div>
                      </>
                    )}
                  </td>
                  {/* Stats */}
                  <td className="px-6 py-4 font-medium">
                    <div className="flex flex-col gap-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {post.views} views
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {post._count.comments} comments
                      </span>
                    </div>
                  </td>
                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => togglePublish(post.id, post.published)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          post.published
                            ? "border-amber-200 text-amber-600 bg-amber-50 hover:bg-amber-100"
                            : "border-green-200 text-green-600 bg-green-50 hover:bg-green-100"
                        }`}
                        title={post.published ? "Revert to Draft" : "Publish Now"}
                      >
                        <Globe className="w-4 h-4" />
                      </button>
                      <Link
                        href={`/admin/blog/${post.id}/edit`}
                        className="p-1.5 rounded-lg border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 hover:text-gray-900 transition-colors"
                        title="Edit Post"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setPostToDelete(post.id)}
                        className="p-1.5 rounded-lg border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                        title="Delete Post"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!postToDelete} onOpenChange={(open) => !open && setPostToDelete(null)}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 font-extrabold">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500">
              This action cannot be undone. This will permanently delete the blog post and all comments associated with it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-200 text-gray-700 hover:bg-gray-50">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
