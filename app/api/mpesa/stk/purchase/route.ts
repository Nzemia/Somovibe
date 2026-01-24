import { getMpesaToken } from "@/lib/mpesa";
import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { phone, amount, pdfId, userId } = await req.json();
    const token = await getMpesaToken();

    const timestamp = new Date()
        .toISOString()
        .replace(/[^0-9]/g, "")
        .slice(0, -3);

    const password = Buffer.from(
        `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString("base64");

    await axios.post(
        "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
        {
            BusinessShortCode: process.env.MPESA_SHORTCODE,
            Password: password,
            Timestamp: timestamp,
            TransactionType: "CustomerPayBillOnline",
            Amount: amount,
            PartyA: phone,
            PartyB: process.env.MPESA_SHORTCODE,
            PhoneNumber: phone,
            CallBackURL: `${process.env.NEXT_PUBLIC_BASE_URL}/api/mpesa/callback/purchase`,
            AccountReference: pdfId,
            TransactionDesc: "Questy PDF Purchase",
        },
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );

    return NextResponse.json({ message: "STK sent" });
}
