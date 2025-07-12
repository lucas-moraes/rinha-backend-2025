import { PrismaClient } from "@prisma/client";
import { connection } from "../queue";

const prisma = new PrismaClient();

export class PaymentService {
  async record(correlationId: string, amount: number, provider: string) {
    await prisma.payment.create({ data: { correlationId, amount, provider } });

    const keys = await connection.keys("sum:*");
    if (keys.length > 0) {
      await connection.del(...keys);
    }
  }
}
export const paymentService = new PaymentService();
