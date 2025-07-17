import { queue } from "./native.queue";
import { processPayment } from "../../application/use-cases/payment/processor.usecase";
import { recordPayment } from "../../application/use-cases/payment/record.usecase";
import { prisma } from "../../domain/index.domain";

type TQueue = { correlationId: string; amount: number; requestedAt: string };
type TBuffer = { correlationId: string; amount: number; requestedAt: string; processedAt: string; provider: string };

let buffer: Array<TBuffer> = [];

export const paymentQueue = async (data: TQueue) => {
  queue.add(data);

  const job = queue.dequeue();
  if (job) {
    try {
      const resp = (await processPayment(job)) as unknown as { processedAt: string; provider: string } | boolean;
      if (!resp) {
        return;
      }

      const respTrue = resp as { processedAt: string; provider: string };

      buffer.push({
        correlationId: job.correlationId,
        amount: job.amount,
        requestedAt: job.requestedAt,
        processedAt: respTrue.processedAt,
        provider: respTrue.provider,
      });

      if (buffer.length === 500) {
        await recordPayment(prisma, buffer);
        buffer = [];
      }
    } catch (error) {
      console.error("Error processing payment:", error);
    }
  }
};
