import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import EditMaterialForm from "./EditMaterialForm";

export default async function EditMaterialPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const user = await getCurrentUser();
    const { id } = await params;

    if (!user || user.role !== "TEACHER") {
        redirect("/");
    }

    const material = await prisma.pdf.findUnique({
        where: { id },
        select: {
            id: true,
            title: true,
            description: true,
            subject: true,
            grade: true,
            price: true,
            teacherId: true,
            materialType: true,
        },
    });

    if (!material) {
        notFound();
    }

    if (material.teacherId !== user.id) {
        redirect("/teacher");
    }

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-24 sm:pb-10">
            <EditMaterialForm material={material} />
        </div>
    );
}
