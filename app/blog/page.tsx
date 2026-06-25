import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { QuickNav } from "@/components/QuickNav";
import { Footer } from "@/components/Footer";
import { BlogFilters } from "@/components/blog/BlogFilters";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Eye, MessageSquare, Clock, ArrowRight, BookOpen } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Somovibe Blog - Educational Insights & CBC Resources Guide",
  description:
    "Explore educational tips, trending news in Kenyan education, CBC guides, exam prep advice, and classroom resources for teachers, parents, and students.",
  openGraph: {
    title: "Somovibe Blog - Educational Insights & CBC Resources Guide",
    description:
      "Explore educational tips, trending news in Kenyan education, CBC guides, exam prep advice, and classroom resources.",
    url: "https://somovibe.com/blog",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

interface BlogPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    tag?: string;
    sort?: string;
  }>;
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

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const user = await getCurrentUser();

  // 1. Parse query params
  const params = await searchParams;
  const page = Math.max(1, Number(params.page || "1"));
  const search = params.search || "";
  const tag = params.tag || "";
  const sort = params.sort || "latest";
  const limit = 12;

  // 2. Fetch tags list
  const tagsList = await prisma.blogTag.findMany({
    orderBy: { name: "asc" },
  });

  // 3. Build query filters
  const where: any = {
    published: true,
    publishedAt: {
      lte: new Date(),
    },
  };

  if (tag) {
    where.tags = {
      some: {
        slug: tag.toLowerCase(),
      },
    };
  }

  if (search) {
    where.OR = [
      {
        title: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        excerpt: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  // 4. Build Sort Criteria
  let orderBy: any = { publishedAt: "desc" };
  if (sort === "oldest") {
    orderBy = { publishedAt: "asc" };
  } else if (sort === "views") {
    orderBy = { views: "desc" };
  }

  // 5. Fetch Featured Post (the most recent published post overall)
  // Only extract on page 1, with no active tag/search filters
  let featuredPost: any = null;
  const hasFilters = search !== "" || tag !== "";

  if (page === 1 && !hasFilters) {
    featuredPost = await prisma.blogPost.findFirst({
      where: {
        published: true,
        publishedAt: { lte: new Date() },
      },
      orderBy: { publishedAt: "desc" },
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
  }

  // If we have a featured post, we exclude it from the grid listing on page 1 to prevent duplication
  if (featuredPost) {
    where.id = { not: featuredPost.id };
  }


  const skip = (page - 1) * limit;

  // 6. Fetch Grid Posts & Total Count
  const [posts, totalCount] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        author: {
          select: { name: true, image: true },
        },
        tags: true,
        _count: {
          select: { comments: true },
        },
      },
    }),
    prisma.blogPost.count({ where }),
  ]);

  // Adjust total pages calculation
  const totalItems = totalCount + (featuredPost ? 1 : 0);
  const totalPages = Math.ceil(totalCount / limit);

  // Helper to build page link URLs
  const getPageLink = (pageNumber: number) => {
    const query = new URLSearchParams();
    if (search) query.set("search", search);
    if (tag) query.set("tag", tag);
    if (sort !== "latest") query.set("sort", sort);
    query.set("page", String(pageNumber));
    return `/blog?${query.toString()}`;
  };

  return (
    <>
      <Navbar user={user ? { email: user.email, role: user.role } : null} />
      <QuickNav />

      <main className="min-h-screen bg-[#f5faf7] pb-16">
        {/* Banner Title Header */}
        <section
          className="text-white py-12 sm:py-16 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, #00140a 0%, #003c1e 50%, #00783a 100%)",
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,184,86,0.15),transparent_40%)]" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <span className="inline-flex items-center gap-1.5 bg-white/10 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-white/15 mb-4">
              <BookOpen className="w-3.5 h-3.5" />
              Somovibe Blog
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
              Educational Insights & Guides
            </h1>
            <p className="text-white/70 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              Curated tips, curriculum updates, teacher guides, exam preparation hacks, and news mapping Kenya&apos;s CBC system.
            </p>
          </div>
        </section>

        {/* Filters and List content */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
          {/* Filters component */}
          <BlogFilters tags={tagsList} />

          {/* 1. Featured Post Hero Card (Only on Page 1 & No filters) */}
          {featuredPost && (
            <div className="bg-white rounded-3xl border border-[#d1e8dc] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* Image */}
                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="lg:col-span-7 relative block min-h-[260px] sm:min-h-[350px] lg:min-h-[440px] overflow-hidden group"
                >
                  {featuredPost.coverImage ? (
                    <Image
                      src={featuredPost.coverImage}
                      alt={featuredPost.coverImageAlt || featuredPost.title}
                      fill
                      priority
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${getBlogFallbackGradient(
                        featuredPost.tags[0]?.name
                      )} flex items-center justify-center`}
                    >
                      <span className="text-white/20 text-7xl font-extrabold select-none">
                        Somovibe
                      </span>
                    </div>
                  )}
                  {/* Topic badge */}
                  {featuredPost.tags.length > 0 && (
                    <div className="absolute top-4 left-4 flex flex-wrap gap-1">
                      {featuredPost.tags.slice(0, 2).map((t: any) => (
                        <span
                          key={t.id}
                          className="bg-white text-gray-900 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm"
                        >
                          {t.name}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>

                {/* Content */}
                <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
                  <div className="space-y-4">
                    {/* Meta Row */}
                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {featuredPost.readingTime} min read
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-gray-400" />
                        {featuredPost.views} views
                      </span>
                      {featuredPost._count.comments > 0 && (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                            {featuredPost._count.comments} comments
                          </span>
                        </>
                      )}
                    </div>

                    {/* Title */}
                    <Link href={`/blog/${featuredPost.slug}`} className="block group">
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 group-hover:text-[#008c43] transition-colors leading-snug">
                        {featuredPost.title}
                      </h2>
                    </Link>

                    {/* Excerpt */}
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {featuredPost.excerpt}
                    </p>
                  </div>

                  {/* Author / Date Footer */}
                  <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-6 lg:mt-0">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-full bg-gradient-to-br from-[#008c43] to-[#00b856] text-white flex items-center justify-center font-extrabold text-sm border-2 border-white shadow-sm shrink-0">
                        {featuredPost.author.name?.[0]?.toUpperCase() || "S"}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-gray-900">
                          {featuredPost.author.name || "Somovibe Writer"}
                        </div>
                        <div className="text-[10px] text-gray-500 font-semibold mt-0.5">
                          {format(new Date(featuredPost.publishedAt || featuredPost.createdAt), "dd MMMM yyyy")}
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/blog/${featuredPost.slug}`}
                      className="inline-flex items-center gap-1 px-4 py-2 text-xs font-bold text-[#008c43] hover:text-white border border-[#d1e8dc] hover:bg-[#008c43] rounded-xl transition-all"
                    >
                      Read Post
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Grid Header title (if featured post was shown) */}
          {featuredPost && posts.length > 0 && (
            <h3 className="text-lg font-black text-gray-900 border-b border-gray-200 pb-2">
              Recent Articles
            </h3>
          )}

          {/* 2. Grid Posts Listing */}
          {posts.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-[#d1e8dc] text-center shadow-sm max-w-lg mx-auto">
              <BookOpen className="w-12 h-12 text-[#5a7a68]/40 mx-auto mb-4" />
              <h4 className="text-gray-900 font-bold mb-1.5">No articles found</h4>
              <p className="text-gray-500 text-sm">
                We couldn&apos;t find any posts matching your search query or filters. Try adjusting your tags.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {posts.map((post: any) => (
                <div
                  key={post.id}
                  className="bg-white rounded-3xl border border-[#d1e8dc] overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
                >
                  {/* Card Media Header */}
                  <Link
                    href={`/blog/${post.slug}`}
                    className="relative aspect-[16/10] block overflow-hidden"
                  >
                    {post.coverImage ? (
                      <Image
                        src={post.coverImage}
                        alt={post.coverImageAlt || post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${getBlogFallbackGradient(
                          post.tags[0]?.name
                        )} flex items-center justify-center`}
                      >
                        <span className="text-white/20 text-5xl font-black select-none">
                          Somovibe
                        </span>
                      </div>
                    )}
                    {/* Floating Reading stats */}
                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readingTime} min
                    </div>
                  </Link>

                  {/* Card Content body */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      {/* Tags Badges & Views */}
                      <div className="flex items-center justify-between flex-wrap gap-2 text-[10px] font-bold text-gray-500">
                        {post.tags.length > 0 ? (
                          <span className="bg-[#e0f2ea] text-[#004d25] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            {post.tags[0].name}
                          </span>
                        ) : (
                          <span className="text-transparent">Tag</span>
                        )}
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-gray-400" />
                          {post.views}
                        </span>
                      </div>

                      {/* Title */}
                      <Link href={`/blog/${post.slug}`} className="block group/title">
                        <h4 className="font-extrabold text-gray-900 text-base leading-snug group-hover/title:text-[#008c43] line-clamp-2 h-11 transition-colors">
                          {post.title}
                        </h4>
                      </Link>

                      {/* Excerpt */}
                      <p className="text-gray-500 text-xs leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                    </div>

                    {/* Author & Footer Row */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-5">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-7 h-7 rounded-full bg-gradient-to-br from-[#008c43] to-[#00b856] text-white flex items-center justify-center font-extrabold text-xs shrink-0">
                          {post.author.name?.[0]?.toUpperCase() || "S"}
                        </span>
                        <div className="truncate text-[10px]">
                          <div className="font-bold text-gray-900 truncate">
                            {post.author.name || "Somovibe Writer"}
                          </div>
                          <div className="text-gray-400 font-semibold mt-0.5">
                            {format(new Date(post.publishedAt || post.createdAt), "dd MMM yyyy")}
                          </div>
                        </div>
                      </div>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="p-1.5 rounded-xl border border-gray-100 text-gray-500 group-hover:text-white group-hover:bg-[#008c43] group-hover:border-[#008c43] transition-all flex items-center justify-center"
                        title="Read Post"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 3. Pagination Links */}
          {totalPages > 1 && (
            <div className="pt-8">
              <Pagination>
                <PaginationContent>
                  {/* Previous */}
                  {page > 1 && (
                    <PaginationItem>
                      <PaginationPrevious href={getPageLink(page - 1)} />
                    </PaginationItem>
                  )}

                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNumber = i + 1;
                    const isActive = pageNumber === page;
                    
                    // Show a maximum of 5 page buttons surrounding current page
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      Math.abs(pageNumber - page) <= 1
                    ) {
                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationLink
                            href={getPageLink(pageNumber)}
                            isActive={isActive}
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }

                    // Show ellipses on limits
                    if (pageNumber === 2 || pageNumber === totalPages - 1) {
                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }

                    return null;
                  })}

                  {/* Next */}
                  {page < totalPages && (
                    <PaginationItem>
                      <PaginationNext href={getPageLink(page + 1)} />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
