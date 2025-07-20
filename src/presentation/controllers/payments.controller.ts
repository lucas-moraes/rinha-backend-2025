import { FastifyInstance } from "fastify/fastify";
import { paymentQueue } from "../../infra/queue/index.queue";
import { summaryPayment } from "../../application/use-cases/payment/summary.usecase";
import { prisma } from "../../domain/index.domain";

export async function paymentsController(app: FastifyInstance) {
  app.post("/payments", async (req, reply) => {
    const { correlationId, amount } = req.body as { correlationId: string; amount: number };
    if (!correlationId || !amount) {
      return reply.status(400).send({ error: "Missing correlationId or amount" });
    }
    const requestedAt = new Date().toISOString();
    paymentQueue({ correlationId, amount, requestedAt });
    reply.status(200);
  });

  app.get("/payments-summary", async (req, reply) => {
    const { from, to } = req.query as { from: string; to: string };
    if (from && isNaN(Date.parse(from))) {
      return reply.status(400).send({ error: "Invalid 'from' date format" });
    }
    if (to && isNaN(Date.parse(to))) {
      return reply.status(400).send({ error: "Invalid 'to' date format" });
    }

    if (from && !isValidDate(from)) {
      return reply.status(400).send({ error: "'from' date must be today" });
    }

    if (to && !isValidDate(to)) {
      return reply.status(400).send({ error: "'to' date must be today" });
    }

    function isValidDate(date: string) {
      const today = new Date();
      const parsedDate = new Date(date);

      return (
        today.getUTCFullYear() === parsedDate.getUTCFullYear() &&
        today.getUTCMonth() === parsedDate.getUTCMonth() &&
        today.getUTCDate() === parsedDate.getUTCDate()
      );
    }

    const result = await summaryPayment(prisma, from, to);
    reply.status(200).send(result);
  });

  app.post("/purge-payments", async (req, reply) => {
    await prisma.payment.deleteMany();
    reply.status(200).send({ message: "Payments purged successfully" });
  });
}
