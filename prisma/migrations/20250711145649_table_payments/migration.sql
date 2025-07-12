-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "correlationId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "provider" TEXT NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);
