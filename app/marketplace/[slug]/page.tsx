import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Nav } from "@/components/Nav";
import { notFound, redirect } from "next/navigation";
import MaterialDetailClient from "./MaterialDetailClient";
import { Metadata } from "next";

/**
 * Looks up a material by slug first, then falls back to UUID.
 * If found by UUID, issues a 301 redirect to the canonical slug URL.
 */
async function findMaterial(slug: string) {
  // 1. Try slug lookup (canonical path)
  const bySlug = await prisma.pdf.findUnique({
    where: { slug, status: "APPROVED" },
    include: {
      teacher: {
        select: {
          id: true, name: true, email: true,
          teacherProfile: { select: { isActive: true } },
          _count: { select: { pdfs: true } },
        },
      },
      _count: { select: { downloads: true, reviews: true, purchases: true, materialViews: true } },
      reviews: {
        select: {
          id: true, rating: true, comment: true, reply: true,
          repliedAt: true, createdAt: true, userId: true,
          user: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (bySlug) return { material: bySlug, isUuidFallback: false };

  // 2. Fallback: try UUID lookup (old bookmarks / existing shares)
  const byId = await prisma.pdf.findUnique({
    where: { id: slug, status: "APPROVED" },
    select: { slug: true, id: true },
  });
  if (byId) return { material: null, isUuidFallback: true, canonicalSlug: byId.slug ?? byId.id };

  return { material: null, isUuidFallback: false };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  // Try slug then UUID
  const material = await prisma.pdf.findFirst({
    where: {
      OR: [{ slug }, { id: slug }],
      status: "APPROVED",
    },
    select: { title: true, description: true, thumbnailUrl: true, subject: true, grade: true },
  });

  if (!material) return { title: "Material Not Found" };
  return {
    title: `${material.title} — ${material.subject} ${material.grade} | Somovibe`,
    description: material.description,
    openGraph: {
      title: material.title,
      description: material.description ?? undefined,
      images: material.thumbnailUrl ? [material.thumbnailUrl] : [],
      type: "website",
    },
  };
}

export default async function MaterialDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ autoBuy?: string; phone?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const user = await getCurrentUser();

  const result = await findMaterial(slug);

  // UUID hit → 301 redirect to the slug URL, keep the buy ticket
  if (result.isUuidFallback && result.canonicalSlug) {
    const qs = new URLSearchParams();
    if (query.autoBuy) qs.set("autoBuy", query.autoBuy);
    if (query.phone) qs.set("phone", query.phone);
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    redirect(`/marketplace/${result.canonicalSlug}${suffix}`);
  }

  if (!result.material) notFound();

  const material = result.material;

  // Track view (async, don't await)
  prisma.materialView.create({
    data: { pdfId: material.id, userId: user?.id || null },
  }).catch(() => {});

  // Fetch related data in parallel
  const [purchase, moreFromTeacher, similarMaterials] = await Promise.all([
    user
      ? prisma.purchase.findUnique({ where: { userId_pdfId: { userId: user.id, pdfId: material.id } } })
      : null,
    prisma.pdf.findMany({
      where: { teacherId: material.teacherId, status: "APPROVED", NOT: { id: material.id } },
      select: {
        id: true, slug: true, title: true, description: true, subject: true, grade: true,
        price: true, materialType: true, createdAt: true, thumbnailUrl: true,
        teacher: { select: { name: true, email: true, teacherProfile: { select: { isActive: true } } } },
        _count: { select: { purchases: true } },
        reviews: { select: { rating: true } },
      },
      take: 4,
      orderBy: { purchases: { _count: "desc" } },
    }),
    prisma.pdf.findMany({
      where: {
        subject: material.subject, status: "APPROVED",
        NOT: [{ id: material.id }, { teacherId: material.teacherId }],
      },
      select: {
        id: true, slug: true, title: true, description: true, subject: true, grade: true,
        price: true, materialType: true, createdAt: true, thumbnailUrl: true,
        teacher: { select: { name: true, email: true, teacherProfile: { select: { isActive: true } } } },
        _count: { select: { purchases: true } },
        reviews: { select: { rating: true } },
      },
      take: 4,
      orderBy: { purchases: { _count: "desc" } },
    }),
  ]);

  return (
    <>
      <Nav user={user ? { email: user.email, role: user.role } : null} wave />
      <MaterialDetailClient
        material={material}
        isPurchased={!!purchase}
        user={user}
        moreFromTeacher={moreFromTeacher}
        similarMaterials={similarMaterials}
      />
    </>
  );
}
