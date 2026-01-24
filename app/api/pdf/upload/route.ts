import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireRole, handleAuthError } from "@/lib/apiAuth";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
    try {
        // Only teachers can upload PDFs
        const user = await requireRole("TEACHER");

        const formData = await req.formData();
        const file = formData.get("file") as File;
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const subject = formData.get("subject") as string;
        const grade = formData.get("grade") as string;
        const price = Number(formData.get("price"));

        console.log("Upload request from user:", user.email, { title, subject, grade, price, fileName: file?.name });

        if (!file || !title || !description || !subject || !grade || !price) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (file.type !== "application/pdf") {
            return NextResponse.json({ error: "Only PDFs allowed" }, { status: 400 });
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

        console.log("Attempting upload to Supabase:", { filePath, size: buffer.length });

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from("pdfs")
            .upload(filePath, buffer, {
                contentType: "application/pdf",
                upsert: false,
            });

        if (uploadError) {
            console.error("Supabase upload error:", uploadError);
            return NextResponse.json({
                error: `Failed to upload file: ${uploadError.message}`
            }, { status: 500 });
        }

        console.log("File uploaded to Supabase successfully:", uploadData);

        // Create PDF record in database
        const pdf = await prisma.pdf.create({
            data: {
                title,
                description,
                subject,
                grade,
                price,
                fileUrl: filePath,
                teacherId: user.id,
            },
        });

        console.log("PDF created successfully:", pdf.id);

        return NextResponse.json(pdf);
    } catch (error: any) {
        console.error("Upload error:", error.message || error);
        return handleAuthError(error);
    }
}
