import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { randomBytes } from "crypto"

export async function POST(req: Request) {
    try {
        const { email, phone } = await req.json()

        if (!email || !phone) {
            return NextResponse.json(
                { error: "Email and phone required" },
                { status: 400 }
            )
        }

        // Check if user exists
        let user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            return NextResponse.json(
                {
                    error: "User not found. Please sign up first."
                },
                { status: 404 }
            )
        }

        // Check if already a teacher
        const existingProfile =
            await prisma.teacherProfile.findUnique({
                where: { userId: user.id }
            })

        if (existingProfile?.isActive) {
            return NextResponse.json(
                { error: "Already an active teacher" },
                { status: 400 }
            )
        }

        // Normalize phone to 254XXXXXXXXX format before any lookups or storage
        let formattedPhone = phone.replace(/\s+/g, "")
        if (formattedPhone.startsWith("+")) {
            formattedPhone = formattedPhone.substring(1)
        }
        if (formattedPhone.startsWith("0")) {
            formattedPhone =
                "254" + formattedPhone.substring(1)
        }
        if (!/^254\d{9}$/.test(formattedPhone)) {
            return NextResponse.json(
                {
                    error: "Invalid phone number format. Use 254XXXXXXXXX"
                },
                { status: 400 }
            )
        }

        // Update user phone if not set
        if (!user.phone) {
            // Check if phone is already taken by another user
            const existingPhone =
                await prisma.user.findUnique({
                    where: { phone: formattedPhone }
                })

            if (
                existingPhone &&
                existingPhone.id !== user.id
            ) {
                return NextResponse.json(
                    {
                        error: "Phone number already registered to another account"
                    },
                    { status: 400 }
                )
            }

            user = await prisma.user.update({
                where: { id: user.id },
                data: { phone: formattedPhone }
            })
        } else if (user.phone !== formattedPhone) {
            // User has a phone but trying to use a different one
            return NextResponse.json(
                {
                    error: "Phone number mismatch. Please use your registered phone number."
                },
                { status: 400 }
            )
        }

        // Update role to TEACHER
        await prisma.user.update({
            where: { id: user.id },
            data: { role: "TEACHER" }
        })

        // Create or get teacher profile
        if (!existingProfile) {
            await prisma.teacherProfile.create({
                data: {
                    userId: user.id,
                    isActive: false
                }
            })
        }

        // Generate unique reference code
        const referenceCode = `TCH-${randomBytes(6).toString("hex").toUpperCase()}`

        // Create pending payment
        await prisma.pendingPayment.create({
            data: {
                userId: user.id,
                phone: formattedPhone, // Always store normalized 254XXXXXXXXX format
                amount: 100, // Testing amount
                type: "TEACHER_VERIFICATION",
                referenceCode
            }
        })

        return NextResponse.json({
            message:
                "Teacher profile created. Please complete KES 100 verification payment.",
            referenceCode
        })
    } catch (error: any) {
        console.error("Teacher registration error:", error)
        return NextResponse.json(
            {
                error:
                    error.message ||
                    "Failed to register teacher"
            },
            { status: 500 }
        )
    }
}
