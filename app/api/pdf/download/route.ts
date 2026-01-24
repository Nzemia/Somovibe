import { prisma } from "@/lib/prisma";
import { createSupabaseServer } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/apiAuth";

export async function GET(req: Request) {
    try {
        const user = await requireAuth();
        const { searchParams } = new URL(req.url);
        const pdfId = searchParams.get("pdfId");

        if (!pdfId) {
            return NextResponse.json({ error: "PDF ID required" }, { status: 400 });
        }

        // Check if user has purchased this PDF
        const purchase = await prisma.purchase.findUnique({
            where: {
                userId_pdfId: { userId: user.id, pdfId },
            },
            include: {
                pdf: true,
            },
        });

        if (!purchase) {
            return NextResponse.json({ error: "You haven't purchased this material" }, { status: 403 });
        }

        // Get file from Supabase Storage
        const supabase = await createSupabaseServer();
        const { data, error } = await supabase.storage
            .from("pdfs")
            .download(purchase.pdf.fileUrl);

        if (error || !data) {
            console.error("Download error:", error);
            return NextResponse.json({ error: "Failed to download file" }, { status: 500 });
        }

        // Return the PDF file
        return new NextResponse(data, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${purchase.pdf.title}.pdf"`,
            },
        });
    } catch (error: any) {
        console.error("Download error:", error);
        return NextResponse.json({ error: "Failed to download" }, { status: 500 });
    }
}
