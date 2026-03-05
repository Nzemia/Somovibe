import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { sendManualVerificationRequiredEmail } from "@/lib/email"
import { getPlatformAdminId } from "@/lib/platformAdmin"

export async function POST(req: Request) {
    try {
        const { referenceCode, mpesaReceipt } = await req.json()

        if (!referenceCode || !mpesaReceipt) {
            return NextResponse.json(
                { error: "Reference code and M-Pesa receipt are required" },
                { status: 400 }
            )
        }

        // Find the pending payment
        const payment = await prisma.pendingPayment.findUnique({
            where: { referenceCode }
        })

        if (!payment) {
            return NextResponse.json(
                { error: "Invalid reference code" },
                { status: 404 }
            )
        }

        // Make sure it belongs to a teacher verification
        if (payment.type !== "TEACHER_VERIFICATION") {
            return NextResponse.json(
                { error: "Invalid payment type" },
                { status: 400 }
            )
        }

        // Check if already completed
        if (payment.status === "COMPLETED") {
            return NextResponse.json(
                { error: "This payment has already been completed. Your account should be active." },
                { status: 400 }
            )
        }

        // Get teacher details
        const teacher = await prisma.user.findUnique({
            where: { id: payment.userId }
        })

        if (!teacher) {
            return NextResponse.json(
                { error: "Teacher profile not found" },
                { status: 404 }
            )
        }

        // We can update the pending payment metadata with the submitted receipt for admin reference.
        // Prisma allows `metadata` as a string, so we store it as JSON.
        let updatedMetadata = {}
        try {
            if (payment.metadata) {
                updatedMetadata = JSON.parse(payment.metadata)
            }
        } catch (e) {
            // ignore JSON parse error
        }

        await prisma.pendingPayment.update({
            where: { id: payment.id },
            data: {
                metadata: JSON.stringify({
                    ...updatedMetadata,
                    manualReviewRequested: true,
                    submittedReceipt: mpesaReceipt,
                    submittedAt: new Date().toISOString()
                })
            }
        })

        // Send email to admin
        const adminId = await getPlatformAdminId()
        if (adminId) {
            const admin = await prisma.user.findUnique({
                where: { id: adminId },
                select: { email: true }
            })
            
            if (admin) {
                await sendManualVerificationRequiredEmail(
                    admin.email,
                    teacher.email,
                    teacher.phone || "N/A",
                    mpesaReceipt
                )
            }
        }

        return NextResponse.json({
            ok: true,
            message: "Receipt submitted successfully for review"
        })
    } catch (error: any) {
        console.error("Manual verification error:", error)
        return NextResponse.json(
            { error: error.message || "Failed to process manual verification" },
            { status: 500 }
        )
    }
}
