import Fastify from "fastify";
import cors from "@fastify/cors";
import { paymentsController } from "./presentation/controllers/payments.controller";

export function buildApp() {
  const app = Fastify({ logger: true });

  app.register(cors, { origin: true });

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

  app.register(paymentsController);

  return app;
}
