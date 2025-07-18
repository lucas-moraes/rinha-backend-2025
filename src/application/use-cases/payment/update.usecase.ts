import { PrismaClient } from "@prisma/client";

export const updatePayment = async (
  prisma: PrismaClient,
  correlationId: string,
  amount: number,
  requestedAt: string,
  processedAt: string | null,
  provider: string | null,
) => {
  try {
    await prisma.payment.upsert({
      where: { correlationId },
      update: { processedAt, provider },
      create: {
        correlationId,
        amount,
        requestedAt,
        processedAt,
        provider,
      },
    });
  } catch (error) {
    console.error("Error updating payment:", error);
  }
};
