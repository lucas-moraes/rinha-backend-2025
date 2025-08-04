import { PaymentDto } from "../domain/payments.dto";
import { memoryStore, TStore } from "../store/index.store";
import { CONFIG } from "../infra/configs/index.config";
import { PrismaClient } from "@prisma/client";

export class ProcessmentApplication {
  private prisma: PrismaClient = new PrismaClient();
  private store: TStore | undefined;
  isProcessing: boolean = false;

  constructor() {
    this.prisma
      .$connect()
      .then(() => {
        console.log("Worker 1: ✅ Prisma connected successfully");
        this.timer();
      })
      .catch((error) => {
        console.error("Worker 1: ❌ Prisma connection error", error);
        process.exit(1);
      });
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
          ? 300
          : this.store?.defaultProcessorStatus?.minResponseTime;
      const dFailing: boolean | undefined = this.store?.defaultProcessorStatus?.failing;
      const fTime: number | undefined =
        this.store?.fallbackProcessorStatus?.minResponseTime === 0
          ? 300
          : this.store?.fallbackProcessorStatus?.minResponseTime;
      const fFailing: boolean | undefined = this.store?.fallbackProcessorStatus?.failing;

      const { data }: { data: PaymentDto | undefined } = await fetch(`http://localhost:9696/queue/dequeue/1`, {
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

      if (!data) {
        this.isProcessing = false;
        break;
      }

      if (dTime === undefined || fTime === undefined) this.defaultProcessor(1000, data);
      if (dTime! < fTime!) this.defaultProcessor(dTime! * 1.5, data);
      if (dTime! > fTime!) this.fallbackProcessor(fTime! * 1.5, data);
      if (dTime! === fTime!) {
        if (dFailing) this.fallbackProcessor(fTime! * 1.5, data);
        if (fFailing) this.defaultProcessor(dTime! * 1.5, data);
        this.defaultProcessor(dTime! * 1.5, data);
      }
    }
  }

  private async defaultProcessor(timeout: number, data: PaymentDto): Promise<void> {
    const defaultProcessorUrl = `${CONFIG.PROCESSOR_DEFAULT}/payments`;

    try {
      const defaultResponse = await fetch(defaultProcessorUrl, {
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

      if (!defaultResponse.ok) {
        if (defaultResponse.status === 500) {
          throw new Error("Fallback processor is overloaded");
        }
        return;
      }

      await this.prisma.payment.create({
        data: {
          correlationId: data.correlationId,
          amount: data.amount,
          requestedAt: data.requestedAt,
          processedAt: new Date().toISOString(),
          provider: "default",
        },
      });
    } catch (error) {
      const time =
        (this.store?.fallbackProcessorStatus?.minResponseTime! > 0
          ? this.store?.fallbackProcessorStatus?.minResponseTime!
          : 1000) ?? 1000;
      await this.fallbackProcessor(time, data);
    }
  }

  private async fallbackProcessor(timeout: number, data: PaymentDto): Promise<void> {
    const fallbackProcessorUrl = `${CONFIG.PROCESSOR_FALLBACK}/payments`;

    try {
      const falbackResponse = await fetch(fallbackProcessorUrl, {
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

      if (!falbackResponse.ok) {
        if (falbackResponse.status === 500) {
          throw new Error("Fallback processor is overloaded");
        }
        return;
      }

      await this.prisma.payment.create({
        data: {
          correlationId: data.correlationId,
          amount: data.amount,
          requestedAt: data.requestedAt,
          processedAt: new Date().toISOString(),
          provider: "fallback",
        },
      });
    } catch (error) {
      await fetch(`http://localhost:9696/queue/enqueue`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          correlationId: data.correlationId,
          amount: data.amount,
          requestedAt: data.requestedAt,
          worker: 1,
        }),
      });
    }
  }
}
