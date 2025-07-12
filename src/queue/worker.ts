import { Worker, Job } from "bullmq";
import axios from "axios";
import { connection } from "./index";
import { paymentService } from "../payments/payment.service";
import { CONFIG } from "../config";
import { HealthService } from "../health/health.service";

const healthSvc = new HealthService();

new Worker(
  "payments",
  async (job: Job) => {
    const { correlationId, amount, requestedAt } = job.data as {
      correlationId: string;
      amount: number;
      requestedAt: string;
    };
    console.log(`[worker] 📥 job #${job.id}`, { correlationId, amount, requestedAt });

    const defaultUrl = `${CONFIG.PROCESSOR_DEFAULT}/payments`;
    const fallbackUrl = `${CONFIG.PROCESSOR_FALLBACK}/payments`;
    let provider: "default" | "fallback";

    const health = healthSvc.getHealth();
    const defaultLat = health.default.latency ?? 100;
    const fallbackLat = health.fallback.latency ?? 100;
    const baseLat = Math.min(defaultLat, fallbackLat);
    const timeoutMs = Math.max(100, Math.min(baseLat * 1, 3000));

    try {
      provider = "default";
      console.log(`🚀 POST default → ${defaultUrl}`);
      const resp = await axios.post(defaultUrl, { correlationId, amount, requestedAt }, { timeout: timeoutMs });
      if (resp.status === 200) {
        console.log(`✅ default succeeded`);
      } else {
        throw new Error(`❌ default failed with status ${resp.status} msg=${resp.data} `);
      }
    } catch (err: any) {
      const msg = err.message || "";

      console.warn(`⚠️ default failed (${msg}), falling back`);
      provider = "fallback";
      console.log(`🚀 POST fallback → ${fallbackUrl}`);
      const resp = await axios.post(fallbackUrl, { correlationId, amount, requestedAt });
      if (resp.status === 200) {
        console.log(`✅ fallback succeeded`);
      } else {
        throw new Error(`❌ fallback failed with status ${resp.status} msg=${resp.data} `);
      }
    }

    console.log(`[worker] 📝 Recording ${correlationId} as ${provider}`);
    await paymentService.record(correlationId, amount, provider);
    console.log(`[worker] 🎉 Recorded ${correlationId} provider=${provider}`);
  },
  {
    connection,
    lockDuration: 120_000,
  },
);
