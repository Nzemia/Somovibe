
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL || "";
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter } as any);

function generateSlug(title: string, grade: string, subject: string): string {
  const parts = [grade, subject, title];
  return parts
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);
}

async function main() {
  const pdfs = await prisma.pdf.findMany({
    where: { slug: null },
    select: { id: true, title: true, grade: true, subject: true },
  });

  console.log(`Found ${pdfs.length} records without a slug. Backfilling...`);

  const usedSlugs = new Set<string>();

  for (const pdf of pdfs) {
    let slug = generateSlug(pdf.title, pdf.grade, pdf.subject);

    // Ensure uniqueness within this run + against DB
    if (usedSlugs.has(slug)) {
      const suffix = Math.random().toString(36).slice(2, 7);
      slug = `${slug.slice(0, 110)}-${suffix}`;
    }
    usedSlugs.add(slug);

    try {
      await prisma.pdf.update({
        where: { id: pdf.id },
        data: { slug },
      });
      console.log(`  ✔ ${pdf.id} → ${slug}`);
    } catch {
      // Unique constraint violation — append random suffix
      const suffix = Math.random().toString(36).slice(2, 7);
      const fallbackSlug = `${slug.slice(0, 110)}-${suffix}`;
      await prisma.pdf.update({
        where: { id: pdf.id },
        data: { slug: fallbackSlug },
      });
      console.log(`  ✔ ${pdf.id} → ${fallbackSlug} (deduped)`);
    }
  }

  console.log("Done!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
