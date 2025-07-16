import { updatePayment } from "../../application/use-cases/payment/update.usecase";
import { queue } from "./native.queue";
import { processPayment } from "../../application/use-cases/payment/processor.usecase";
import { PrismaClient } from ".prisma/client";
import { recordPayment } from "../../application/use-cases/payment/record.usecase";

type TQueue = { correlationId: string; amount: number; requestedAt: string };

export const paymentQueue = async (prisma: PrismaClient, data: TQueue) => {
  queue.add(data);
  await recordPayment(prisma, data.correlationId, data.amount, data.requestedAt);
  const job = queue.dequeue();
  if (job) {
    try {
      const { correlationId, processedAt, provider } = await processPayment(job);
      await updatePayment(prisma, correlationId, processedAt, provider);
    } catch (error) {
      console.error("Error processing payment:", error);
    }
  }
};
