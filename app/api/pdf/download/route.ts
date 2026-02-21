import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/apiAuth";

export async function GET(req: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const pdfId = searchParams.get("pdfId");

    if (!pdfId) {
      return NextResponse.json({ error: "PDF ID required" }, { status: 400 });
    }

    const purchase = await prisma.purchase.findUnique({
      where: {
        userId_pdfId: { userId: user.id, pdfId },
      },
      include: { pdf: true },
    });

    if (!purchase) {
      return NextResponse.json({ error: "You haven't purchased this material" }, { status: 403 });
    }

    const fileUrl = purchase.pdf.fileUrl;

    if (fileUrl.startsWith("placeholder-")) {
      return NextResponse.json({
        error:
          "This material is not available for download yet. The teacher needs to re-upload the file.",
      }, { status: 404 });
    }

    if (!fileUrl.startsWith("http")) {
      return NextResponse.json({
        error: "This file is no longer available. Please contact support.",
      }, { status: 404 });
    }

    const resp = await fetch(fileUrl);
    if (!resp.ok) {
      return NextResponse.json({ error: "Failed to download file" }, { status: 502 });
    }
    const blob = await resp.blob();

    return new NextResponse(blob, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${purchase.pdf.title}.pdf"`,
      },
    });
  } catch (error: unknown) {
    console.error("Download error:", error);
    return NextResponse.json({ error: "Failed to download" }, { status: 500 });
  }
}
