export const PAYMENTS_CONTROLLER_CONSTANTS = {
  SCHEMAS: {
    PAYMENTS: {
      body: {
        type: "object",
        properties: {
          correlationId: { type: "string" },
          amount: { type: "number" },
        },
        required: ["correlationId", "amount"],
      },
      response: {
        200: {},
        400: {
          type: "object",
          properties: {
            error: { type: "string" },
          },
        },
      },
    },
    PAYMENTS_SUMMARY: {
      querystring: {
        type: "object",
        properties: {
          from: { type: "string", format: "date-time" },
          to: { type: "string", format: "date-time" },
        },
      },
      response: {
        200: {
          type: "object",
          properties: {
            default: {
              type: "object",
              properties: {
                totalRequests: { type: "number" },
                totalAmount: { type: "number" },
              },
            },
            fallback: {
              type: "object",
              properties: {
                totalRequests: { type: "number" },
                totalAmount: { type: "number" },
              },
            },
          },
        },
      },
    },
    PURGE_PAYMENTS: {
      response: {
        200: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
        },
      },
    },
  },
  ENDPOINTS: {
    PAYMENTS: "/payments",
    PAYMENTS_SUMMARY: "/payments-summary",
    PURGE_PAYMENTS: "/purge-payments",
    HEALTH_CHECK: "/health-check",
  },
  REQUEST_ENQUEUE: {
    URL: "http://localhost:9696/queue/enqueue",
    METHOD: "POST",
    HEADERS: {
      "Content-Type": "application/json",
    },
  },
};
