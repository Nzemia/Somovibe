import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function POST(req: NextRequest) {
    try {
        const { token, password } = await req.json();

        if (!token || !password) {
            return NextResponse.json(
                { error: "Token and password are required" },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: "Password must be at least 6 characters" },
                { status: 400 }
            );
        }

        // Find valid token
        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token },
        });

        if (!resetToken) {
            return NextResponse.json(
                { error: "Invalid or expired token" },
                { status: 400 }
            );
        }

        if (resetToken.expires < new Date()) {
            await prisma.passwordResetToken.delete({
                where: { token },
            });
            return NextResponse.json(
                { error: "Token has expired" },
                { status: 400 }
            );
        }

        // Hash new password
        const hashedPassword = await hash(password, 10);

        // Update user password
        await prisma.user.update({
            where: { email: resetToken.email },
            data: { password: hashedPassword },
        });

        // Delete used token
        await prisma.passwordResetToken.delete({
            where: { token },
        });

        return NextResponse.json({
            message: "Password reset successfully",
        });
    } catch (error) {
        console.error("Reset password error:", error);
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}
