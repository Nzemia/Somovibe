import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function GET(req: NextRequest) {
    try {
        

        const resend = new Resend(process.env.RESEND_API_KEY);

        const result = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
            to: "delivered@resend.dev", // Resend test email
            subject: "Test Email from Questy",
            html: "<p>This is a test email to verify Resend is working!</p>",
        });


        return NextResponse.json({
            success: true,
            message: "Test email sent successfully",
            result,
        });
    } catch (error: any) {
        console.error("❌ Test email failed:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message,
                details: error,
            },
            { status: 500 }
        );
    }
}
