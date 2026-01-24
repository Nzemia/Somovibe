import { getMpesaToken } from "@/lib/mpesa";
import { NextResponse } from "next/server";
import axios from "axios";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    const { referenceCode } = await req.json();

    if (!referenceCode) {
        return NextResponse.json({ error: "Reference code required" }, { status: 400 });
    }

    // Get pending payment
    const payment = await prisma.pendingPayment.findUnique({
        where: { referenceCode },
        include: { user: true },
    });

    if (!payment) {
        return NextResponse.json({ error: "Invalid reference code" }, { status: 404 });
    }

    if (payment.status === "COMPLETED") {
        return NextResponse.json({ error: "Payment already completed" }, { status: 400 });
    }

    // DEV MODE: Auto-approve payment for testing
    if (process.env.DEV_MODE === "true") {
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

        return NextResponse.json({
            message: "DEV MODE: Payment auto-approved",
            devMode: true
        });
    }

    // PRODUCTION: Use real M-Pesa
    const token = await getMpesaToken();

    const timestamp = new Date()
        .toISOString()
        .replace(/[^0-9]/g, "")
        .slice(0, -3);

    const password = Buffer.from(
        `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString("base64");

    try {
        await axios.post(
            "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
            {
                BusinessShortCode: process.env.MPESA_SHORTCODE,
                Password: password,
                Timestamp: timestamp,
                TransactionType: "CustomerPayBillOnline",
                Amount: payment.amount,
                PartyA: payment.phone,
                PartyB: process.env.MPESA_SHORTCODE,
                PhoneNumber: payment.phone,
                CallBackURL: `${process.env.NEXT_PUBLIC_BASE_URL}/api/mpesa/callback/teacher`,
                AccountReference: referenceCode,
                TransactionDesc: "Teacher Verification Fee",
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        return NextResponse.json({ message: "STK push sent to your phone" });
    } catch (error: any) {
        console.error("M-Pesa error:", error.response?.data || error.message);
        return NextResponse.json(
            { error: "Failed to initiate payment. Please try again or contact support." },
            { status: 500 }
        );
    }
}
