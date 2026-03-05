import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const referenceCode = searchParams.get("referenceCode");

        if (!referenceCode) {
            return NextResponse.json({ error: "Reference code required" }, { status: 400 });
        }

        // The referenceCode is the authentication token — it's a server-generated
        // cryptographically random value (12 hex chars = 48 bits of entropy).
        // Knowing the referenceCode proves ownership; no session required.
        const payment = await prisma.pendingPayment.findUnique({
            where: { referenceCode },
            select: {
                status: true,
                type: true,
                createdAt: true,
                completedAt: true,
            },
        });

        if (!payment) {
            return NextResponse.json({ error: "Payment not found" }, { status: 404 });
        }

        return NextResponse.json(payment);
    } catch (error: any) {
        console.error("Payment status error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
