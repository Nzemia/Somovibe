import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminBlogTable } from "./AdminBlogTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog Management | Admin Dashboard",
};

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  // 1. Enforce Admin access
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/admin/unauthorized");
  }

  // 2. Fetch all posts
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: { name: true, email: true },
      },
      _count: {
        select: { comments: true },
      },
    },
  });

  // 3. Serialize prisma Dates into JSON strings for the client component
  const serializedPosts = posts.map((post: any) => ({
    ...post,
    publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  }));

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">
            Blog Management
          </h1>
          <p className="text-gray-500 text-sm mt-1.5">
            Publish educational articles, announcements, and CBC learning resources guides.
          </p>
        </div>

        {/* Blog management table */}
        <AdminBlogTable initialPosts={serializedPosts} />
      </div>
    </div>
  );
}
