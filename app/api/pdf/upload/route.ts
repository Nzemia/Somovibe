import { prisma } from "@/lib/prisma";
import { createSupabaseServer } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { requireRole, handleAuthError } from "@/lib/apiAuth";

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

        if (!file || !title || !description || !subject || !grade || !price) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (file.type !== "application/pdf") {
            return NextResponse.json({ error: "Only PDFs allowed" }, { status: 400 });
        }

        const supabase = await createSupabaseServer();
        const filePath = `${user.id}/${Date.now()}.pdf`;

        const { error } = await supabase.storage
            .from("pdfs")
            .upload(filePath, file);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

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

        return NextResponse.json(pdf);
    } catch (error) {
        return handleAuthError(error);
    }
}
