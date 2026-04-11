export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  metadata: Record<string, unknown> | null;
  readAt: string | null;
  actionUrl: string | null;
  priority: string;
  createdAt: string;
  updatedAt: string;
  user: NotificationUser;
  organization: NotificationOrganization | null;
}

export interface NotificationUser {
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

export interface NotificationOrganization {
  id: string;
  name: string;
  slug: string;
}
