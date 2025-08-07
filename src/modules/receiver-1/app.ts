import Fastify from "fastify";
import cors from "@fastify/cors";
import { paymentsController } from "./presentation/controllers/payments.controller";
import "http2";

export function buildApp() {
  const app = Fastify({ logger: false });
  app.register(require("@fastify/helmet"));
  app.register(require("@fastify/formbody"));
  app.register(cors, { origin: "*", methods: ["GET", "POST", "DELETE"] });
  app.register(paymentsController);

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
