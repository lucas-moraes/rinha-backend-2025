import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { PrismaClient } from "@prisma/client";
import { connection } from "../queue";

const prisma = new PrismaClient();

export async function summaryRoutes(app: FastifyInstance, opts: FastifyPluginOptions) {
  app.get("/", async (req, reply) => {
    try {
      const { from, to } = req.query as { from?: string; to?: string };
      const cacheKey = `sum:${from ?? ""}:${to ?? ""}`;

      const cached = await connection.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const dateFilter: { gte?: Date; lte?: Date } = {};
      if (from) dateFilter.gte = new Date(from);
      if (to) dateFilter.lte = new Date(to);

      const whereClause = dateFilter.gte || dateFilter.lte ? { processedAt: dateFilter } : {};

      const rows = await prisma.payment.groupBy({
        by: ["provider"],
        where: whereClause,
        _sum: { amount: true },
        _count: { id: true },
      });

      const defaultSummary = { totalRequests: 0, totalAmount: 0 };
      const fallbackSummary = { totalRequests: 0, totalAmount: 0 };

      for (const r of rows) {
        if (r.provider === "default") {
          defaultSummary.totalRequests = r._count.id;
          defaultSummary.totalAmount = r._sum.amount ?? 0;
        }
        if (r.provider === "fallback") {
          fallbackSummary.totalRequests = r._count.id;
          fallbackSummary.totalAmount = r._sum.amount ?? 0;
        }
      }

      const result = {
        default: defaultSummary,
        fallback: fallbackSummary,
      };

      await connection.set(cacheKey, JSON.stringify(result), "EX", 5);
      return result;
    } catch (err) {
      app.log.error(err, "Erro em summaryRoutes");
      reply.code(500).send({ error: "Erro ao gerar resumo de pagamentos" });
    }
  });
}
