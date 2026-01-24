import { getMpesaToken } from "@/lib/mpesa";
import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
    const { phone, email } = await req.json();
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
            Amount: 100,
            PartyA: phone,
            PartyB: process.env.MPESA_SHORTCODE,
            PhoneNumber: phone,
            CallBackURL: `${process.env.NEXT_PUBLIC_BASE_URL}/api/mpesa/callback/teacher`,
            AccountReference: "Questy Teacher",
            TransactionDesc: "Teacher Verification",
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return NextResponse.json({ message: "STK sent" });
}
