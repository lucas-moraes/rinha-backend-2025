import { CONFIG } from "../infra/configs/index.config";

type TProcessorStatus = { failing: boolean; minResponseTime: number };

export class CheckProcessorHealth {
  static readonly defaultProcessorUrl = CONFIG.PROCESSOR_DEFAULT;
  static readonly fallbackProcessorUrl = CONFIG.PROCESSOR_FALLBACK;

  static async checkHealth(): Promise<{
    defaultProcessorStatus: TProcessorStatus;
    fallbackProcessorStatus: TProcessorStatus;
  }> {
    const defaultStatus = await this.defaultProcessor();
    const fallbackStatus = await this.fallbackProcessor();

    return {
      defaultProcessorStatus: {
        failing: defaultStatus?.failing ?? false,
        minResponseTime: defaultStatus?.minResponseTime ?? 0,
      },
      fallbackProcessorStatus: {
        failing: fallbackStatus?.failing ?? false,
        minResponseTime: fallbackStatus?.minResponseTime ?? 0,
      },
    };
  }

  static async defaultProcessor(): Promise<TProcessorStatus> {
    return await fetch(this.defaultProcessorUrl + "/payments/service-health", {
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
  }

  static async fallbackProcessor(): Promise<TProcessorStatus> {
    return await fetch(this.fallbackProcessorUrl + "/payments/service-health", {
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
  }
}
