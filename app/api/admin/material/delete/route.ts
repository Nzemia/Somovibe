import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireRole, handleAuthError } from "@/lib/apiAuth"

export async function DELETE(req: Request) {
    try {
        await requireRole("ADMIN")

        const { materialId } = await req.json()

        if (!materialId) {
            return NextResponse.json(
                { error: "Material ID required" },
                { status: 400 }
            )
        }

        // Delete all child records (no cascade in schema)
        await prisma.review.deleteMany({
            where: { pdfId: materialId }
        })
        await prisma.materialView.deleteMany({
            where: { pdfId: materialId }
        })
        await prisma.download.deleteMany({
            where: { pdfId: materialId }
        })
        await prisma.purchase.deleteMany({
            where: { pdfId: materialId }
        })

        // Delete the PDF
        await prisma.pdf.delete({
            where: { id: materialId }
        })

        return NextResponse.json({ ok: true })
    } catch (error) {
        console.error("Delete material error:", error)
        return handleAuthError(error)
    }
}
