import { FastifyInstance } from "fastify";
import { buildApp } from "../../src/modules/receiver-1/app";
import request from "supertest";
import { summaryPayment } from "../../src/modules/receiver-1/application/use-cases/payment/summary.usecase";
import { deleteMany } from "../../src/modules/receiver-1/application/use-cases/payment/delete.usecase";

global.fetch = jest.fn();
jest.mock("../../src/modules/receiver-1/application/use-cases/payment/summary.usecase", () => ({
  summaryPayment: jest.fn(),
}));
jest.mock("../../src/modules/receiver-1/application/use-cases/payment/delete.usecase", () => ({
  deleteMany: jest.fn(),
}));

describe("API: receiver-1", () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    server = (await buildApp()) as FastifyInstance;
    await server.listen({ port: 7000 });
  });

  afterAll(async () => {
    await server.close();
  });

  describe("/paiments", () => {
    it("Should return status 200", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        status: 200,
        json: async () => ({}),
      } as Response);

      const response = await request(server.server).post("/payments").set("Content-Type", "application/json").send({
        correlationId: "test-correlation-id",
        amount: 100,
      });

      expect(response.status).toBe(200);
    });

    it("Should return status 400", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        status: 200,
        json: async () => ({}),
      } as Response);

      const response = await request(server.server).post("/payments").set("Content-Type", "application/json").send({});

      expect(response.status).toBe(400);
    });

    it("should return status 500", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error("Network Error"));

      const response = await request(server.server).post("/payments").set("Content-Type", "application/json").send({
        correlationId: "test-correlation-id",
        amount: 100,
      });

      expect(response.status).toBe(500);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("/payments-summary", () => {
    it("should return 200", async () => {
      (summaryPayment as jest.Mock).mockResolvedValue({
        default: { totalRequests: 10, totalAmount: 1000 },
        fallback: { totalRequests: 5, totalAmount: 500 },
      });

      const response = await request(server.server).get("/payments-summary").query({
        from: new Date().toISOString(),
        to: new Date().toISOString(),
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        default: { totalRequests: 10, totalAmount: 1000 },
        fallback: { totalRequests: 5, totalAmount: 500 },
      });
      expect(summaryPayment).toHaveBeenCalled();
    });

    it("should return status 400", async () => {
      const response = await request(server.server).get("/payments-summary");
      expect(response.status).toBe(400);
    });

    it("should return status 500", async () => {
      (summaryPayment as jest.Mock).mockRejectedValue(new Error("DB Error"));

      const response = await request(server.server).get("/payments-summary").query({
        from: new Date().toISOString(),
        to: new Date().toISOString(),
      });

      expect(response.status).toBe(500);
    });
  });

  describe("/purge-payments", () => {
    it("should return status 200", async () => {
      (deleteMany as jest.Mock).mockResolvedValue({});

      const response = await request(server.server).delete("/purge-payments");

      expect(response.status).toBe(200);
      expect(deleteMany).toHaveBeenCalled();
    });

    it("should return status 500", async () => {
      (deleteMany as jest.Mock).mockRejectedValue(new Error("DB Error"));

      const response = await request(server.server).delete("/purge-payments");

      expect(response.status).toBe(500);
    });
  });
});
