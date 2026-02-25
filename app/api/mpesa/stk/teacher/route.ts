import { getMpesaToken, getMpesaBaseUrl } from "@/lib/mpesa";
import { NextResponse } from "next/server";
import axios from "axios";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleAuthError } from "@/lib/apiAuth";

export async function POST(req: Request) {
    try {
        const user = await requireAuth();
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

        // Verify the authenticated user owns this payment
        if (payment.userId !== user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        if (payment.status === "COMPLETED") {
            return NextResponse.json({ error: "Payment already completed" }, { status: 400 });
        }

        if (payment.status === "FAILED") {
            return NextResponse.json({ error: "Payment failed. Please create a new request." }, { status: 400 });
        }

        // Format and validate phone number
        let formattedPhone = payment.phone.replace(/\s+/g, '');
        if (formattedPhone.startsWith('+')) {
            formattedPhone = formattedPhone.substring(1);
        }
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '254' + formattedPhone.substring(1);
        }
        if (!/^254\d{9}$/.test(formattedPhone)) {
            return NextResponse.json({
                error: "Invalid phone number format. Use 254XXXXXXXXX"
            }, { status: 400 });
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
                `${getMpesaBaseUrl()}/mpesa/stkpush/v1/processrequest`,
                {
                    BusinessShortCode: process.env.MPESA_SHORTCODE,
                    Password: password,
                    Timestamp: timestamp,
                    TransactionType: "CustomerPayBillOnline",
                    Amount: payment.amount,
                    PartyA: formattedPhone,
                    PartyB: process.env.MPESA_SHORTCODE,
                    PhoneNumber: formattedPhone,
                    CallBackURL: `${process.env.MPESA_CALLBACK_URL}/api/mpesa/callback/teacher`,
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
    } catch (error: any) {
        return handleAuthError(error);
    }
}
