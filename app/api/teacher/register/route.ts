import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

export async function POST(req: Request) {
    const { email, phone } = await req.json();

    if (!email || !phone) {
        return NextResponse.json({ error: "Email and phone required" }, { status: 400 });
    }

    // Check if user exists
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        return NextResponse.json({ error: "User not found. Please sign up first." }, { status: 404 });
    }

    // Check if already a teacher
    const existingProfile = await prisma.teacherProfile.findUnique({
        where: { userId: user.id },
    });

    if (existingProfile?.isActive) {
        return NextResponse.json({ error: "Already an active teacher" }, { status: 400 });
    }

    // Update user phone if not set
    if (!user.phone) {
        user = await prisma.user.update({
            where: { id: user.id },
            data: { phone },
        });
    }

    // Update role to TEACHER
    await prisma.user.update({
        where: { id: user.id },
        data: { role: "TEACHER" },
    });

    // Create or get teacher profile
    if (!existingProfile) {
        await prisma.teacherProfile.create({
            data: {
                userId: user.id,
                isActive: false,
            },
        });
    }

    // Generate unique reference code
    const referenceCode = `TCH-${randomBytes(6).toString("hex").toUpperCase()}`;

    // Create pending payment
    await prisma.pendingPayment.create({
        data: {
            userId: user.id,
            phone,
            amount: 1, // Testing amount 
            type: "TEACHER_VERIFICATION",
            referenceCode,
        },
    });

    return NextResponse.json({
        message: "Teacher profile created. Please complete KES 100 verification payment.",
        referenceCode,
    });
}
