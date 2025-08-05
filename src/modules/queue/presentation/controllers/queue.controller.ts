import { FastifyInstance } from "fastify";
import { queue } from "../../core";

export async function QueueController(app: FastifyInstance) {
  let divisor = 1;
  app.post(
    "/enqueue",
    {
      schema: {
        body: {
          type: "object",
          required: ["correlationId", "amount", "requestedAt"],
          properties: {
            correlationId: { type: "string" },
            amount: { type: "number" },
            requestedAt: { type: "string", format: "date-time" },
            worker: { type: "number", nullable: true },
          },
        },
        response: {
          201: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
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
      const { correlationId, amount, requestedAt, worker } = req.body as {
        correlationId: string;
        amount: number;
        requestedAt: Date;
        worker?: number | null;
      };

      if (!correlationId || !amount || !requestedAt) {
        return reply.status(400).send({ error: "Missing required fields" });
      }

      divisor = (divisor % 3) + 1;

      queue.enqueue({
        correlationId,
        amount,
        requestedAt: new Date(requestedAt),
        processedAt: null,
        provider: null,
        divisor: worker ?? divisor,
      });

      reply.status(201);
    },
  );

  app.get(
    "/dequeue/:divisor",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            divisor: { type: "number" },
          },
          required: ["divisor"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              data: {
                type: "object",
                nullable: true,
                properties: {
                  correlationId: { type: "string" },
                  amount: { type: "number" },
                  requestedAt: { type: "string", format: "date-time" },
                  processedAt: { type: "string", format: "date-time", nullable: true },
                  provider: { type: "string", nullable: true },
                  divisor: { type: "number" },
                },
              },
            },
          },
        },
      },
    },
    async (req, reply) => {
      const { divisor } = req.params as { divisor: number };
      const task = queue.dequeue(Number(divisor));
      reply.status(200).send({ data: task || null });
    },
  );

  app.get(
    "/items-in-queue",
    {
      schema: {
        response: {
          200: {
            type: "object",
            properties: {
              data: {
                type: "number",
              },
            },
          },
        },
      },
    },
    async (req, reply) => {
      const items = queue.ItemsInQueue();
      reply.status(200).send({ data: items });
    },
  );
}
