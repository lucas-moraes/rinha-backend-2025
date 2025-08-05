import { PrismaClient } from "@prisma/client";

interface IPaymentData {
  correlationId: string;
  amount: number;
  requestedAt: string;
}

export const recordPayment = async (prisma: PrismaClient, data: IPaymentData) => {
  try {
    await prisma.payment.create({
      data: {
        correlationId: data.correlationId,
        amount: data.amount,
        requestedAt: data.requestedAt,
        processedAt: null,
        provider: null,
      },
    });
  } catch (error) {
    console.error("Error recording payment:", error);
  }
};
