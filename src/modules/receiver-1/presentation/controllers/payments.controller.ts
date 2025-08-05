import { FastifyInstance } from "fastify/fastify";
import { summaryPayment } from "../../application/use-cases/payment/summary.usecase";
import { prisma } from "../../domain/index.domain";

export async function paymentsController(app: FastifyInstance) {
  app.post(
    "/payments",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            correlationId: { type: "string" },
            amount: { type: "number" },
          },
          required: ["correlationId", "amount"],
        },
        response: {
          200: {},
          400: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    async (req, reply) => {
      const { correlationId, amount } = req.body as { correlationId: string; amount: number };

      if (!correlationId || !amount) {
        return reply.status(400).send({ error: "Missing correlationId or amount" });
      }
      const requestedAt = new Date().toISOString();
      await fetch("http://localhost:9696/queue/enqueue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          correlationId,
          amount,
          requestedAt,
        }),
      });
      reply.status(200);
    },
  );

  app.get(
    "/payments-summary",
    {
      schema: {
        querystring: {
          type: "object",
          properties: {
            from: { type: "string", format: "date-time" },
            to: { type: "string", format: "date-time" },
          },
          required: ["from", "to"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              default: {
                totalRequests: "number",
                totalAmount: "number",
              },
              fallback: {
                totalRequests: "number",
                totalAmount: "number",
              },
            },
          },
        },
      },
    },
    async (req, reply) => {
      const { from, to } = req.query as { from: string; to: string };

      const result = await summaryPayment(prisma, from, to);
      reply.status(200).send(result);
    },
  );

  app.post(
    "/purge-payments",
    {
      schema: {
        response: {
          200: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
        },
      },
    },
    async (req, reply) => {
      await prisma.payment.deleteMany();
      reply.status(200).send({ message: "Payments purged successfully" });
    },
  );
}
