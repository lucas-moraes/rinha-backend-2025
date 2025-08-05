export const QUEUE_CONTROLLER_CONSTANTS = {
  SCHEMAS: {
    ENQUEUE: {
      body: {
        type: "object",
        required: ["correlationId", "amount", "requestedAt"],
        properties: {
          correlationId: { type: "string" },
          amount: { type: "number" },
          requestedAt: { type: "string", format: "date-time" },
          worker: { type: "number", nullable: true },
        },
      },
      response: {
        201: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
        },
        400: {
          type: "object",
          properties: {
            error: { type: "string" },
          },
        },
      },
    },
    DEQUEUE: {
      params: {
        type: "object",
        properties: {
          divisor: { type: "number" },
        },
        required: ["divisor"],
      },
      response: {
        200: {
          type: "object",
          properties: {
            data: {
              type: "object",
              nullable: true,
              properties: {
                correlationId: { type: "string" },
                amount: { type: "number" },
                requestedAt: { type: "string", format: "date-time" },
                processedAt: { type: "string", format: "date-time", nullable: true },
                provider: { type: "string", nullable: true },
                divisor: { type: "number" },
              },
            },
          },
        },
      },
    },
    ITEMS_IN_QUEUE: {
      response: {
        200: {
          type: "object",
          properties: {
            data: { type: "number" },
          },
        },
      },
    },
  },
  ENDPOINTS: {
    ENQUEUE: "/enqueue",
    DEQUEUE: "/dequeue/:divisor",
    ITEMS_IN_QUEUE: "/items-in-queue",
  },
};
