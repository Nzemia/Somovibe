import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendTeacherVerificationCompleteEmail, sendNewTeacherRegistrationEmail } from "@/lib/email";
import { getPlatformAdminId } from "@/lib/platformAdmin";

export async function POST(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        let referenceCode = searchParams.get("ref");

        const payload = await req.json();

        const stkCallback = payload.Body?.stkCallback;

        if (!stkCallback) {
            console.error("No stkCallback in payload");
            return NextResponse.json({ ok: false });
        }

        const resultCode = stkCallback.ResultCode;

        // Try multiple possible locations for reference code if not in URL
        if (!referenceCode) {
            referenceCode = stkCallback.AccountReference;
        }

        // If not in AccountReference, try CallbackMetadata
        if (!referenceCode) {
            const meta = stkCallback.CallbackMetadata?.Item || [];
            const accountRef = meta.find((i: any) => i.Name === "AccountReference");
            referenceCode = accountRef?.Value;
        }

        if (!referenceCode) {
            console.error("No reference code found in callback");
            // Try to find by phone number as fallback
            const meta = stkCallback.CallbackMetadata?.Item || [];
            const phoneItem = meta.find((i: any) => i.Name === "PhoneNumber");
            const phone = phoneItem?.Value?.toString();

            if (phone) {
                const payment = await prisma.pendingPayment.findFirst({
                    where: {
                        phone: phone.startsWith('254') ? phone : `254${phone}`,
                        status: "PENDING",
                        type: "TEACHER_VERIFICATION",
                    },
                    orderBy: { createdAt: "desc" },
                });

                if (payment) {
                    referenceCode = payment.referenceCode;
                } else {
                    console.error("No pending payment found for phone:", phone);
                    return NextResponse.json({ ok: false });
                }
            } else {
                return NextResponse.json({ ok: false });
            }
        }

        // Find pending payment
        const payment = await prisma.pendingPayment.findUnique({
            where: { referenceCode },
        });

        if (!payment) {
            console.error("Payment not found for reference:", referenceCode);
            return NextResponse.json({ ok: false });
        }

        // Idempotency: if already processed, return success without re-processing
        if (payment.status === "COMPLETED" || payment.status === "FAILED") {
            console.log("Payment already processed:", referenceCode, "Status:", payment.status);
            return NextResponse.json({ ok: true });
        }

        // Payment successful
        if (resultCode === 0) {
            const meta = stkCallback.CallbackMetadata?.Item || [];
            const amount = meta.find((i: any) => i.Name === "Amount")?.Value;

            // Validate amount matches expected payment
            if (amount !== undefined && Number(amount) !== payment.amount) {
                console.error(
                    "Amount mismatch! Expected:", payment.amount, "Received:", amount,
                    "Reference:", referenceCode
                );
                // Mark as failed due to amount mismatch
                await prisma.pendingPayment.update({
                    where: { id: payment.id },
                    data: { status: "FAILED" },
                });
                return NextResponse.json({ ok: true });
            }

            // Update payment status and activate teacher in a transaction
            // Using sequential transaction array to avoid P2028 interactive timeout on VPS
            await prisma.$transaction([
                prisma.pendingPayment.update({
                    where: { id: payment.id },
                    data: {
                        status: "COMPLETED",
                        completedAt: new Date(),
                    },
                }),
                prisma.teacherProfile.update({
                    where: { userId: payment.userId },
                    data: { isActive: true },
                })
            ]);

            // Send email notifications (non-blocking, don't fail the callback)
            try {
                const [teacher, adminId] = await Promise.all([
                    prisma.user.findUnique({
                        where: { id: payment.userId },
                        select: { email: true, phone: true },
                    }),
                    getPlatformAdminId(),
                ]);

                if (teacher) {
                    await sendTeacherVerificationCompleteEmail(teacher.email);

                    if (adminId) {
                        const admin = await prisma.user.findUnique({
                            where: { id: adminId },
                            select: { email: true },
                        });
                        if (admin) {
                            await sendNewTeacherRegistrationEmail(admin.email, teacher.email, teacher.phone || "N/A");
                        }
                    }
                }
            } catch (emailError) {
                console.error("Email sending failed, but verification succeeded:", emailError);
            }
        } else {
            // Payment failed
            await prisma.pendingPayment.update({
                where: { id: payment.id },
                data: { status: "FAILED" },
            });
        }

        return NextResponse.json({ ok: true });
    } catch (error: any) {
        console.error("❌ Callback error:", error);
        return NextResponse.json({ ok: false, error: error.message });
    }
}
