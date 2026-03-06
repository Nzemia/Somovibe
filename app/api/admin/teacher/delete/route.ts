import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireRole, handleAuthError } from "@/lib/apiAuth"

export async function DELETE(req: Request) {
    try {
        await requireRole("ADMIN")

        const { teacherId } = await req.json()

        if (!teacherId) {
            return NextResponse.json(
                { error: "Teacher ID required" },
                { status: 400 }
            )
        }

        // Delete in order due to foreign key constraints (no cascades in schema)

        // 1. Wallet transactions
        await prisma.walletTransaction.deleteMany({
            where: { wallet: { userId: teacherId } }
        })

        // 2. Wallets
        await prisma.wallet.deleteMany({
            where: { userId: teacherId }
        })

        // 3. Withdrawal requests
        await prisma.withdrawalRequest.deleteMany({
            where: { userId: teacherId }
        })

        // 4. Child records on teacher's PDFs (reviews, views, downloads, purchases)
        const teacherPdfIds = await prisma.pdf
            .findMany({
                where: { teacherId },
                select: { id: true }
            })
            .then(rows => rows.map(r => r.id))

        if (teacherPdfIds.length > 0) {
            await prisma.review.deleteMany({
                where: { pdfId: { in: teacherPdfIds } }
            })
            await prisma.materialView.deleteMany({
                where: { pdfId: { in: teacherPdfIds } }
            })
            await prisma.download.deleteMany({
                where: { pdfId: { in: teacherPdfIds } }
            })
            await prisma.purchase.deleteMany({
                where: { pdfId: { in: teacherPdfIds } }
            })
        }

        // 5. Purchases the teacher made as a buyer
        await prisma.purchase.deleteMany({
            where: { userId: teacherId }
        })

        // 6. Delete PDFs
        await prisma.pdf.deleteMany({
            where: { teacherId }
        })

        // 7. Pending payments
        await prisma.pendingPayment.deleteMany({
            where: { userId: teacherId }
        })

        // 8. Teacher's own downloads, views, reviews (as a user)
        await prisma.download.deleteMany({
            where: { userId: teacherId }
        })
        await prisma.materialView.deleteMany({
            where: { userId: teacherId }
        })
        await prisma.review.deleteMany({
            where: { userId: teacherId }
        })

        // 9. Teacher profile
        await prisma.teacherProfile.deleteMany({
            where: { userId: teacherId }
        })

        // 10. Finally delete the user (accounts/sessions cascade automatically)
        await prisma.user.delete({
            where: { id: teacherId }
        })

        return NextResponse.json({ ok: true })
    } catch (error) {
        console.error("Delete teacher error:", error)
        return handleAuthError(error)
    }
}
