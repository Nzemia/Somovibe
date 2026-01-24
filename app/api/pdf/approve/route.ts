import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireRole, handleAuthError } from "@/lib/apiAuth";

export async function POST(req: Request) {
    try {
        // Only admins can approve/reject PDFs
        await requireRole("ADMIN");

        const { pdfId, status } = await req.json();

        if (!pdfId || !status) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (status !== "APPROVED" && status !== "REJECTED") {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        await prisma.pdf.update({
            where: { id: pdfId },
            data: { status },
        });

        console.log(`PDF ${pdfId} ${status.toLowerCase()} by admin`);

        return NextResponse.json({ ok: true, status });
    } catch (error) {
        return handleAuthError(error);
    }
}
