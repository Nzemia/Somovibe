import { getMpesaToken, getMpesaBaseUrl } from "@/lib/mpesa";
import axios from "axios";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { requireAuth, handleAuthError } from "@/lib/apiAuth";

export async function POST(req: Request) {
    try {
        const user = await requireAuth();
        const { phone, pdfId } = await req.json();

        if (!phone || !pdfId) {
            // OLD: return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
            return NextResponse.json({ error: "Please provide phone number and select a material" }, { status: 400 });
        }

        // Validate and format phone number
        let formattedPhone = phone.replace(/\s+/g, '');

        if (formattedPhone.startsWith('+')) {
            formattedPhone = formattedPhone.substring(1);
        }

        if (formattedPhone.startsWith('0')) {
            formattedPhone = '254' + formattedPhone.substring(1);
        }

        if (!/^254\d{9}$/.test(formattedPhone)) {
            // OLD: return NextResponse.json({ error: "Invalid phone number format. Use 254XXXXXXXXX" }, { status: 400 });
            return NextResponse.json({
                error: "Please enter a valid phone number (e.g., 0712345678 or 254712345678)"
            }, { status: 400 });
        }

        // Get PDF details
        const pdf = await prisma.pdf.findUnique({ where: { id: pdfId } });

        if (!pdf) {
            // OLD: return NextResponse.json({ error: "PDF not found" }, { status: 404 });
            return NextResponse.json({ error: "Material not found or has been removed" }, { status: 404 });
        }

        if (pdf.status !== "APPROVED") {
            // OLD: return NextResponse.json({ error: "PDF not available for purchase" }, { status: 400 });
            return NextResponse.json({ error: "This material is not yet available for purchase" }, { status: 400 });
        }

        // Prevent teacher from buying their own material
        if (pdf.teacherId === user.id) {
            // OLD: return NextResponse.json({ error: "You cannot purchase your own material" }, { status: 400 });
            return NextResponse.json({ error: "You cannot buy your own material" }, { status: 400 });
        }

        // Check if already purchased
        const existingPurchase = await prisma.purchase.findUnique({
            where: {
                userId_pdfId: { userId: user.id, pdfId },
            },
        });

        if (existingPurchase) {
            // OLD: return NextResponse.json({ error: "Already purchased" }, { status: 400 });
            return NextResponse.json({ error: "You've already purchased this material. Check your downloads" }, { status: 400 });
        }

        // Generate unique reference code
        const referenceCode = `PDF-${randomBytes(6).toString("hex").toUpperCase()}`;

        // Create pending payment
        await prisma.pendingPayment.create({
            data: {
                userId: user.id,
                phone: formattedPhone,
                amount: pdf.price,
                type: "PDF_PURCHASE",
                referenceCode,
                metadata: JSON.stringify({ pdfId }),
            },
        });

        // PRODUCTION: Real M-Pesa
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
                    Amount: pdf.price,
                    PartyA: formattedPhone,
                    PartyB: process.env.MPESA_SHORTCODE,
                    PhoneNumber: formattedPhone,
                    CallBackURL: `${process.env.MPESA_CALLBACK_URL}/api/mpesa/callback/purchase?ref=${referenceCode}`,
                    AccountReference: referenceCode,
                    TransactionDesc: `Purchase: ${pdf.title}`,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            return NextResponse.json({ message: "Check your phone to complete payment", referenceCode });
        } catch (error: any) {
            console.error("M-Pesa error:", error.response?.data || error.message);
            // OLD: return NextResponse.json({ error: "Failed to initiate payment" }, { status: 500 });
            return NextResponse.json(
                { error: "Payment request failed. Please try again or contact support" },
                { status: 500 }
            );
        }
    } catch (error: any) {
        return handleAuthError(error);
    }
}