import { prisma } from "../lib/prisma";

async function main() {
    await prisma.user.upsert({
        where: { email: "admin@questy.app" },
        update: {},
        create: {
            email: "admin@questy.app",
            role: "ADMIN",
        },
    });
}

main();
