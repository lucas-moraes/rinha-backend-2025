import { memoryStore } from "../../../infra/tools/store.tools";

export const processPayment = async (data: {
  correlationId: string;
  amount: number;
  requestedAt: string;
}): Promise<{ correlationId: string; processedAt: string; provider: string }> => {
  let provider: "default" | "fallback";
  const { correlationId, amount, requestedAt } = data;
  const defaultProcessorUrl = `${process.env.PROCESSOR_DEFAULT}`;
  const fallbackProcessorUrl = `${process.env.PROCESSOR_FALLBACK}`;

  const store = memoryStore.get();

  const sendToDefaultProcessor = async (timeout: number) => {
    provider = "default";
    try {
      const defaultResponse = await fetch(defaultProcessorUrl + "/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ correlationId, amount, requestedAt }),
        signal: AbortSignal.timeout(timeout),
      });

      if (!defaultResponse.ok) {
        return await sendToFallbackProcessor();
      }

      const processedAt = new Date().toISOString();
      return { correlationId, processedAt, provider };
    } catch (error) {
      console.error("Error sending to default processor:", error);
      return await sendToFallbackProcessor();
    }
  };

  const sendToFallbackProcessor = async () => {
    provider = "fallback";
    await fetch(fallbackProcessorUrl + "/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ correlationId, amount, requestedAt }),
    });

    const processedAt = new Date().toISOString();
    return { correlationId, processedAt, provider };
  };

  if (store) {
    const timeout = Math.max(
      100,
      Math.min(store.defaultProcessorStatus.minResponseTime, store.fallbackProcessorStatus.minResponseTime),
    );
    if (store?.defaultProcessorStatus?.failing) {
      return await sendToFallbackProcessor();
    }
    if (store?.fallbackProcessorStatus?.failing) {
      return await sendToDefaultProcessor(timeout);
    }

    if (store?.defaultProcessorStatus?.minResponseTime < store?.fallbackProcessorStatus?.minResponseTime) {
      return await sendToDefaultProcessor(timeout);
    } else if (store?.defaultProcessorStatus?.minResponseTime > store?.fallbackProcessorStatus?.minResponseTime) {
      return await sendToFallbackProcessor();
    }
  }
  return await sendToDefaultProcessor(100);
};
