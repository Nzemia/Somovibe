import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { pdfId, status } = await req.json();

    await prisma.pdf.update({
        where: { id: pdfId },
        data: { status },
    });

    return NextResponse.json({ ok: true });
}
