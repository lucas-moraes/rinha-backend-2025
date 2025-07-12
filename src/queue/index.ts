import { Queue } from "bullmq";
import { CONFIG } from "../config";
import IORedis from "ioredis";

const redisOptions: any = {
  maxRetriesPerRequest: null,
  enableOfflineQueue: true,
};

export const connection = new IORedis(CONFIG.REDIS_URL, redisOptions);

export const paymentQueue = new Queue("payments", {
  connection,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: false,
    attempts: 3,
    backoff: { type: "exponential", delay: 1000 },
  },
});
