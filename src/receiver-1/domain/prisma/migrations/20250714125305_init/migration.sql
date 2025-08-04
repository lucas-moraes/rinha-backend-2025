-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "correlationId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "requestedAt" TIMESTAMP(3),
    "processedAt" TIMESTAMP(3),
    "provider" TEXT,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_correlationId_key" ON "Payment"("correlationId");
