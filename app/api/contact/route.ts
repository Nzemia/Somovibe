import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            console.error("Contact form missing RESEND_API_KEY");
            return NextResponse.json(
                { error: "Email service unavailable" },
                { status: 503 }
            );
        }

        const { name, email, subject, message } = await req.json();

        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            );
        }

        // Send email using direct fetch
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
                to: "mualukofrank@gmail.com",
                subject: `Contact Form: ${subject}`,
                html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>From:</strong> ${name} (${email})</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <hr />
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, "<br>")}</p>
            <hr />
            <p><small>Reply to: ${email}</small></p>
          `,
                replyTo: email,
            })
        });

        const text = await response.text();
        let data: any = null;
        try {
            data = JSON.parse(text);
        } catch (e) {
            throw new Error(`Resend response was not valid JSON: ${text}`);
        }

        if (!response.ok || data.error) {
            const errMsg = data.error?.message || `HTTP ${response.status}: ${response.statusText}`;
            console.error("Resend API error:", data.error || data);
            return NextResponse.json(
                { error: errMsg },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("Contact form error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
