import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { notFound } from "next/navigation";
import MaterialDetailClient from "./MaterialDetailClient";
import { Metadata } from "next";
import { getAverageRating, maskEmail } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const material = await prisma.pdf.findUnique({
    where: { id, status: "APPROVED" },
    select: { title: true, description: true, thumbnailUrl: true, subject: true, grade: true },
  });
  if (!material) return { title: "Material Not Found" };
  return {
    title: `${material.title} — ${material.subject} ${material.grade} | Somovibe`,
    description: material.description,
    openGraph: {
      title: material.title,
      description: material.description,
      images: material.thumbnailUrl ? [material.thumbnailUrl] : [],
      type: "website",
    },
  };
}

export default async function MaterialDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  const material = await prisma.pdf.findUnique({
    where: { id, status: "APPROVED" },
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

  if (!material) notFound();

  // Track view (async, don't await)
  prisma.materialView.create({
    data: { pdfId: material.id, userId: user?.id || null },
  }).catch(() => {});

  // Fetch related data in parallel
  const [purchase, moreFromTeacher, similarMaterials] = await Promise.all([
    user
      ? prisma.purchase.findUnique({ where: { userId_pdfId: { userId: user.id, pdfId: id } } })
      : null,
    prisma.pdf.findMany({
      where: { teacherId: material.teacherId, status: "APPROVED", NOT: { id } },
      select: {
        id: true, title: true, description: true, subject: true, grade: true,
        price: true, materialType: true, createdAt: true,
        teacher: { select: { email: true, teacherProfile: { select: { isActive: true } } } },
        _count: { select: { purchases: true } },
        reviews: { select: { rating: true } },
      },
      take: 4,
      orderBy: { purchases: { _count: "desc" } },
    }),
    prisma.pdf.findMany({
      where: {
        subject: material.subject, status: "APPROVED",
        NOT: [{ id }, { teacherId: material.teacherId }],
      },
      select: {
        id: true, title: true, description: true, subject: true, grade: true,
        price: true, materialType: true, createdAt: true,
        teacher: { select: { email: true, teacherProfile: { select: { isActive: true } } } },
        _count: { select: { purchases: true } },
        reviews: { select: { rating: true } },
      },
      take: 4,
      orderBy: { purchases: { _count: "desc" } },
    }),
  ]);

  return (
    <>
      <Navbar user={user ? { email: user.email, role: user.role } : null} />
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
