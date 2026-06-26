import type { OrganizationOwner } from "./organization";

export type KycStatus =
  | "pending"
  | "under_review"
  | "approved"
  | "rejected";

export interface KycOrganization {
  id: string;
  name: string | null;
  email: string | null;
  slug: string | null;
  owner: OrganizationOwner | null;
}

export interface CompanyKyc {
  id: string;
  organizationId: string;
  companyName: string | null;
  rcNumber: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  ninNumber: string | null;
  cacCertificateUrl: string | null;
  proofOfAddressUrl: string | null;
  validIdUrl: string | null;
  status: KycStatus;
  rejectionReason: string | null;
  reviewedBy: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  organization: KycOrganization | null;
}
