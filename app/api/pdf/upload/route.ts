import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireRole, handleAuthError } from "@/lib/apiAuth";
import { put } from "@vercel/blob";

export async function POST(req: Request) {
  try {
    const user = await requireRole("TEACHER");

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const subject = formData.get("subject") as string;
    const grade = formData.get("grade") as string;
    const price = Number(formData.get("price"));

    if (!file || !title || !description || !subject || !grade || !price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDFs allowed" }, { status: 400 });
    }

    const pathname = `${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const blob = await put(pathname, buffer, {
      access: "public",
      contentType: "application/pdf",
    });

    const pdf = await prisma.pdf.create({
      data: {
        title,
        description,
        subject,
        grade,
        price,
        fileUrl: blob.url,
        teacherId: user.id,
      },
    });

    return NextResponse.json(pdf);
  } catch (error: unknown) {
    console.error("Upload error:", error);
    return handleAuthError(error);
  }
}
