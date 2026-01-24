import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function TeacherPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const profile = await prisma.teacherProfile.findUnique({
        where: { userId: user.id },
    });

    if (!profile || !profile.isActive) {
        return <h1>Please complete Ksh 100 verification</h1>;
    }

    return <h1>Teacher Dashboard (Active)</h1>;
}
