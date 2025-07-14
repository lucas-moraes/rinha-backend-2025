import { PrismaClient } from ".prisma/client";

export const updatePayment = async (data: { correlationId: string; processedAt: string; provider: string }) => {
  const { correlationId, processedAt, provider } = data;
  const prisma = new PrismaClient();

  try {
    await prisma.payment.update({
      where: { correlationId },
      data: { processedAt, provider },
    });
  } catch (error) {
    console.error("Error updating payment:", error);
  } finally {
    await prisma.$disconnect();
  }
};
