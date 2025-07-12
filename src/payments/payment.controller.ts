import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { paymentQueue } from "../queue";
import { CreatePaymentDto } from "./dto/create-payment.dto";

export async function paymentRoutes(app: FastifyInstance, opts: FastifyPluginOptions) {
  app.post("/", async (req, reply) => {
    const { correlationId, amount } = req.body as CreatePaymentDto;
    const requestedAt = new Date().toISOString();
    await paymentQueue.add("proc", { correlationId, amount, requestedAt });
    reply.code(202).send();
  });
}
