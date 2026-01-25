import { getMpesaToken } from "@/lib/mpesa";
import axios from "axios";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { creditWallet } from "@/lib/wallet";
import { getPlatformAdminId } from "@/lib/platformAdmin";

export async function POST(req: Request) {
    const { phone, pdfId, userId } = await req.json();

    if (!phone || !pdfId || !userId) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate and format phone number
    let formattedPhone = phone.replace(/\s+/g, ''); // Remove spaces

    // Remove + if present
    if (formattedPhone.startsWith('+')) {
        formattedPhone = formattedPhone.substring(1);
    }

    // If starts with 0, replace with 254
    if (formattedPhone.startsWith('0')) {
        formattedPhone = '254' + formattedPhone.substring(1);
    }

    // Validate format (should be 254XXXXXXXXX - 12 digits)
    if (!/^254\d{9}$/.test(formattedPhone)) {
        return NextResponse.json({
            error: "Invalid phone number format. Use 254XXXXXXXXX"
        }, { status: 400 });
    }

    console.log("Purchase request - Phone:", formattedPhone, "PDF:", pdfId, "User:", userId);

    // Get PDF details
    const pdf = await prisma.pdf.findUnique({ where: { id: pdfId } });

    if (!pdf) {
        return NextResponse.json({ error: "PDF not found" }, { status: 404 });
    }

    if (pdf.status !== "APPROVED") {
        return NextResponse.json({ error: "PDF not available for purchase" }, { status: 400 });
    }

    // Check if already purchased
    const existingPurchase = await prisma.purchase.findUnique({
        where: {
            userId_pdfId: { userId, pdfId },
        },
    });

    if (existingPurchase) {
        return NextResponse.json({ error: "Already purchased" }, { status: 400 });
    }

    // Generate unique reference code
    const referenceCode = `PDF-${randomBytes(6).toString("hex").toUpperCase()}`;

    // Create pending payment
    await prisma.pendingPayment.create({
        data: {
            userId,
            phone: formattedPhone,
            amount: pdf.price,
            type: "PDF_PURCHASE",
            referenceCode,
            metadata: JSON.stringify({ pdfId }),
        },
    });

    // DEV MODE: Auto-complete purchase
    if (process.env.DEV_MODE === "true") {
        console.log("DEV MODE: Auto-completing purchase");

        // Calculate shares
        const teacherShare = Math.floor(pdf.price * 0.75);
        const platformShare = pdf.price - teacherShare;

        // Create purchase record
        await prisma.purchase.create({
            data: {
                userId,
                pdfId,
            },
        });

        // Credit teacher wallet
        await creditWallet(pdf.teacherId, teacherShare);

        // Credit platform admin wallet
        const platformAdminId = await getPlatformAdminId();
        if (platformAdminId) {
            await creditWallet(platformAdminId, platformShare);
        }

        // Update payment status
        await prisma.pendingPayment.updateMany({
            where: { referenceCode },
            data: {
                status: "COMPLETED",
                completedAt: new Date(),
            },
        });

        console.log("✅ Purchase completed in DEV MODE");

        return NextResponse.json({
            message: "DEV MODE: Purchase completed",
            devMode: true,
            referenceCode
        });
    }

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
        console.log("Sending STK push to:", formattedPhone, "Amount:", pdf.price);

        await axios.post(
            "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
            {
                BusinessShortCode: process.env.MPESA_SHORTCODE,
                Password: password,
                Timestamp: timestamp,
                TransactionType: "CustomerPayBillOnline",
                Amount: pdf.price,
                PartyA: formattedPhone,
                PartyB: process.env.MPESA_SHORTCODE,
                PhoneNumber: formattedPhone,
                CallBackURL: `${process.env.NEXT_PUBLIC_BASE_URL}/api/mpesa/callback/purchase`,
                AccountReference: referenceCode,
                TransactionDesc: `Purchase: ${pdf.title}`,
            },
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        console.log("✅ STK push sent successfully");

        return NextResponse.json({ message: "STK push sent to your phone", referenceCode });
    } catch (error: any) {
        console.error("M-Pesa error:", error.response?.data || error.message);
        return NextResponse.json(
            { error: "Failed to initiate payment" },
            { status: 500 }
        );
    }
}
