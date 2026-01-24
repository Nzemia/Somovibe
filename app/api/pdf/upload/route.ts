import { prisma } from "@/lib/prisma";
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

        console.log("Upload request from user:", user.email, { title, subject, grade, price });

        if (!file || !title || !description || !subject || !grade || !price) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (file.type !== "application/pdf") {
            return NextResponse.json({ error: "Only PDFs allowed" }, { status: 400 });
        }

        // For now, store placeholder URL (we'll add real storage later)
        const fileUrl = `placeholder-${user.id}-${Date.now()}.pdf`;

        const pdf = await prisma.pdf.create({
            data: {
                title,
                description,
                subject,
                grade,
                price,
                fileUrl,
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
