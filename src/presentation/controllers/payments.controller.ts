import { FastifyInstance } from "fastify/fastify";
import { paymentQueue } from "../../infra/queue/index.queue";

export async function paymentsController(app: FastifyInstance) {
  app.post("/payments", async (req, reply) => {
    const { correlationId, amount } = req.body as { correlationId: string; amount: number };
    const requestedAt = new Date().toISOString();
    await paymentQueue.add({ correlationId, amount, requestedAt });
  });

  app.get("/payments-summary", async () => {
    return { message: "Payments summary API is running" };
  });
}
