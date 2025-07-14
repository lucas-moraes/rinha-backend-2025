import { PrismaClient } from ".prisma/client";

export const recordPayment = async (data: { correlationId: string; amount: number; requestedAt: string }) => {
  const prisma = new PrismaClient();
  await prisma.payment
    .create({
      data,
    })
    .catch((error: any) => {
      console.error("Error recording payment:", error);
    })
    .finally(() => {
      prisma.$disconnect();
    });
};
