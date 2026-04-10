import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { email, password, role } = await req.json();

        if (!email || !password) {
            // OLD: return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
            return NextResponse.json(
                { error: "Please enter both email and password" },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            // OLD: return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
            return NextResponse.json(
                { error: "Password must be at least 6 characters long" },
                { status: 400 }
            );
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            // OLD: return NextResponse.json({ error: "User already exists" }, { status: 400 });
            return NextResponse.json(
                { error: "An account with this email already exists. Please log in instead" },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await hash(password, 12);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: role || "STUDENT",
            },
        });

        // If teacher, create teacher profile
        if (role === "TEACHER") {
            await prisma.teacherProfile.create({
                data: {
                    userId: user.id,
                    isActive: false,
                },
            });
        }

        await createSession(user.id);

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Registration error:", error);
        // OLD: return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
        return NextResponse.json(
            { error: "Registration failed. Please try again" },
            { status: 500 }
        );
    }
}
