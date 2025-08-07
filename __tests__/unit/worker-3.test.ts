import { CheckProcessorHealth } from "../../src/modules/worker-3/foreign/api-process-health.foreign";
import { ProcessmentApplication } from "../../src/modules/worker-3/application/processment.application";
import { memoryStore } from "../../src/modules/worker-3/store/index.store";

global.fetch = jest.fn();

jest.mock("../../src/modules/worker-3/store/index.store", () => ({
  memoryStore: {
    get: jest.fn(),
  },
}));

jest.mock("../../src/database/connection", () => ({
  db: {
    query: jest.fn(),
  },
}));

jest.mock("../../src/modules/worker-3/foreign/api-process-health.foreign", () => ({
  CheckProcessorHealth: {
    checkHealth: jest.fn(),
  },
}));

describe("Worker-3", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("Should run CheckProcessorHealth class", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      status: 200,
      json: async () => ({ data: 1 }),
    } as never);

    (CheckProcessorHealth.checkHealth as jest.Mock).mockResolvedValueOnce({
      defaultProcessorStatus: { failing: false, minResponseTime: 100 },
      fallbackProcessorStatus: { failing: false, minResponseTime: 200 },
    } as never);

    const response = await CheckProcessorHealth.checkHealth();

    expect(response.defaultProcessorStatus.failing).toBe(false);
    expect(response.defaultProcessorStatus.minResponseTime).toBe(100);
    expect(response.fallbackProcessorStatus.failing).toBe(false);
    expect(response.fallbackProcessorStatus.minResponseTime).toBe(200);
  });

  it("Should call fetch and process init if it have new tasks", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          correlationId: "abc",
          amount: 100,
          requestedAt: new Date().toISOString(),
        },
      }),
    } as never);

    (memoryStore.get as jest.Mock).mockReturnValue({
      defaultProcessorStatus: { minResponseTime: 100, failing: false },
      fallbackProcessorStatus: { minResponseTime: 200, failing: false },
    });
    new ProcessmentApplication();

    jest.advanceTimersByTime(600);

    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("items-in-queue"), expect.anything());
  });

  it("Should requeue when both processors fail", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 1 }),
      } as never)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            correlationId: "abc",
            amount: 100,
            requestedAt: new Date().toISOString(),
            processedAt: null,
            provider: null,
          },
        }),
      } as never)
      .mockResolvedValueOnce({ ok: false, status: 500 } as never)
      .mockResolvedValueOnce({ ok: false, status: 500 } as never)
      .mockResolvedValueOnce({ ok: true } as never);

    (memoryStore.get as jest.Mock).mockReturnValue({
      defaultProcessorStatus: { minResponseTime: 100, failing: false },
      fallbackProcessorStatus: { minResponseTime: 100, failing: false },
    });

    new ProcessmentApplication();
    await jest.advanceTimersByTimeAsync(1100);
    await Promise.resolve();

    expect(fetch).toHaveBeenCalled();
  });
});
