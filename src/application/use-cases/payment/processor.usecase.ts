export const processPayment = async (data: { correlationId: string; amount: number; requestedAt: string }) => {
  let provider: "default" | "fallback";
  const { correlationId, amount, requestedAt } = data;
  const defaultProcessorUrl = `${process.env.PROCESSOR_DEFAULT}/payments`;
  const fallbackProcessorUrl = `${process.env.PROCESSOR_FALLBACK}/payments`;

  try {
    provider = "default";
    const defaultResponse = await fetch(defaultProcessorUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ correlationId, amount, requestedAt }),
    });

    if (!defaultResponse.ok) {
      throw new Error(`Default processor failed with status ${defaultResponse.status}`);
    }

    const processedAt = new Date().toISOString();
    return { correlationId, processedAt, provider };
  } catch (error) {
    provider = "fallback";
    const fallbackResponse = await fetch(fallbackProcessorUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ correlationId, amount, requestedAt }),
    });

    if (!fallbackResponse.ok) {
      throw new Error(`Fallback processor failed with status ${fallbackResponse.status}`);
    }
    const processedAt = new Date().toISOString();
    return { correlationId, processedAt, provider };
  }
};
