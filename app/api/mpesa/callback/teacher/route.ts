import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendTeacherVerificationCompleteEmail, sendNewTeacherRegistrationEmail } from "@/lib/email";
import { getPlatformAdminId } from "@/lib/platformAdmin";

export async function POST(req: Request) {
    try {
        const payload = await req.json();

        console.log("Teacher payment callback:", JSON.stringify(payload, null, 2));

        const stkCallback = payload.Body?.stkCallback;

        if (!stkCallback) {
            console.error("No stkCallback in payload");
            return NextResponse.json({ ok: false });
        }

        const resultCode = stkCallback.ResultCode;

        // Try multiple possible locations for reference code
        let referenceCode = stkCallback.AccountReference;

        // If not in AccountReference, try CallbackMetadata
        if (!referenceCode) {
            const meta = stkCallback.CallbackMetadata?.Item || [];
            const accountRef = meta.find((i: any) => i.Name === "AccountReference");
            referenceCode = accountRef?.Value;
        }

        console.log("Extracted reference code:", referenceCode);

        if (!referenceCode) {
            console.error("No reference code found in callback");
            // Try to find by phone number as fallback
            const meta = stkCallback.CallbackMetadata?.Item || [];
            const phoneItem = meta.find((i: any) => i.Name === "PhoneNumber");
            const phone = phoneItem?.Value?.toString();

            if (phone) {
                console.log("Trying to find payment by phone:", phone);
                const payment = await prisma.pendingPayment.findFirst({
                    where: {
                        phone: phone.startsWith('254') ? phone : `254${phone}`,
                        status: "PENDING",
                        type: "TEACHER_VERIFICATION",
                    },
                    orderBy: { createdAt: "desc" },
                });

                if (payment) {
                    console.log("Found payment by phone:", payment.referenceCode);
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

        // Payment successful
        if (resultCode === 0) {
            const meta = stkCallback.CallbackMetadata?.Item || [];
            const amount = meta.find((i: any) => i.Name === "Amount")?.Value;

            console.log("Payment successful. Amount:", amount, "Expected:", payment.amount);

            // Update payment status
            await prisma.pendingPayment.update({
                where: { id: payment.id },
                data: {
                    status: "COMPLETED",
                    completedAt: new Date(),
                },
            });

            // Activate teacher profile
            await prisma.teacherProfile.update({
                where: { userId: payment.userId },
                data: { isActive: true },
            });

            console.log("✅ Teacher activated:", payment.userId);

            // Send email notifications
            const [teacher, adminId] = await Promise.all([
                prisma.user.findUnique({
                    where: { id: payment.userId },
                    select: { email: true, phone: true },
                }),
                getPlatformAdminId(),
            ]);

            if (teacher) {
                sendTeacherVerificationCompleteEmail(teacher.email);

                // Notify admin
                if (adminId) {
                    const admin = await prisma.user.findUnique({
                        where: { id: adminId },
                        select: { email: true },
                    });
                    if (admin) {
                        sendNewTeacherRegistrationEmail(admin.email, teacher.email, teacher.phone || "N/A");
                    }
                }
            }
        } else {
            // Payment failed
            await prisma.pendingPayment.update({
                where: { id: payment.id },
                data: { status: "FAILED" },
            });

            console.log("❌ Payment failed for:", referenceCode, "Result code:", resultCode);
        }

        return NextResponse.json({ ok: true });
    } catch (error: any) {
        console.error("❌ Callback error:", error);
        return NextResponse.json({ ok: false, error: error.message });
    }
}
