import { NextResponse } from "next/server"
import { PDFDocument } from "pdf-lib"

import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const PDF_HEADERS = {
    "Content-Type": "application/pdf",
    "Cache-Control": "private, no-store, max-age=0"
} as const

function sanitizeFileName(name: string) {
    return name.replace(/[^a-zA-Z0-9._-]/g, "_")
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const pdfId = searchParams.get("pdfId")

        if (!pdfId) {
            return NextResponse.json(
                { error: "PDF ID required" },
                { status: 400 }
            )
        }

        const pdf = await prisma.pdf.findFirst({
            where: {
                id: pdfId,
                status: "APPROVED"
            },
            select: {
                id: true,
                title: true,
                fileUrl: true
            }
        })

        if (!pdf) {
            return NextResponse.json(
                { error: "Material not found" },
                { status: 404 }
            )
        }

        if (pdf.fileUrl.startsWith("placeholder-")) {
            return NextResponse.json(
                {
                    error: "This material is not available for preview yet."
                },
                { status: 404 }
            )
        }

        const user = await getCurrentUser()

        let canViewFull = false

        if (user?.role === "ADMIN") {
            canViewFull = true
        } else if (user) {
            const purchase =
                await prisma.purchase.findUnique({
                    where: {
                        userId_pdfId: {
                            userId: user.id,
                            pdfId
                        }
                    }
                })

            canViewFull = !!purchase
        }

        const sourceRes = await fetch(pdf.fileUrl, {
            cache: "no-store"
        })

        if (!sourceRes.ok) {
            return NextResponse.json(
                {
                    error: "Failed to load preview source file"
                },
                { status: 500 }
            )
        }

        const safeName = sanitizeFileName(
            pdf.title || "material"
        )

        if (canViewFull) {
            return new NextResponse(sourceRes.body, {
                headers: {
                    ...PDF_HEADERS,
                    "Content-Disposition": `inline; filename=\"${safeName}.pdf\"`,
                    "X-Preview-Mode": "full"
                }
            })
        }

        const sourceBytes = new Uint8Array(
            await sourceRes.arrayBuffer()
        )

        const sourceDoc =
            await PDFDocument.load(sourceBytes)

        if (sourceDoc.getPageCount() < 1) {
            return NextResponse.json(
                { error: "Invalid PDF file" },
                { status: 422 }
            )
        }

        const previewDoc = await PDFDocument.create()
        const [firstPage] = await previewDoc.copyPages(
            sourceDoc,
            [0]
        )
        previewDoc.addPage(firstPage)
        const outputBytes = new Uint8Array(
            await previewDoc.save()
        )

        return new NextResponse(Buffer.from(outputBytes), {
            headers: {
                ...PDF_HEADERS,
                "Content-Disposition": `inline; filename=\"${safeName}.pdf\"`,
                "X-Preview-Mode": "locked-preview"
            }
        })
    } catch (error) {
        console.error("Preview route error:", error)
        return NextResponse.json(
            { error: "Failed to load preview" },
            { status: 500 }
        )
    }
}
