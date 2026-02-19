import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireRole, handleAuthError } from "@/lib/apiAuth";
import { sendMaterialApprovedEmail, sendMaterialRejectedEmail } from "@/lib/email";

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

        // Get PDF with teacher info
        const pdf = await prisma.pdf.findUnique({
            where: { id: pdfId },
            include: {
                teacher: {
                    select: {
                        email: true,
                    },
                },
            },
        });

        if (!pdf) {
            return NextResponse.json({ error: "PDF not found" }, { status: 404 });
        }

        await prisma.pdf.update({
            where: { id: pdfId },
            data: { status },
        });

        //console.log(`PDF ${pdfId} ${status.toLowerCase()} by admin`);

        // Send email notification (await to catch errors)
        try {
            if (status === "APPROVED") {
                await sendMaterialApprovedEmail(pdf.teacher.email, pdf.title, pdf.id);
            } else {
                await sendMaterialRejectedEmail(pdf.teacher.email, pdf.title);
            }
        } catch (emailError) {
            console.error("Email sending failed, but approval succeeded:", emailError);
            // Don't fail the request if email fails
        }

        return NextResponse.json({ ok: true, status });
    } catch (error) {
        return handleAuthError(error);
    }
}
