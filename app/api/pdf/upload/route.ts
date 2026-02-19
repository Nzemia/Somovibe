import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireRole, handleAuthError } from "@/lib/apiAuth";
import { createClient } from "@supabase/supabase-js";
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

        //console.log("Upload request from user:", user.email, { title, subject, grade, price, materialType, fileName: file?.name });

        if (!file || !title || !description || !subject || !grade || !price || !materialType) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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
                thumbnailUrl = await uploadToCloudinary(thumbnail, "material-thumbnails");
            } catch (error) {
                console.error("Thumbnail upload failed:", error);
                thumbnailUrl = getDefaultThumbnail(materialType);
            }
        } else {
            thumbnailUrl = getDefaultThumbnail(materialType);
        }

        // Use service role key for upload permissions
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            }
        );

        const filePath = `${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

        // Convert File to ArrayBuffer for Supabase
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        //console.log("Attempting upload to Supabase:", { filePath, size: buffer.length, type: file.type });

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from("pdfs")
            .upload(filePath, buffer, {
                contentType: file.type,
                upsert: false,
            });

        if (uploadError) {
            console.error("Supabase upload error:", uploadError);
            return NextResponse.json({
                error: `Failed to upload file: ${uploadError.message}`
            }, { status: 500 });
        }

        //console.log("File uploaded to Supabase successfully:", uploadData);

        // Create PDF record in database
        const pdf = await prisma.pdf.create({
            data: {
                title,
                description,
                subject,
                grade,
                price,
                fileUrl: filePath,
                thumbnailUrl,
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
