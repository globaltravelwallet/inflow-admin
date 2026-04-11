export interface Payment {
  id: string;
  organizationId: string;
  customerId: string | null;
  status: string;
  region: string;
  reference: string | null;
  description: string | null;
  sourceAmount: number;
  targetAmount: number;
  sourceCurrency: string;
  targetCurrency: string;
  exchangeRate: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}
