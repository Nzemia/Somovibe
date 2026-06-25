import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { QuickNav } from "@/components/QuickNav";
import { Footer } from "@/components/Footer";
import { ShareButtons } from "@/components/blog/ShareButtons";
import { SanitizedHTML } from "@/components/blog/SanitizedHTML";
import { BlogComments } from "@/components/blog/BlogComments";
import { ViewsCounter } from "@/components/blog/ViewsCounter";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Clock, Eye, MessageSquare, ArrowLeft, Calendar, User } from "lucide-react";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}

// Fallback gradient helper based on first tag
function getBlogFallbackGradient(tagName?: string): string {
  const name = tagName?.toLowerCase() || "";
  if (name.includes("cbc")) return "from-emerald-800 to-teal-950";
  if (name.includes("grade")) return "from-sky-800 to-indigo-950";
  if (name.includes("exam")) return "from-rose-800 to-red-950";
  if (name.includes("teach")) return "from-purple-800 to-fuchsia-950";
  if (name.includes("resource")) return "from-amber-800 to-orange-950";
  if (name.includes("news")) return "from-cyan-800 to-blue-950";
  return "from-green-900 via-emerald-950 to-[#021c0b]";
}

// Dynamic SEO metadata generator
export async function generateMetadata({ params, searchParams }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const search = await searchParams;
  const isPreview = search.preview === "true";

  // Fetch post metadata
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    select: { title: true, excerpt: true, coverImage: true, published: true },
  });

  if (!post) {
    return {
      title: "Post Not Found | Somovibe Blog",
    };
  }

  return {
    title: `${post.title} | Somovibe Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [{ url: post.coverImage }] : [],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}

export default async function BlogPostPage({ params, searchParams }: BlogPostPageProps) {
  const user = await getCurrentUser();
  const { slug } = await params;
  const search = await searchParams;
  const isPreview = search.preview === "true";

  // 1. Fetch Blog Post details
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: {
      author: {
        select: { id: true, name: true, email: true, image: true, role: true },
      },
      tags: true,
      comments: {
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: { id: true, name: true, email: true, image: true, role: true },
          },
        },
      },
    },
  });

  // 2. Perform Draft/Publish route guards
  if (!post) {
    notFound();
  }

  const isAdmin = user?.role === "ADMIN";
  const isPostAuthor = user && post.authorId === user.id;
  const isDraft = !post.published || (post.publishedAt && post.publishedAt > new Date());

  // Block guest users from viewing drafts, even if they guess the URL
  if (isDraft && !isPreview && !isAdmin && !isPostAuthor) {
    notFound();
  }

  // 3. Fetch Related Posts (up to 3, matching tags, falling back to latest published)
  const tagIds = post.tags.map((t: any) => t.id);
  const relatedPosts = await prisma.blogPost.findMany({
    where: {
      published: true,
      publishedAt: { lte: new Date() },
      id: { not: post.id },
      tags: {
        some: {
          id: { in: tagIds },
        },
      },
    },
    take: 3,
    include: {
      author: {
        select: { name: true, image: true },
      },
      tags: true,
      _count: {
        select: { comments: true },
      },
    },
  });

  // Fallback to recent posts if there are not enough tag-related posts
  if (relatedPosts.length < 3) {
    const excludedIds = [post.id, ...relatedPosts.map((r: any) => r.id)];
    const fallbackCount = 3 - relatedPosts.length;
    const fallbacks = await prisma.blogPost.findMany({
      where: {
        published: true,
        publishedAt: { lte: new Date() },
        id: { notIn: excludedIds },
      },
      orderBy: { publishedAt: "desc" },
      take: fallbackCount,
      include: {
        author: {
          select: { name: true, image: true },
        },
        tags: true,
        _count: {
          select: { comments: true },
        },
      },
    });
    relatedPosts.push(...fallbacks);
  }

  // 4. JSON-LD Article structured data for SEO rich results
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage || "https://somovibe.com/logos/somovibe-favicon.png",
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Person",
      name: post.author.name || "Somovibe Writer",
    },
    publisher: {
      "@type": "Organization",
      name: "Somovibe",
      logo: {
        "@type": "ImageObject",
        url: "https://somovibe.com/logos/somovibe-favicon.png",
      },
    },
  };

  // Serialize dates in related posts & comments for client components safety
  const serializedComments = post.comments.map((comment: any) => ({
    ...comment,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
  }));

  const userForComments = user
    ? {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
      }
    : null;

  return (
    <>
      {/* Dynamic SEO JSON-LD injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {/* Views count client trigger */}
      {!isPreview && <ViewsCounter slug={slug} />}

      <Navbar user={user ? { email: user.email, role: user.role } : null} />
      <QuickNav />

      <main className="min-h-screen bg-[#f5faf7] pb-16">
        {/* Cover Image / Gradient Header */}
        <section className="relative w-full h-[240px] sm:h-[360px] lg:h-[480px] overflow-hidden bg-gray-900 border-b border-[#d1e8dc]">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.coverImageAlt || post.title}
              fill
              priority
              className="object-cover"
            />
          ) : (
            <div
              className={`absolute inset-0 bg-gradient-to-br ${getBlogFallbackGradient(
                post.tags[0]?.name
              )} flex items-center justify-center`}
            >
              <div className="text-center text-white/10 select-none">
                <div className="text-7xl font-black uppercase tracking-wider">Somovibe</div>
                <div className="text-sm font-bold tracking-widest mt-2">CBC Learning Platform</div>
              </div>
            </div>
          )}
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </section>

        {/* Content Area container */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 relative">
          
          {/* Back link */}
          <div className="flex items-center justify-between">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#008c43] hover:text-[#006832] transition-colors group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              Back to Blog
            </Link>
            
            {/* Draft notice banner for admins/authors */}
            {isDraft && (
              <span className="bg-amber-100 border border-amber-200 text-amber-800 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm animate-pulse">
                Draft Preview Mode
              </span>
            )}
          </div>

          {/* Heading Details */}
          <div className="space-y-4">
            {/* Tag Badges list */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {post.tags.map((t: any) => (
                  <span
                    key={t.id}
                    className="px-3 py-1 bg-[#e0f2ea] text-[#004d25] rounded-full text-xs font-bold uppercase tracking-wider border border-[#d1e8dc]"
                  >
                    {t.name}
                  </span>
                ))}
              </div>
            )}

            {/* Post Title */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-tight">
              {post.title}
            </h1>

            {/* Meta Row details */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-500 pt-2 border-b border-gray-100 pb-5">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-[#008c43] to-[#00b856] text-white flex items-center justify-center font-extrabold text-sm shrink-0 border border-white shadow-sm">
                  {post.author.name?.[0]?.toUpperCase() || "S"}
                </span>
                <span className="text-gray-900">{post.author.name || "Somovibe Writer"}</span>
              </div>
              <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0" />
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                {format(new Date(post.publishedAt || post.createdAt), "dd MMMM yyyy")}
              </span>
              <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0" />
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                {post.readingTime} min read
              </span>
              <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0" />
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-gray-400" />
                {post.views} views
              </span>
              <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0" />
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                {serializedComments.length} comments
              </span>
            </div>
          </div>

          {/* Top Share Bar */}
          <div className="py-2 border-b border-gray-100 flex justify-between items-center flex-wrap gap-4">
            <ShareButtons title={post.title} />
          </div>

          {/* Sanitized HTML Post Content body */}
          <div className="bg-white px-6 sm:px-8 py-8 sm:py-10 border border-[#d1e8dc] rounded-3xl shadow-sm">
            <SanitizedHTML html={post.content} />
          </div>

          {/* Bottom Share Bar */}
          <div className="py-5 border-t border-b border-gray-100 flex items-center justify-between flex-wrap gap-4 mt-8">
            <span className="text-sm font-bold text-gray-700">Liked this article? Share it with others:</span>
            <ShareButtons title={post.title} />
          </div>

          {/* "You might also like" Related Posts section */}
          {relatedPosts.length > 0 && (
            <div className="space-y-6 pt-6">
              <h3 className="text-lg font-black text-gray-900 border-b border-gray-200 pb-2">
                You might also like
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((related: any) => (
                  <div
                    key={related.id}
                    className="bg-white border border-[#d1e8dc] rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow group"
                  >
                    <Link
                      href={`/blog/${related.slug}`}
                      className="relative aspect-[16/10] block overflow-hidden"
                    >
                      {related.coverImage ? (
                        <Image
                          src={related.coverImage}
                          alt={related.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${getBlogFallbackGradient(
                            related.tags[0]?.name
                          )} flex items-center justify-center`}
                        >
                          <span className="text-white/20 text-3xl font-extrabold select-none">
                            Somovibe
                          </span>
                        </div>
                      )}
                    </Link>
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <h4 className="font-extrabold text-gray-900 text-sm leading-snug line-clamp-2 h-10 hover:text-[#008c43] transition-colors">
                        <Link href={`/blog/${related.slug}`}>{related.title}</Link>
                      </h4>
                      <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 border-t border-gray-50 pt-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {related.readingTime} min
                        </span>
                        <span>{format(new Date(related.publishedAt || related.createdAt), "dd MMM yyyy")}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-gray-100 pt-8" />

          {/* Comments System Section */}
          <section id="comments">
            <BlogComments
              postId={post.id}
              postAuthorId={post.authorId}
              initialComments={serializedComments}
              currentUser={userForComments}
            />
          </section>
        </article>
      </main>

      <Footer />
    </>
  );
}
