import { db } from "../../../../../database/connection";

interface SummaryResult {
  default: {
    totalRequests: number;
    totalAmount: number;
  };
  fallback: {
    totalRequests: number;
    totalAmount: number;
  };
}

export const summaryPayment = async (from: string, to: string): Promise<SummaryResult> => {
  try {
    let result: any;

    if (!from || !to) {
      result = await db.query(
        `SELECT provider, COUNT(correlation_id) as totalRequests, COALESCE(SUM(amount), 0) as totalAmount 
        FROM payments
        GROUP BY provider`,
      );
    }
    if (from && to) {
      result = await db.query(
        `
      SELECT provider, COUNT(correlation_id) as totalRequests, COALESCE(SUM(amount), 0) as totalAmount
      FROM payments
      WHERE processed_at BETWEEN $1 AND $2
      GROUP BY provider
      `,
        [from, to],
      );
    }

    let defaultGroup = { totalRequests: 0, totalAmount: 0 };
    let fallbackGroup = { totalRequests: 0, totalAmount: 0 };

    for (const row of result.rows) {
      if (row.provider === "default") {
        defaultGroup = {
          totalRequests: parseInt(row.totalrequests),
          totalAmount: parseFloat(row.totalamount),
        };
      } else if (row.provider === "fallback") {
        fallbackGroup = {
          totalRequests: parseInt(row.totalrequests),
          totalAmount: parseFloat(row.totalamount),
        };
      }
    }

    return {
      default: defaultGroup,
      fallback: fallbackGroup,
    };
  } catch (error) {
    console.error(error);
    return {
      default: { totalRequests: 0, totalAmount: 0 },
      fallback: { totalRequests: 0, totalAmount: 0 },
    };
  }
};
