export interface AuditLog {
  id: string;
  userId: string;
  organizationId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  description: string;
  ipAddress: string;
  userAgent: string;
  requestMethod: string;
  requestPath: string;
  previousState: unknown | null;
  newState: unknown | null;
  metadata: Record<string, unknown> | null;
  success: boolean;
  errorMessage: string | null;
  createdAt: string;
  user: AuditLogUser;
}

export interface AuditLogUser {
  id: string;
  email: string;
  role: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  kycStatus: string | null;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
