import { queue } from "./native.queue";
import { processPayment } from "../../application/use-cases/payment/processor.usecase";
import { prisma } from "../../domain/index.domain";
import { updatePayment } from "../../application/use-cases/payment/update.usecase";

type TQueue = { correlationId: string; amount: number; requestedAt: string };
type TReponseProcessor = { correlationId: string; processedAt: string; provider: string };

let isProcessing = false;

export const paymentQueue = async (data: TQueue) => {
  queue.add(data);
  await updatePayment(prisma, data.correlationId, data.amount, data.requestedAt, null, null);

  if (!isProcessing) {
    void processAll();
  }
};

const processAll = async () => {
  isProcessing = true;
  try {
    let job: TQueue | undefined;
    while ((job = queue.dequeue())) {
      try {
        const resp = (await processPayment(job)) as unknown as TReponseProcessor | boolean;

        if (!resp) continue;

        const respTrue = resp as TReponseProcessor;

        await updatePayment(
          prisma,
          respTrue.correlationId,
          job.amount,
          job.requestedAt,
          respTrue.processedAt,
          respTrue.provider,
        );
      } catch (error) {
        queue.add(job);
      }
    }
  } finally {
    isProcessing = false;
  }
};
