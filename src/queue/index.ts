import fastify, { FastifyInstance } from "fastify";
import { CONFIG } from "./infra/configs";
import cors from "@fastify/cors";
import { queue } from "./core";

let divisor = 1;

async function QueueController(app: FastifyInstance) {
  app.post("/enqueue", async (req, reply) => {
    const { correlationId, amount, requestedAt, worker } = req.body as {
      correlationId: string;
      amount: number;
      requestedAt: Date;
      worker?: number | null;
    };

    if (!correlationId || !amount || !requestedAt) {
      return reply.status(400).send({ error: "Missing required fields" });
    }

    queue.enqueue({
      correlationId,
      amount,
      requestedAt: new Date(requestedAt),
      processedAt: null,
      provider: null,
      divisor: worker ?? divisor,
    });

    reply.status(201);
  });

  app.get("/dequeue/:divisor", async (req, reply) => {
    const { divisor } = req.params as { divisor: number };
    const task = queue.dequeue(Number(divisor));

    reply.status(200).send({ data: task || null });
  });

  app.get("/items-in-queue", async (req, reply) => {
    const items = queue.ItemsInQueue();
    reply.status(200).send({ data: items });
  });
}

function BuildApp() {
  const app = fastify({ logger: false });

  app.register(cors, { origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] });

  app.addContentTypeParser("application/json", { parseAs: "buffer" }, function (req, body, done) {
    if (!body || body.length === 0) {
      done(null, {});
      return;
    }
    try {
      const json = JSON.parse(body.toString());
      done(null, json);
    } catch (err) {
      done(err as Error, undefined);
    }
  });
  const prefix = "/queue";
  app.register(QueueController, { prefix });

  return app;
}

async function start() {
  const app = BuildApp();

  await app.listen({ port: CONFIG.PORT, host: CONFIG.HOST });
  console.log(`API: ✅ Ruuning at port ${CONFIG.HOST}:${CONFIG.PORT}`);
}
start().catch((err) => {
  console.error(err);
  process.exit(1);
});
