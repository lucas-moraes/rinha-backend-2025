import { updatePayment } from "../../application/use-cases/payment/update.usecase";
import { recordPayment } from "../../application/use-cases/payment/record.usecase";
import { Queue } from "./native.queue";
import { processPayment } from "../../application/use-cases/payment/processor.usecase";

type TQueue = Record<string, string | number | boolean>;

export const paymentQueue = new Queue<TQueue>(async (data: TQueue) => {
  const { correlationId, amount, requestedAt } = data as { correlationId: string; amount: number; requestedAt: string };
  await recordPayment({ correlationId, amount, requestedAt });
  const resp = await processPayment({
    correlationId,
    amount,
    requestedAt,
  });
  await updatePayment(resp);
});
