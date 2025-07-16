import { updatePayment } from "../../application/use-cases/payment/update.usecase";
import { queue } from "./native.queue";
import { processPayment } from "../../application/use-cases/payment/processor.usecase";
import { PrismaClient } from ".prisma/client";
import { recordPayment } from "../../application/use-cases/payment/record.usecase";

type TQueue = { correlationId: string; amount: number; requestedAt: string };

export const paymentQueue = async (prisma: PrismaClient, data: TQueue) => {
  queue.add(data);
  await recordPayment(prisma, data);
  const job = queue.dequeue();
  if (job) {
    try {
      const resultProcess = await processPayment(job);
      await updatePayment(prisma, resultProcess!);
    } catch (error) {
      console.error("Error processing payment:", error);
    }
  }
};
