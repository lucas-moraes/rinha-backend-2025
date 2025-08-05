import { PrismaClient } from "@prisma/client";

export const summaryPayment = async (prisma: PrismaClient, from: string, to: string) => {
  try {
    const groups = await prisma.payment.groupBy({
      by: ["provider"],
      _count: { correlationId: true },
      _sum: { amount: true },
      where: {
        processedAt: {
          gte: from ? new Date(from) : undefined,
          lte: to ? new Date(to) : undefined,
        },
      },
    });

    const defaultGroup = groups.find((g: any) => g.provider === "default");
    const fallbackGroup = groups.find((g: any) => g.provider === "fallback");
    return {
      default: {
        totalRequests: defaultGroup?._count.correlationId ?? 0,
        totalAmount: defaultGroup?._sum.amount ?? 0,
      },
      fallback: {
        totalRequests: fallbackGroup?._count.correlationId ?? 0,
        totalAmount: fallbackGroup?._sum.amount ?? 0,
      },
    };
  } catch (error) {
    return {
      default: {
        totalRequests: 0,
        totalAmount: 0,
      },
      fallback: {
        totalRequests: 0,
        totalAmount: 0,
      },
    };
  }
};
