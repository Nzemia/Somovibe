import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireRole, handleAuthError } from "@/lib/apiAuth";
import { sendNewMaterialPendingEmail } from "@/lib/email";
import { getPlatformAdminId } from "@/lib/platformAdmin";
import { uploadToCloudinary, getDefaultThumbnail } from "@/lib/cloudinary";

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

        if (!file || !title || !description || !subject || !grade || !price || !materialType) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Validate material type
        const validMaterialTypes = ["PDF", "PDF_SLIDES", "POWERPOINT", "CLASS_INSTRUCTIONS", "SCHEME_OF_WORK", "LESSON_PLAN", "EXAM_QUIZ"];
        if (!validMaterialTypes.includes(materialType)) {
            console.error("Invalid material type:", materialType);
            return NextResponse.json({ error: "Invalid material type" }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = ["application/pdf", "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation"];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: "Only PDF and PowerPoint files allowed" }, { status: 400 });
        }

        // Upload thumbnail
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

        // Upload material file to Cloudinary (raw = PDFs, PPTs, etc.)
        let fileUrl: string;
        try {
            fileUrl = await uploadToCloudinary(file, "materials", "raw");
        } catch (error) {
            console.error("File upload failed:", error);
            return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
        }

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
                materialType: materialType as "PDF" | "PDF_SLIDES" | "POWERPOINT" | "CLASS_INSTRUCTIONS" | "SCHEME_OF_WORK" | "LESSON_PLAN" | "EXAM_QUIZ",
                teacherId: user.id,
            },
        });

        // Notify admin of new material
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
        }

        return NextResponse.json(pdf);
    } catch (error: any) {
        console.error("Upload error:", error.message || error);
        return handleAuthError(error);
    }
}
