export interface PaymentDto {
  correlationId: string;
  amount: number;
  requestedAt: Date;
  processedAt: Date | null;
  provider: string | null;
}
