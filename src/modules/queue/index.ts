import fastify from "fastify";
import { CONFIG } from "./infra/configs";
import cors from "@fastify/cors";
import { QueueController } from "./presentation/controllers/queue.controller";

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
  console.log(`Queue: ✅ Ruuning at port ${CONFIG.HOST}:${CONFIG.PORT}`);
}
start().catch((err) => {
  console.error(err);
  process.exit(1);
});
