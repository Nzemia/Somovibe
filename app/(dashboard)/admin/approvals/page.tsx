import { prisma } from "@/lib/prisma";
import type { PdfModel } from "@/app/generated/prisma/models";

export default async function AdminApprovals() {
    const pdfs = await prisma.pdf.findMany({
        where: { status: "PENDING" },
    });

    return (
        <div>
            <h1>Pending PDFs</h1>
            {pdfs.map((pdf: PdfModel) => (
                <div key={pdf.id}>
                    <p>{pdf.title}</p>
                    <form action="/api/pdf/approve" method="POST">
                        <input type="hidden" name="pdfId" value={pdf.id} />
                        <button>Approve</button>
                    </form>
                </div>
            ))}
        </div>
    );
}
