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

    console.log('✅ Platform admin created:', admin.email);
    console.log('✅ Admin ID:', admin.id);
    console.log('\n📝 Add this to your .env file:');
    console.log(`PLATFORM_ADMIN_ID="${admin.id}"`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
