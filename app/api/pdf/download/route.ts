import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/apiAuth";
import { createClient } from "@supabase/supabase-js";

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

        // Check if it's a placeholder file
        if (purchase.pdf.fileUrl.startsWith("placeholder-")) {
            return NextResponse.json({
                error: "This material is not available for download yet. The teacher needs to re-upload the file."
            }, { status: 404 });
        }

        // Use service role key for download (same as upload)
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

        console.log("Downloading file:", purchase.pdf.fileUrl);

        const { data, error } = await supabase.storage
            .from("pdfs")
            .download(purchase.pdf.fileUrl);

        if (error || !data) {
            console.error("Download error:", error);
            return NextResponse.json({
                error: "Failed to download file. Please contact support."
            }, { status: 500 });
        }

        console.log("File downloaded successfully, size:", data.size);

        // Track download
        await prisma.download.create({
            data: {
                userId: user.id,
                pdfId,
            },
        }).catch(() => { }); // Ignore errors for download tracking

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
