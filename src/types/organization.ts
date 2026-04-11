export interface Organization {
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
  customerIds: Record<string, string> | null;
  createdAt: string;
  updatedAt: string;
  owner: OrganizationOwner;
  address: OrganizationAddress | null;
}

export interface OrganizationOwner {
  id: string;
  email: string;
  role: string;
  firstName: string | null;
  lastName: string | null;
  bvn: string | null;
  phoneNumber: string | null;
  idDocumentUrl: string | null;
  kycStatus: string | null;
  kycRejectionReason: string | null;
  isActive: boolean;
  emailVerified: boolean;
  customerIds: Record<string, string> | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationAddress {
  id: string;
  street: string;
  unit: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  organizationId: string;
  customerId: string | null;
  createdAt: string;
  updatedAt: string;
}
