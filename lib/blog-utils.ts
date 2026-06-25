/**
 * Calculates the reading time of an HTML content string.
 * Assumes average reading speed of 200 words per minute.
 */
export function calculateReadingTime(htmlContent: string): number {
  if (!htmlContent) return 1;
  // Strip HTML tags
  const text = htmlContent.replace(/<[^>]*>/g, "");
  const words = text.trim().split(/\s+/).filter((w) => w.length > 0);
  const minutes = Math.ceil(words.length / 200);
  return Math.max(1, minutes); // minimum 1 minute
}

/**
 * Generates a clean URL slug from a title string.
 */
export function generateBlogPostSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}
