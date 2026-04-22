import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireRole, handleAuthError } from "@/lib/apiAuth";
import { sendNewMaterialPendingEmail } from "@/lib/email";
import { getPlatformAdminId } from "@/lib/platformAdmin";
import { uploadToCloudinary, getDefaultThumbnail } from "@/lib/cloudinary";
import { generateSlug, makeSlugUnique } from "@/lib/slug";

// Raise the Next.js App Router body size limit (default is 1 MB).
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        // Only teachers can upload PDFs
        const user = await requireRole("TEACHER");

        const formData = await req.formData();
        const file = formData.get("file") as File;
        const thumbnail = formData.get("thumbnail") as File | null;
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const subject = formData.get("subject") as string;
        const grade = formData.get("grade") as string;
        const price = Number(formData.get("price"));
        const materialType = formData.get("materialType") as string;

        //console.log("Upload request from user:", user.email, { title, subject, grade, price, materialType, fileName: file?.name });

        if (!file || !title || !description || !subject || !grade || !price || !materialType) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Validate file size (10MB max for material)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ error: "Material file must not exceed 10MB" }, { status: 400 });
        }

        // Validate thumbnail size (5MB max)
        if (thumbnail && thumbnail.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: "Cover image must not exceed 5MB" }, { status: 400 });
        }

        // Validate material type
        const validMaterialTypes = ["PDF", "PDF_SLIDES", "POWERPOINT", "CLASS_INSTRUCTIONS", "SCHEME_OF_WORK", "LESSON_PLAN", "EXAM_QUIZ"];
        if (!validMaterialTypes.includes(materialType)) {
            console.error("Invalid material type:", materialType);
            return NextResponse.json({ error: "Invalid material type" }, { status: 400 });
        }

        // Validate file type based on material type
        const allowedTypes = ["application/pdf", "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation"];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: "Only PDF and PowerPoint files allowed" }, { status: 400 });
        }

        // Handle thumbnail upload
        let thumbnailUrl: string;
        if (thumbnail) {
            try {
                thumbnailUrl = await uploadToCloudinary(thumbnail, "material-thumbnails", "image");
            } catch (error) {
                console.error("Thumbnail upload failed:", error);
                thumbnailUrl = getDefaultThumbnail(materialType);
            }
        } else {
            thumbnailUrl = getDefaultThumbnail(materialType);
        }

        // Upload PDF to Cloudinary
        let fileUrl: string;
        try {
            fileUrl = await uploadToCloudinary(file, "materials", "raw");
        } catch (error) {
            console.error("File upload failed:", error);
            return NextResponse.json({
                error: "Failed to upload file"
            }, { status: 500 });
        }

        // Generate a slug from title + grade + subject
        let slug = generateSlug(title, grade, subject);
        // Check for uniqueness; if collision, append a random suffix
        const existing = await prisma.pdf.findUnique({ where: { slug } });
        if (existing) slug = makeSlugUnique(slug);

        // Create PDF record in database
        const pdf = await prisma.pdf.create({
            data: {
                title,
                description,
                subject,
                grade,
                price,
                fileUrl,
                thumbnailUrl,
                slug,
                materialType: materialType as "PDF" | "PDF_SLIDES" | "POWERPOINT" | "CLASS_INSTRUCTIONS" | "SCHEME_OF_WORK" | "LESSON_PLAN" | "EXAM_QUIZ",
                teacherId: user.id,
            },
        });

        //console.log("PDF created successfully:", pdf.id);

        // Notify admin of new material (await to catch errors)
        try {
            const adminId = await getPlatformAdminId();
            if (adminId) {
                const admin = await prisma.user.findUnique({
                    where: { id: adminId },
                    select: { email: true },
                });
                if (admin) {
                    await sendNewMaterialPendingEmail(admin.email, pdf.title, user.email, pdf.id);
                }
            }
        } catch (emailError) {
            console.error("Email sending failed, but upload succeeded:", emailError);
            // Don't fail the request if email fails
        }

        return NextResponse.json(pdf);
    } catch (error: any) {
        console.error("Upload error:", error.message || error);
        return handleAuthError(error);
    }
}
