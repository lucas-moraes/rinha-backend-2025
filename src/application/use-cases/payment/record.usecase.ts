import { PrismaClient } from "@prisma/client";

export const recordPayment = async (
  prisma: PrismaClient,
  correlationId: string,
  amount: number,
  requestedAt: string,
) => {
  await prisma.payment
    .create({
      data: {
        correlationId,
        amount,
        requestedAt,
      },
    })
    .catch((error: any) => {
      console.error("Error recording payment:", error);
    });
};
