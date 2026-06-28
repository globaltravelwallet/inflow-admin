"use client";

import { useNavigate, useParams } from "react-router-dom";
import { useApi } from "@/hooks/use-api";
import type { Notification } from "@/types/notification";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { ArrowLeft, Bell, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function NotificationDetailPage() {
  const { id } = useParams() as { id: string };
  const navigate = useNavigate();
  const { data: notification, isLoading } = useApi<Notification>(
    `/admin/notifications/${id}`
  );

  if (isLoading) return <LoadingSkeleton rows={6} columns={2} />;

  if (!notification) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Notification not found</p>
      </div>
    );
  }

  const userName = [
    notification.user?.firstName,
    notification.user?.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/dashboard/notifications")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{notification.title}</h1>
          <p className="text-sm text-muted-foreground">
            {new Date(notification.createdAt).toLocaleString("en-US", {
              dateStyle: "long",
              timeStyle: "short",
            })}
          </p>
        </div>
        <StatusBadge status={notification.read ? "true" : "false"} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center gap-3 pb-3">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle>Notification Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm">{notification.message}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <InfoBlock label="Type">
                <StatusBadge status={notification.type} />
              </InfoBlock>
              <InfoBlock label="Priority">
                <Badge variant="secondary" className="capitalize">
                  {notification.priority}
                </Badge>
              </InfoBlock>
              <InfoBlock label="Read Status">
                <StatusBadge status={notification.read ? "true" : "false"} />
              </InfoBlock>
              {notification.readAt && (
                <InfoBlock label="Read At">
                  <span className="text-sm">
                    {new Date(notification.readAt).toLocaleString()}
                  </span>
                </InfoBlock>
              )}
              {notification.actionUrl && (
                <InfoBlock label="Action URL">
                  <a
                    href={notification.actionUrl}
                    className="text-sm text-primary hover:underline break-all"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {notification.actionUrl}
                  </a>
                </InfoBlock>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-3">
            <User className="h-5 w-5 text-primary" />
            <CardTitle>User</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Name" value={userName || "-"} />
            <InfoRow label="Email" value={notification.user?.email ?? "-"} />
            <InfoRow label="Role" value={notification.user?.role ?? "-"} />
            <InfoRow
              label="KYC Status"
              value={notification.user?.kycStatus ?? "-"}
            />
            <InfoRow
              label="Active"
              value={notification.user?.isActive ? "Yes" : "No"}
            />
            <InfoRow
              label="Email Verified"
              value={notification.user?.emailVerified ? "Yes" : "No"}
            />
          </CardContent>
        </Card>

        {notification.metadata &&
          Object.keys(notification.metadata).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Metadata</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="overflow-auto rounded-lg bg-muted p-4 text-xs">
                  {JSON.stringify(notification.metadata, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium capitalize">{value}</span>
    </div>
  );
}

function InfoBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}
