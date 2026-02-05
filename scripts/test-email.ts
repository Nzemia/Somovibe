/**
 * Email Testing Script
 * 
 * Run this to test if your Resend email configuration is working:
 * npx tsx scripts/test-email.ts your-email@example.com
 */

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

async function testEmail(toEmail: string) {
    console.log("\n🧪 Testing Email Configuration...\n");
    console.log("Configuration:");
    console.log("  API Key:", process.env.RESEND_API_KEY ? "✅ Set" : "❌ Missing");
    console.log("  From Email:", fromEmail);
    console.log("  To Email:", toEmail);
    console.log("\n");

    try {
        console.log("📧 Sending test email...");

        const result = await resend.emails.send({
            from: fromEmail,
            to: toEmail,
            subject: "🧪 Questy Email Test",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #10b981;">Email Test Successful! ✅</h1>
                    <p>If you're reading this, your Resend email configuration is working correctly.</p>
                    
                    <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h2 style="margin-top: 0; color: #059669;">Configuration Details:</h2>
                        <p><strong>From:</strong> ${fromEmail}</p>
                        <p><strong>To:</strong> ${toEmail}</p>
                        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                    </div>
                    
                    <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                        This is a test email from your Questy platform.
                    </p>
                </div>
            `,
        });

        console.log("\n✅ Email sent successfully!");
        console.log("Result:", JSON.stringify(result, null, 2));
        console.log("\n📬 Check your inbox at:", toEmail);
        console.log("💡 If you don't see it, check your spam folder\n");

    } catch (error: any) {
        console.error("\n❌ Email sending failed!");
        console.error("Error:", error.message || error);

        if (error.statusCode) {
            console.error("Status Code:", error.statusCode);
        }

        if (error.name === "validation_error") {
            console.error("\n💡 Common issues:");
            console.error("   1. Invalid API key");
            console.error("   2. Invalid from email address");
            console.error("   3. Using onboarding@resend.dev requires domain verification");
            console.error("\n   Solution: Add and verify your own domain in Resend dashboard");
            console.error("   https://resend.com/domains\n");
        }

        process.exit(1);
    }
}

// Get email from command line argument
const toEmail = process.argv[2];

if (!toEmail) {
    console.error("❌ Please provide an email address:");
    console.error("   npx tsx scripts/test-email.ts your-email@example.com\n");
    process.exit(1);
}

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(toEmail)) {
    console.error("❌ Invalid email format:", toEmail);
    process.exit(1);
}

testEmail(toEmail);
