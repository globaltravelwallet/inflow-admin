export interface Transaction {
  id: string;
  organizationId: string;
  customerId: string | null;
  cardId: string | null;
  type: string;
  status: string;
  source: string;
  amount: number;
  currency: string;
  description: string | null;
  reference: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}
