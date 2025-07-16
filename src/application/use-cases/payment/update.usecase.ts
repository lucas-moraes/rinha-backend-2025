import { PrismaClient } from ".prisma/client";

export const updatePayment = async (
  prisma: PrismaClient,
  data: { correlationId: string; processedAt: string; provider: string },
) => {
  const { correlationId, processedAt, provider } = data;

  try {
    await prisma.payment.update({
      where: { correlationId },
      data: { processedAt, provider },
    });
  } catch (error) {
    console.error("Error updating payment:", error);
  }
};
