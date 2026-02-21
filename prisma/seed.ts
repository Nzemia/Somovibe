import { prisma } from "../lib/prisma";

async function main() {
    // Create platform admin user
    const admin = await prisma.user.upsert({
        where: { email: "admin@questy.app" },
        update: {},
        create: {
            email: "admin@questy.app",
            role: "ADMIN",
        },
    });

    // Create platform wallet for admin
    await prisma.wallet.upsert({
        where: { userId: admin.id },
        update: {},
        create: {
            userId: admin.id,
            balance: 0,
        },
    });


}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
