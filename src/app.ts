import Fastify from "fastify";
import cors from "@fastify/cors";
import { PrismaClient } from "@prisma/client";
import { paymentRoutes } from "./payments/payment.controller";
import { summaryRoutes } from "./summary/summary.service";
import { HealthService } from "./health/health.service";

const prisma = new PrismaClient();

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

  const healthSvc = new HealthService();

  app.get("/health", async () => {
    return healthSvc.getHealth();
  });

  app.post("/purge-payments", async (_req, reply) => {
    await prisma.payment.deleteMany();
    return reply.code(200).send({ message: "Backend payments purged" });
  });

  app.register(paymentRoutes, { prefix: "/payments" });
  app.register(summaryRoutes, { prefix: "/payments-summary" });

  return app;
}
