import { memoryStore } from "../../../infra/tools/store.tools";
import { queue } from "../../../infra/queue/native.queue";

interface IPaymentData {
  correlationId: string;
  amount: number;
  requestedAt: string;
}

interface IPaymentResponse {
  correlationId: string;
  processedAt: string;
  provider: string;
}

const sendToDefaultProcessor = async (timeout: number, data: IPaymentData): Promise<IPaymentResponse | boolean> => {
  const defaultProcessorUrl = `${process.env.PROCESSOR_DEFAULT}`;

  try {
    const defaultResponse = await fetch(defaultProcessorUrl + "/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(timeout),
    });

    if (!defaultResponse.ok) {
      throw new Error(`Default returned HTTP ${defaultResponse.status}`);
    }

    return { correlationId: data.correlationId, processedAt: new Date().toISOString(), provider: "default" };
  } catch (error) {
    return false;
  }
};

const sendToFallbackProcessor = async (timeout: number, data: IPaymentData): Promise<IPaymentResponse | boolean> => {
  const fallbackProcessorUrl = `${process.env.PROCESSOR_FALLBACK}`;
  try {
    const falbackResponse = await fetch(fallbackProcessorUrl + "/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(timeout),
    });

    if (!falbackResponse.ok) {
      throw new Error(`Default returned HTTP ${falbackResponse.status}`);
    }

    return { correlationId: data.correlationId, processedAt: new Date().toISOString(), provider: "fallback" };
  } catch (error) {
    queue.add(data);
    return false;
  }
};

export const processPayment = async (data: IPaymentData): Promise<IPaymentResponse | boolean | undefined> => {
  const store = memoryStore.get();

  if (store) {
    const timeout =
      Math.max(
        5000,
        Math.min(store.defaultProcessorStatus.minResponseTime, store.fallbackProcessorStatus.minResponseTime),
      ) || 5000;

    // console.log(`=> timeout`, timeout);
    // console.log(`=> default`, store.defaultProcessorStatus.minResponseTime);
    // console.log(`=> fallback`, store.fallbackProcessorStatus.minResponseTime);

    if (store?.defaultProcessorStatus?.failing && store?.fallbackProcessorStatus?.failing) {
      queue.add(data);
      return false;
    }

    if (store?.defaultProcessorStatus?.failing) {
      return await sendToFallbackProcessor(timeout, data);
    }

    if (store?.fallbackProcessorStatus?.failing) {
      return await sendToDefaultProcessor(timeout, data);
    }

    if (store?.defaultProcessorStatus?.minResponseTime < store?.fallbackProcessorStatus?.minResponseTime) {
      return await sendToDefaultProcessor(timeout, data);
    }

    if (store?.defaultProcessorStatus?.minResponseTime > store?.fallbackProcessorStatus?.minResponseTime) {
      return await sendToFallbackProcessor(timeout, data);
    }
  }
  return await sendToDefaultProcessor(5000, data);
};
