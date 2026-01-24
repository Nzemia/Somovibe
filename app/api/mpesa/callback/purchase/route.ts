import { prisma } from "@/lib/prisma";
import { creditWallet } from "@/lib/wallet";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const payload = await req.json();

    const meta = payload.Body.stkCallback.CallbackMetadata?.Item || [];
    const amount = meta.find((i: any) => i.Name === "Amount")?.Value;
    const pdfId = payload.Body.stkCallback.AccountReference;
    const phone = meta.find((i: any) => i.Name === "PhoneNumber")?.Value;

    if (!amount || !pdfId) return NextResponse.json({ ok: false });

    const student = await prisma.user.findUnique({
        where: { phone: String(phone) },
    });

    if (!student) return NextResponse.json({ ok: false });

    const pdf = await prisma.pdf.findUnique({ where: { id: pdfId } });
    if (!pdf) return NextResponse.json({ ok: false });

    const teacherShare = Math.floor(amount * 0.75);
    const platformShare = amount - teacherShare;

    await prisma.purchase.create({
        data: {
            userId: student.id,
            pdfId,
        },
    });

    await creditWallet(pdf.teacherId, teacherShare);
    await creditWallet("PLATFORM_ADMIN_ID", platformShare);

    return NextResponse.json({ ok: true });
}
