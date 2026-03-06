import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(request: Request) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== "TEACHER") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get("id")

        if (!id) {
            return NextResponse.json(
                { error: "Material ID is required" },
                { status: 400 }
            )
        }

        // Verify ownership
        const material = await prisma.pdf.findUnique({
            where: { id },
            select: { teacherId: true }
        })

        if (!material) {
            return NextResponse.json(
                { error: "Material not found" },
                { status: 404 }
            )
        }

        if (material.teacherId !== user.id) {
            return NextResponse.json(
                {
                    error: "Unauthorized: You do not own this material"
                },
                { status: 403 }
            )
        }

        // Delete the material
        // Note: Due to Prisma schema, associated records like purchases might not cascade automatically
        // Let's manually delete purchases and downloads first to avoid foreign key constraint errors in a transaction.
        await prisma.$transaction([
            prisma.review.deleteMany({
                where: { pdfId: id }
            }),
            prisma.materialView.deleteMany({
                where: { pdfId: id }
            }),
            prisma.download.deleteMany({
                where: { pdfId: id }
            }),
            prisma.purchase.deleteMany({
                where: { pdfId: id }
            }),
            prisma.pdf.delete({ where: { id } })
        ])

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("[DELETE_MATERIAL]", error)
        return NextResponse.json(
            { error: "Internal Error" },
            { status: 500 }
        )
    }
}
