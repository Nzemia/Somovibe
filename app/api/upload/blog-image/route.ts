import { NextResponse } from "next/server";
import { requireRole, handleAuthError } from "@/lib/apiAuth";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { compressBlogPostImage } from "@/lib/blog-utils-server";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // 1. Authorize - only ADMIN can upload blog images
    await requireRole("ADMIN");

    // 2. Parse Form Data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 3. Client & Server size verification (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Image must be under 5MB" }, { status: 400 });
    }

    // 4. Verify MIME type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid format. Only JPG, PNG, and WEBP are allowed." }, { status: 400 });
    }

    // 5. Compress and optimize image using Sharp
    let uploadUrl: string;
    try {
      const compressedBuffer = await compressBlogPostImage(file);
      
      // Re-package as a File object for the existing Cloudinary helper
      const optimizedFile = new File([new Uint8Array(compressedBuffer)], "cover.webp", {
        type: "image/webp",
      });

      uploadUrl = await uploadToCloudinary(optimizedFile, "blog", "image");
    } catch (compressionError) {
      console.error("Image optimization failed, uploading original:", compressionError);
      // Fallback: upload original image if sharp fails
      uploadUrl = await uploadToCloudinary(file, "blog", "image");
    }

    return NextResponse.json({ url: uploadUrl });
  } catch (error) {
    console.error("Blog image upload API error:", error);
    return handleAuthError(error);
  }
}
