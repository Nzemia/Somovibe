import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== "TEACHER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const id = formData.get("id") as string;
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const subject = formData.get("subject") as string;
        const grade = formData.get("grade") as string;
        const price = formData.get("price") as string;

        if (!id || !title || !description || !subject || !grade || !price) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Verify ownership
        const material = await prisma.pdf.findUnique({
            where: { id },
            select: { teacherId: true },
        });

        if (!material) {
            return NextResponse.json({ error: "Material not found" }, { status: 404 });
        }

        if (material.teacherId !== user.id) {
            return NextResponse.json(
                { error: "Unauthorized: You do not own this material" },
                { status: 403 }
            );
        }

        // Update the material
        const updated = await prisma.pdf.update({
            where: { id },
            data: {
                title,
                description,
                subject,
                grade,
                price: parseInt(price, 10),
            },
        });

        return NextResponse.json({ success: true, material: updated });
    } catch (error) {
        console.error("[UPDATE_MATERIAL]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
