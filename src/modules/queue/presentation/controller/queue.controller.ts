import { FastifyInstance } from "fastify";
import { queue } from "../../core";
import { QUEUE_CONTROLLER_CONSTANTS } from "./constants";

export async function QueueController(app: FastifyInstance) {
  let divisor = 1;
  app.post(
    QUEUE_CONTROLLER_CONSTANTS.ENDPOINTS.ENQUEUE,
    {
      schema: QUEUE_CONTROLLER_CONSTANTS.SCHEMAS.ENQUEUE,
    },
    async (req, reply) => {
      const { correlationId, amount, requestedAt, worker } = req.body as {
        correlationId: string;
        amount: number;
        requestedAt: Date;
        worker?: number | null;
      };

      if (!correlationId || !amount || !requestedAt) {
        return reply.status(400);
      }

      //divisor = (divisor % 3) + 1;

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
    QUEUE_CONTROLLER_CONSTANTS.ENDPOINTS.DEQUEUE,
    {
      schema: QUEUE_CONTROLLER_CONSTANTS.SCHEMAS.DEQUEUE,
    },
    async (req, reply) => {
      const { divisor } = req.params as { divisor: number };
      const task = queue.dequeue(Number(divisor));
      reply.status(200).send({ data: task || null });
    },
  );

  app.get(
    QUEUE_CONTROLLER_CONSTANTS.ENDPOINTS.ITEMS_IN_QUEUE,
    {
      schema: QUEUE_CONTROLLER_CONSTANTS.SCHEMAS.ITEMS_IN_QUEUE,
    },
    async (_, reply) => {
      const items = queue.ItemsInQueue();
      reply.status(200).send({ data: items });
    },
  );
}
