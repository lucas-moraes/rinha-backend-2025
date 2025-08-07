import { FastifyInstance } from "fastify";
import { BuildApp } from "../../src/modules/queue/app";
import request from "supertest";
import { queue } from "../../src/modules/queue/core/index";

jest.mock("../../src/modules/queue/core/index", () => ({
  queue: {
    enqueue: jest.fn(),
    dequeue: jest.fn(),
    ItemsInQueue: jest.fn(),
  },
}));

describe("API: queue", () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    server = (await BuildApp()) as FastifyInstance;
    await server.listen({ port: 7001 });
  });

  afterAll(async () => {
    await server.close();
  });

  describe("/enqueue", () => {
    it("Should return status 201", async () => {
      const response = await request(server.server)
        .post("/queue/enqueue")
        .set("Content-Type", "application/json")
        .send({
          correlationId: "test-correlation-id",
          amount: 100,
          requestedAt: new Date().toISOString(),
        });

      expect(response.status).toBe(201);
    });

    it("Should return status 400", async () => {
      const response = await request(server.server)
        .post("/queue/enqueue")
        .set("Content-Type", "application/json")
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe("/dequeue/:divisor", () => {
    it("Should return status 200", async () => {
      const response = await request(server.server).get("/queue/dequeue/2");

      expect(response.status).toBe(200);
      expect(queue.dequeue).toHaveBeenCalledWith(2);
    });

    it("should return 200 and null", async () => {
      (queue.dequeue as jest.Mock).mockReturnValue(undefined);

      const response = await request(server.server).get("/queue/dequeue/3");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ data: null });
      expect(queue.dequeue).toHaveBeenCalledWith(3);
    });
  });

  describe("/items-in-queue", () => {
    it("Should return status 200", async () => {
      (queue.ItemsInQueue as jest.Mock).mockReturnValue(5);

      const response = await request(server.server).get("/queue/items-in-queue");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ data: 5 });
      expect(queue.ItemsInQueue).toHaveBeenCalled();
    });
  });
});
