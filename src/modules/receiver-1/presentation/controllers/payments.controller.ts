import { FastifyInstance } from "fastify/fastify";
import { summaryPayment } from "../../application/use-cases/payment/summary.usecase";
import { deleteMany } from "../../application/use-cases/payment/delete.usecase";
import { PAYMENTS_CONTROLLER_CONSTANTS } from "./constants";

export async function paymentsController(app: FastifyInstance) {
  app.post(
    PAYMENTS_CONTROLLER_CONSTANTS.ENDPOINTS.PAYMENTS,
    {
      schema: PAYMENTS_CONTROLLER_CONSTANTS.SCHEMAS.PAYMENTS,
    },
    async (req, reply) => {
      const { correlationId, amount } = req.body as { correlationId: string; amount: number };

      if (!correlationId || !amount) return reply.status(400);

      const requestedAt = new Date().toISOString();
      await fetch(PAYMENTS_CONTROLLER_CONSTANTS.REQUEST_ENQUEUE.URL, {
        method: PAYMENTS_CONTROLLER_CONSTANTS.REQUEST_ENQUEUE.METHOD,
        headers: PAYMENTS_CONTROLLER_CONSTANTS.REQUEST_ENQUEUE.HEADERS,
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
    PAYMENTS_CONTROLLER_CONSTANTS.ENDPOINTS.PAYMENTS_SUMMARY,
    {
      schema: PAYMENTS_CONTROLLER_CONSTANTS.SCHEMAS.PAYMENTS_SUMMARY,
    },
    async (req, reply) => {
      const { from, to } = req.query as { from: string; to: string };

      const result = await summaryPayment(from, to);
      reply.status(200).send(result);
    },
  );

  app.delete(
    PAYMENTS_CONTROLLER_CONSTANTS.ENDPOINTS.PURGE_PAYMENTS,
    {
      schema: PAYMENTS_CONTROLLER_CONSTANTS.SCHEMAS.PURGE_PAYMENTS,
    },
    async (_, reply) => {
      await deleteMany();
      reply.status(200);
    },
  );
}
