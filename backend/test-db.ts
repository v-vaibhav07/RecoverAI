import "dotenv/config";
import { PrismaClient } from "./generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
    adapter,
});

async function testDatabase() {
    try {
        await prisma.$connect();

        console.log("✅ Database connected successfully!");

        const result = await prisma.$queryRaw`SELECT NOW()`;

        console.log("🕒 Database time:", result);
    } catch (error) {
        console.error("❌ Database connection failed:");
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

testDatabase();