import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireRole, handleAuthError } from "@/lib/apiAuth";

export async function DELETE(req: Request) {
    try {
        await requireRole("ADMIN");

        const { teacherId } = await req.json();

        if (!teacherId) {
            return NextResponse.json({ error: "Teacher ID required" }, { status: 400 });
        }

        // Delete in order due to foreign key constraints
        // Delete wallet transactions first
        await prisma.walletTransaction.deleteMany({
            where: {
                wallet: {
                    userId: teacherId,
                },
            },
        });

        // Delete wallets
        await prisma.wallet.deleteMany({
            where: { userId: teacherId },
        });

        // Delete purchases
        await prisma.purchase.deleteMany({
            where: {
                OR: [
                    { userId: teacherId },
                    {
                        pdf: {
                            teacherId: teacherId,
                        },
                    },
                ],
            },
        });

        // Delete PDFs
        await prisma.pdf.deleteMany({
            where: { teacherId: teacherId },
        });

        // Delete pending payments
        await prisma.pendingPayment.deleteMany({
            where: { userId: teacherId },
        });

        // Delete teacher profile
        await prisma.teacherProfile.deleteMany({
            where: { userId: teacherId },
        });

        // Finally delete the user
        await prisma.user.delete({
            where: { id: teacherId },
        });

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Delete teacher error:", error);
        return handleAuthError(error);
    }
}
