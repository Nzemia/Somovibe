import { prisma } from "@/lib/prisma";
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

        // Get the PDF first
        const pdf = await prisma.pdf.findUnique({
            where: { id: pdfId },
        });

        if (!pdf) {
            return NextResponse.json({ error: "Material not found" }, { status: 404 });
        }

        // Admin bypass: Admins can download any material without purchase
        let fileUrl: string;
        if (user.role === "ADMIN") {
            fileUrl = pdf.fileUrl;
        } else {
            // Regular users need to have purchased the material
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

            fileUrl = purchase.pdf.fileUrl;
        }

        // Check if it's a placeholder file (legacy check)
        if (fileUrl.startsWith("placeholder-")) {
            return NextResponse.json({
                error: "This material is not available for download yet. The teacher needs to re-upload the file."
            }, { status: 404 });
        }

        // Track download (skip for admin reviews)
        if (user.role !== "ADMIN") {
            await prisma.download.create({
                data: {
                    userId: user.id,
                    pdfId,
                },
            }).catch(() => { }); // Ignore errors for download tracking
        }

        // Redirect to the Cloudinary URL directly
        return NextResponse.redirect(fileUrl);
    } catch (error: any) {
        console.error("Download error:", error);
        return NextResponse.json({ error: "Failed to download" }, { status: 500 });
    }
}
