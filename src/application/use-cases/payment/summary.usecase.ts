import { PrismaClient } from "@prisma/client";

export const summaryPayment = async (prisma: PrismaClient, from: string, to: string) => {
  const defaultSummary = { totalRequests: 0, totalAmount: 0 };
  const fallbackSummary = { totalRequests: 0, totalAmount: 0 };

  try {
    const row = await prisma.payment.findMany({
      where: {
        processedAt: {
          gte: from ? new Date(from) : undefined,
          lte: to ? new Date(to) : undefined,
        },
      },
      orderBy: {
        processedAt: "desc",
      },
    });

    row.forEach((payment) => {
      if (payment.provider === "default") {
        defaultSummary.totalRequests += 1;
        defaultSummary.totalAmount += payment.amount;
      } else if (payment.provider === "fallback") {
        fallbackSummary.totalRequests += 1;
        fallbackSummary.totalAmount += payment.amount;
      }
    });

    return {
      default: defaultSummary,
      fallback: fallbackSummary,
    };
  } catch (error) {
    return {
      default: defaultSummary,
      fallback: fallbackSummary,
    };
  }
};
