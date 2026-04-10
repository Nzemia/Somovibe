import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAuth, handleAuthError } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Lightweight endpoint: checks if the current user has a Purchase record for a given PDF
// Polled by the client after initiating M-Pesa payment to detect when payment completes
export async function GET(req: Request) {
    try {
        const user = await requireAuth();
        const { searchParams } = new URL(req.url);
        const pdfId = searchParams.get("pdfId");

        if (!pdfId) {
            return NextResponse.json({ error: "pdfId required" }, { status: 400 });
        }

        const purchase = await prisma.purchase.findUnique({
            where: {
                userId_pdfId: { userId: user.id, pdfId },
            },
            select: { id: true },
        });

        return NextResponse.json({ purchased: !!purchase });
    } catch (error: any) {
        return handleAuthError(error);
    }
}