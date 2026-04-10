import { prisma } from "@/lib/prisma";
import { creditWallet } from "@/lib/wallet";
import { NextResponse } from "next/server";
import { getPlatformAdminId } from "@/lib/platformAdmin";
import { sendNewSaleEmail, sendPurchaseConfirmationEmail } from "@/lib/email";

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
                        type: "PDF_PURCHASE",
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
                await prisma.pendingPayment.update({
                    where: { id: payment.id },
                    data: { status: "FAILED" },
                });
                return NextResponse.json({ ok: true });
            }

            const metadata = JSON.parse(payment.metadata || "{}");
            const pdfId = metadata.pdfId;

            if (!pdfId) {
                console.error("No pdfId in payment metadata");
                return NextResponse.json({ ok: false });
            }

            const pdf = await prisma.pdf.findUnique({ where: { id: pdfId } });

            if (!pdf) {
                console.error("PDF not found:", pdfId);
                return NextResponse.json({ ok: false });
            }

            // Use the expected amount (not callback amount) for revenue split
            const expectedAmount = payment.amount;
            const teacherShare = Math.floor(expectedAmount * 0.75);
            const platformShare = expectedAmount - teacherShare;
            const platformAdminId = await getPlatformAdminId();

            // Perform all Ledger operations atomically
            try {
                await prisma.$transaction(async (tx) => {
                    // Create purchase record
                    // Use upsert to be safe during retries and avoid Unique Constraint crashing
                    await tx.purchase.upsert({
                        where: {
                            userId_pdfId: {
                                userId: payment.userId,
                                pdfId,
                            }
                        },
                        update: {}, // Do nothing if already exists
                        create: {
                            userId: payment.userId,
                            pdfId,
                        },
                    });

                    // Credit teacher wallet
                    const { creditWalletTx } = await import("@/lib/wallet");
                    await creditWalletTx(tx, pdf.teacherId, teacherShare);

                    // Credit platform admin wallet
                    if (platformAdminId) {
                        await creditWalletTx(tx, platformAdminId, platformShare);
                    }

                    // Update payment status
                    await tx.pendingPayment.update({
                        where: { id: payment.id },
                        data: {
                            status: "COMPLETED",
                            completedAt: new Date(),
                        },
                    });
                });
            } catch (txError: any) {
                console.error("Wallet transaction failed, rolling back. Error:", txError);
                return NextResponse.json({ ok: false, error: txError.message });
            }

            // Send email notifications (non-blocking, don't fail the callback)
            try {
                const [student, teacher] = await Promise.all([
                    prisma.user.findUnique({
                        where: { id: payment.userId },
                        select: { email: true },
                    }),
                    prisma.user.findUnique({
                        where: { id: pdf.teacherId },
                        select: { email: true },
                    }),
                ]);

                if (student) {
                    await sendPurchaseConfirmationEmail(student.email, pdf.title, expectedAmount, pdfId);
                }
                if (teacher) {
                    await sendNewSaleEmail(teacher.email, pdf.title, expectedAmount, teacherShare, payment.userId);
                }
            } catch (emailError) {
                console.error("Email sending failed, but purchase succeeded:", emailError);
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
        console.error("❌ Purchase callback error:", error);
        return NextResponse.json({ ok: false, error: error.message });
    }
}
