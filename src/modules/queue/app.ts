import fastify from "fastify";
import cors from "@fastify/cors";
import { QueueController } from "./presentation/controller/queue.controller";

export function BuildApp() {
  const app = fastify({ logger: false });
  const prefix = "/queue";

  app.register(cors, { origin: "*", methods: ["GET", "POST"] });
  app.register(QueueController, { prefix });
  app.addContentTypeParser("application/json", { parseAs: "buffer" }, function (_, body, done) {
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

  return app;
}
