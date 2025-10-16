import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  globalThis.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

export async function connectDB(): Promise<void> {
  try {
    await prisma.$connect();
    console.log("✅ Prisma connected to database");
  } catch (err) {
    console.error("❌ Prisma connection failed:", err);
  }
}
