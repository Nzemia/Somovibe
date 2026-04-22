export function generateSlug(title: string, grade: string, subject: string): string {
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

export function makeSlugUnique(slug: string): string {
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${slug.slice(0, 110)}-${suffix}`;
}
