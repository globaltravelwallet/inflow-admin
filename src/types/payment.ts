export interface Payment {
  id: string;
  organizationId: string;
  customerId: string | null;
  reference: string;
  sourceAmount: string;
  sourceCurrency: string;
  targetAmount: string;
  targetCurrency: string;
  exchangeRate: string;
  description: string | null;
  region: string;
  plaidRecipientId: string | null;
  plaidPaymentId: string | null;
  plaidTransferId: string | null;
  plaidAuthorizationId: string | null;
  linkToken: string | null;
  linkTokenExpiration: string | null;
  status: string;
  failureReason: string | null;
  payerName: string | null;
  payerEmail: string | null;
  redirectUrl: string | null;
  hostedLinkUrl: string | null;
  metadata: Record<string, unknown> | null;
  expiresAt: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  customer: PaymentCustomer | null;
  organization: PaymentOrganization | null;
}

export interface PaymentCustomer {
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

export interface PaymentOrganization {
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
