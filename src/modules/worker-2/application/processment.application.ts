import { PaymentDto } from "../domain/payments.dto";
import { memoryStore, TStore } from "../store/index.store";
import { CONFIG } from "../infra/configs/index.config";
import { db } from "../../../database/connection";

export class ProcessmentApplication {
  private db: typeof db;
  private store: TStore | undefined;
  isProcessing: boolean = false;

  constructor() {
    this.db = db;
    this.timer();
  }

  private async timer(): Promise<void> {
    setInterval(async () => {
      const taskQuantity = await fetch(`http://localhost:9696/queue/items-in-queue`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          return 0;
        })
        .catch(() => {
          return 0;
        });

      if (taskQuantity?.data > 0 && !this.isProcessing) {
        this.executeProcess();
      }
    }, 500);
  }

  private async executeProcess(): Promise<void> {
    while (true) {
      this.store = memoryStore.get();

      const dTime: number | undefined =
        this.store?.defaultProcessorStatus?.minResponseTime === 0
          ? 1000
          : this.store?.defaultProcessorStatus?.minResponseTime;
      const dFailing: boolean | undefined = this.store?.defaultProcessorStatus?.failing;
      const fTime: number | undefined =
        this.store?.fallbackProcessorStatus?.minResponseTime === 0
          ? 1000
          : this.store?.fallbackProcessorStatus?.minResponseTime;
      const fFailing: boolean | undefined = this.store?.fallbackProcessorStatus?.failing;

      const jobs = await fetch(`http://localhost:9696/queue/dequeue/2`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          return undefined;
        })
        .catch(() => {
          return undefined;
        });

      if (jobs?.data === null || jobs?.data === undefined) {
        this.isProcessing = false;
        break;
      }

      if (dFailing && fFailing) return this.Reenqueue(jobs.data);
      if (dTime === undefined || fTime === undefined) return this.defaultProcessor(1000, jobs.data);
      if (dTime! < fTime!) return this.defaultProcessor(dTime!, jobs.data);
      if (dTime! > fTime!) return this.fallbackProcessor(fTime!, jobs.data);
      if (dTime! === fTime!) {
        if (dFailing) return this.fallbackProcessor(fTime!, jobs.data);
        if (fFailing) return this.defaultProcessor(dTime!, jobs.data);
        return this.defaultProcessor(dTime!, jobs.data);
      }
    }
  }

  private async defaultProcessor(timeout: number, data: PaymentDto): Promise<void> {
    try {
      const defaultResponse = await fetch(`${CONFIG.PROCESSOR_DEFAULT}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          correlationId: data.correlationId,
          amount: data.amount,
          requestedAt: data.requestedAt,
        }),
        signal: AbortSignal.timeout(timeout),
      });

      if (defaultResponse.ok) {
        await this.db.query(
          `INSERT INTO payments (correlation_id, amount, requested_at, processed_at, provider)
            VALUES ($1, $2, $3, $4, $5)`,
          [data.correlationId, data.amount, data.requestedAt, new Date().toISOString(), "default"],
        );
      }

      if (!defaultResponse.ok && defaultResponse.status === 500) {
        throw new Error("Fallback processor is overloaded");
      }
    } catch (error) {
      const time =
        (this.store?.fallbackProcessorStatus?.minResponseTime! > 0
          ? this.store?.fallbackProcessorStatus?.minResponseTime!
          : 1000) ?? 1000;
      await this.fallbackProcessor(time, data);
    }
  }

  private async fallbackProcessor(timeout: number, data: PaymentDto): Promise<void> {
    try {
      const falbackResponse = await fetch(`${CONFIG.PROCESSOR_FALLBACK}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          correlationId: data.correlationId,
          amount: data.amount,
          requestedAt: data.requestedAt,
        }),
        signal: AbortSignal.timeout(timeout),
      });

      if (falbackResponse.ok) {
        await this.db.query(
          `INSERT INTO payments (correlation_id, amount, requested_at, processed_at, provider)
            VALUES ($1, $2, $3, $4, $5)`,
          [data.correlationId, data.amount, data.requestedAt, new Date().toISOString(), "fallback"],
        );
      }

      if (!falbackResponse.ok && falbackResponse.status === 500) {
        throw new Error("Fallback processor is overloaded");
      }
    } catch (error) {
      await this.Reenqueue(data);
    }
  }

  private async Reenqueue(data: PaymentDto): Promise<void> {
    await fetch(`http://localhost:9696/queue/enqueue`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        correlationId: data.correlationId,
        amount: data.amount,
        requestedAt: data.requestedAt,
        worker: 2,
      }),
    });
  }
}
