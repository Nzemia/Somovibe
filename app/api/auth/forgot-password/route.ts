import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        // Always return success to prevent email enumeration
        if (!user) {
            return NextResponse.json({
                message: "If an account exists, a reset link has been sent",
            });
        }

        // Check if user has a password (not OAuth-only)
        if (!user.password) {
            return NextResponse.json({
                message: "If an account exists, a reset link has been sent",
            });
        }

        // Delete any existing tokens for this email
        await prisma.passwordResetToken.deleteMany({
            where: { email },
        });

        // Generate reset token
        const token = crypto.randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + 3600000); // 1 hour

        await prisma.passwordResetToken.create({
            data: {
                email,
                token,
                expires,
            },
        });

        // Send email
        console.log("📧 Attempting to send password reset email to:", email);
        const emailResult = await sendPasswordResetEmail(email, token);

        if (!emailResult) {
            console.error("❌ Failed to send password reset email");
            // Still return success to prevent email enumeration
        } else {
            console.log("✅ Password reset email sent successfully");
        }

        return NextResponse.json({
            message: "If an account exists, a reset link has been sent",
        });
    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}
