export interface Transaction {
  id: string;
  reference: string;
  type: string;
  status: string;
  source: string;
  amount: string;
  currency: string;
  description: string | null;
  narration: string | null;
  cardId: string | null;
  customerId: string | null;
  organizationId: string;
  metadata: Record<string, unknown> | null;
  externalReference: string | null;
  providerReference: string | null;
  failureReason: string | null;
  fee: string | null;
  balanceBefore: string | null;
  balanceAfter: string | null;
  createdAt: string;
  updatedAt: string;
  card: TransactionCard | null;
  customer: TransactionCustomer | null;
  organization: TransactionOrganization | null;
  ledgerEntries: LedgerEntry[];
}

export interface TransactionCard {
  id: string;
  cardNumber: string;
  cardType: string;
  status: string;
  cardholderName: string;
  expiryDate: string;
  cvv: string | null;
  balance: string;
  currency: string;
  sudoCardId: string;
  brand: string;
  maskedPan: string;
  customerId: string;
  spendingLimits: unknown | null;
  createdAt: string;
  updatedAt: string;
  wallet: CardWallet | null;
}

export interface CardWallet {
  id: string;
  entityId: string;
  entityType: string;
  currency: string;
  isActive: boolean;
  accountNumber: string | null;
  accountName: string | null;
  bankName: string | null;
  bankCode: string | null;
  providerAccountId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionCustomer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isActive: boolean;
  identityType: string;
  identityNumber: string;
  identityImage: string | null;
  dateOfBirth: string;
  gender: string;
  customerIds: Record<string, string> | null;
  organizationId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionOrganization {
  id: string;
  name: string;
  slug: string;
  type: string | null;
  email: string | null;
  phoneNumber: string | null;
  website: string | null;
  rcNumber: string | null;
  ownerId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LedgerEntry {
  id: string;
  walletId: string;
  type: string;
  amount: string;
  description: string;
  reference: string;
  transactionId: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}
