import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { AdminNav } from "@/components/AdminNav";
import { BlogForm } from "../../BlogForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Post | Admin Dashboard",
};

export const dynamic = "force-dynamic";

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPostPage({ params }: EditPostPageProps) {
  // 1. Enforce Admin access
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/admin/unauthorized");
  }

  // 2. Fetch Blog Post details
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { id },
    include: {
      tags: {
        select: { name: true },
      },
    },
  });

  if (!post) {
    notFound();
  }

  // 3. Serialize dates for client components
  const serializedPost = {
    ...post,
    publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };

  return (
    <div>
      <AdminNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BlogForm initialData={serializedPost} isEdit={true} />
      </div>
    </div>
  );
}
