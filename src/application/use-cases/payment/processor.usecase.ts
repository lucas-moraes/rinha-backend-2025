import { memoryStore } from "../../../infra/tools/store.tools";

export const processPayment = async (data: { correlationId: string; amount: number; requestedAt: string }) => {
  let provider: "default" | "fallback";
  const { correlationId, amount, requestedAt } = data;
  const defaultProcessorUrl = `${process.env.PROCESSOR_DEFAULT}`;
  const fallbackProcessorUrl = `${process.env.PROCESSOR_FALLBACK}`;

  const store = memoryStore.get();

  const sendToDefaultProcessor = async (timeout: number) => {
    provider = "default";
    const defaultResponse = await fetch(defaultProcessorUrl + "/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ correlationId, amount, requestedAt }),
      signal: AbortSignal.timeout(timeout),
    });

    if (!defaultResponse.ok) {
      sendToFallbackProcessor();
    }

    const processedAt = new Date().toISOString();
    return { correlationId, processedAt, provider };
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
    const timeout =
      Math.min(store.defaultProcessorStatus?.minResponseTime, store.fallbackProcessorStatus?.minResponseTime) || 100;
    if (store?.defaultProcessorStatus?.failing) {
      return sendToFallbackProcessor();
    }
    if (store?.fallbackProcessorStatus?.failing) {
      return sendToDefaultProcessor(timeout);
    }

    if (store?.defaultProcessorStatus?.minResponseTime < store?.fallbackProcessorStatus?.minResponseTime) {
      return sendToDefaultProcessor(timeout);
    } else if (store?.defaultProcessorStatus?.minResponseTime > store?.fallbackProcessorStatus?.minResponseTime) {
      return sendToFallbackProcessor();
    }
  } else {
    sendToDefaultProcessor(100);
  }
};
