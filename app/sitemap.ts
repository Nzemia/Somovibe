import { MetadataRoute } from "next";
import { CBC_SUBJECTS } from "@/lib/search-intelligence";
import { subjectSlug } from "@/lib/slug";
import { prisma } from "@/lib/prisma";

const BASE_URL = "https://somovibe.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Fetch all published blog posts dynamically
  let blogUrls: MetadataRoute.Sitemap = [];
  try {
    const blogPosts = await prisma.blogPost.findMany({
      where: {
        published: true,
        publishedAt: { lte: new Date() },
      },
      select: { slug: true, updatedAt: true },
    });

    blogUrls = blogPosts.map((post: any) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error("Sitemap blog query failed:", error);
  }

  // 2. Map CBC subjects pages
  const subjectUrls = CBC_SUBJECTS.map((subject) => ({
    url: `${BASE_URL}/subjects/${subjectSlug(subject)}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // 3. Assemble and return full sitemap
  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/marketplace`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...subjectUrls,
    ...blogUrls,
  ];
}
