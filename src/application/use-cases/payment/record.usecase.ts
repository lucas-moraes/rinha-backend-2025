import { PrismaClient } from "@prisma/client";

export const recordPayment = async (
  prisma: PrismaClient,
  data: { correlationId: string; amount: number; requestedAt: string },
) => {
  await prisma.payment
    .create({
      data,
    })
    .catch((error: any) => {
      console.error("Error recording payment:", error);
    });
};
