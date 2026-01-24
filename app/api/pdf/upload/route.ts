import { prisma } from "@/lib/prisma";
import { createSupabaseServer } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const subject = formData.get("subject") as string;
    const grade = formData.get("grade") as string;
    const price = Number(formData.get("price"));

    if (file.type !== "application/pdf") {
        return NextResponse.json({ error: "Only PDFs allowed" }, { status: 400 });
    }

    const supabase = createSupabaseServer();
    const {
        data: { user },
    } = await (await supabase).auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const filePath = `${user.id}/${Date.now()}.pdf`;

    const { error } = await (await supabase).storage
        .from("pdfs")
        .upload(filePath, file);

    if (error) return NextResponse.json({ error }, { status: 500 });

    const pdf = await prisma.pdf.create({
        data: {
            title,
            subject,
            grade,
            price,
            fileUrl: filePath,
            teacherId: user.id,
        },
    });

    return NextResponse.json(pdf);
}
