export interface WebhookEndpoint {
  id: string;
  organizationId: string;
  url: string;
  description: string | null;
  secret: string;
  events: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  organization: WebhookOrganization;
}

export interface WebhookOrganization {
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

export interface WebhookLog {
  id: string;
  organizationId: string;
  endpointId: string;
  eventType: string;
  payload: Record<string, unknown>;
  url: string;
  status: string;
  httpStatus: number | null;
  responseBody: string | null;
  attempts: number;
  lastAttemptAt: string | null;
  nextRetryAt: string | null;
  errorMessage: string | null;
  createdAt: string;
  endpoint: WebhookEndpointRef;
}

export interface WebhookEndpointRef {
  id: string;
  organizationId: string;
  url: string;
  isActive: boolean;
}
