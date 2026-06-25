import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BlogForm } from "../BlogForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Post | Admin Dashboard",
};

export const dynamic = "force-dynamic";

export default async function NewBlogPostPage() {
  // 1. Enforce Admin access
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/admin/unauthorized");
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BlogForm />
      </div>
    </div>
  );
}
