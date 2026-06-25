import sharp from "sharp";

/**
 * Resizes and compresses a blog cover image file into an optimized WebP buffer.
 * Enforces a 16:9 aspect ratio (1200x675) suitable for social sharing and desktop cards.
 * This is server-only because it imports 'sharp', which uses native child_process / fs.
 */
export async function compressBlogPostImage(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return sharp(buffer)
    .resize(1200, 675, {
      fit: "cover",
      position: "centre",
    })
    .webp({ quality: 80 })
    .toBuffer();
}
