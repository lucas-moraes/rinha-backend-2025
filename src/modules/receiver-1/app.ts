import Fastify from "fastify";
import cors from "@fastify/cors";
import { paymentsController } from "./presentation/controllers/payments.controller";
import "http2";

export function buildApp() {
  const app = Fastify({ logger: false });

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

  app.register(paymentsController);

  return app;
}
