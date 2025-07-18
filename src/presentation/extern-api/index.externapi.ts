type TProcessorStatus = { failing: boolean; minResponseTime: number };

export async function CheckProcessorHealth() {
  const defaultProcessorUrl = `${process.env.PROCESSOR_DEFAULT}`;
  const fallbackProcessorUrl = `${process.env.PROCESSOR_FALLBACK}`;

  const _d: TProcessorStatus = await fetch(defaultProcessorUrl + "/payments/service-health", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
    })
    .catch(() => {
      return { failing: true, minResponseTime: 0 };
    });

  const _f: TProcessorStatus = await fetch(fallbackProcessorUrl + "/payments/service-health", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
    })
    .catch(() => {
      return { failing: true, minResponseTime: 0 };
    });

  return {
    defaultProcessorStatus: {
      failing: _d?.failing ?? false,
      minResponseTime: _d?.minResponseTime ?? 0,
    },
    fallbackProcessorStatus: {
      failing: _f?.failing ?? false,
      minResponseTime: _f?.minResponseTime ?? 0,
    },
  };
}
