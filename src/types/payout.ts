import { Organization } from "./organization";

export type PayoutStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

export interface BankAccount {
  id: string;
  organizationId: string;
  currency: string;
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  isDefault: boolean;
  isActive: boolean;
  autoPayoutEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Payout {
  id: string;
  reference: string;
  organizationId: string;
  bankAccountId: string;
  amount: string;
  currency: string;
  status: PayoutStatus;
  trigger: "manual" | "auto";
  scheduledDate: string;
  processedAt: string | null;
  failureReason: string | null;
  isExpedited: boolean;
  expeditedBy: string | null;
  expeditedAt: string | null;
  cancelledBy: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  providerReference: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  bankAccount?: BankAccount;
  organization?: Organization;
}

export interface PayoutsResponse {
  data: Payout[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
