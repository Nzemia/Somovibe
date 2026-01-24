import { prisma } from "@/lib/prisma";
import { createSupabaseServer } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const pdfId = searchParams.get("pdfId");

    const supabase = await createSupabaseServer();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const purchase = await prisma.purchase.findUnique({
        where: {
            userId_pdfId: {
                userId: user.id,
                pdfId: pdfId!,
            },
        },
    });

    if (!purchase)
        return NextResponse.json({ error: "Not purchased" }, { status: 403 });

    const pdf = await prisma.pdf.findUnique({ where: { id: pdfId! } });

    const { data } = await supabase.storage
        .from("pdfs")
        .createSignedUrl(pdf!.fileUrl, 60);

    return NextResponse.json({ url: data?.signedUrl });
}
