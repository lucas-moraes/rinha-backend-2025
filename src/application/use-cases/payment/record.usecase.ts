import { PrismaClient } from "@prisma/client";

interface IPaymentData {
  correlationId: string;
  amount: number;
  requestedAt: string;
  processedAt: string;
  provider: string;
}

export const recordPayment = async (prisma: PrismaClient, buffer: Array<IPaymentData>) => {
  await prisma.payment
    .createMany({
      data: buffer,
    })
    .catch((error: any) => {
      console.error("Error recording payment:", error);
    });
};
