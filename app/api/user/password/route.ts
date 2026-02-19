import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAuth, handleAuthError } from "@/lib/apiAuth";
import { hash, compare } from "bcryptjs";

export async function POST(req: Request) {
    try {
        const user = await requireAuth();
        const { currentPassword, newPassword } = await req.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { error: "Current password and new password are required" },
                { status: 400 }
            );
        }

        // Validate new password strength
        if (newPassword.length < 6) {
            return NextResponse.json(
                { error: "New password must be at least 6 characters long" },
                { status: 400 }
            );
        }

        // Get user with password
        const userWithPassword = await prisma.user.findUnique({
            where: { id: user.id },
            select: { password: true },
        });

        if (!userWithPassword) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check if user has a password (OAuth users might not)
        if (!userWithPassword.password) {
            return NextResponse.json(
                { error: "Cannot change password for OAuth accounts. Please use your OAuth provider to manage your password." },
                { status: 400 }
            );
        }

        // Verify current password
        const isValidPassword = await compare(currentPassword, userWithPassword.password);

        if (!isValidPassword) {
            return NextResponse.json(
                { error: "Current password is incorrect" },
                { status: 401 }
            );
        }

        // Hash new password
        const hashedPassword = await hash(newPassword, 10);

        // Update password
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        });

        console.log(`✅ Password updated for user: ${user.email}`);

        return NextResponse.json({
            message: "Password updated successfully"
        });
    } catch (error) {
        console.error("Password update error:", error);
        return handleAuthError(error);
    }
}
