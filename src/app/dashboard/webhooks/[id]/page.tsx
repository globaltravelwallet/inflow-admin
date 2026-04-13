"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/use-api";
import type { WebhookLogResponse } from "@/types/webhook";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, RefreshCw, Webhook, Building2, Shield } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";

export default function WebhookLogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data, isLoading, refetch } = useApi<WebhookLogResponse>(
    `/admin/webhooks/logs/${id}`
  );
  const [resendDialog, setResendDialog] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const log = data?.log;

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await api.post(`/admin/webhooks/logs/${id}/resend`);
      toast.success("Webhook resent successfully");
      setResendDialog(false);
      refetch();
    } catch {
      toast.error("Failed to resend webhook");
    } finally {
      setResendLoading(false);
    }
  };

  if (isLoading) return <LoadingSkeleton rows={6} columns={2} />;

  if (!log) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Webhook log not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard/webhooks")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            <code className="text-xl">{log.eventType}</code>
          </h1>
          <p className="text-sm text-muted-foreground">
            {new Date(log.createdAt).toLocaleString("en-US", {
              dateStyle: "long",
              timeStyle: "short",
            })}
          </p>
        </div>
        <StatusBadge status={log.status} />
        {log.status === "failed" && (
          <Button size="sm" onClick={() => setResendDialog(true)}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Resend
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Delivery Info */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-3">
            <Webhook className="h-5 w-5 text-primary" />
            <CardTitle>Delivery Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Destination URL</p>
              <p className="break-all font-mono text-xs bg-muted rounded p-2">{log.url}</p>
            </div>
            <InfoRow label="Status">
              <StatusBadge status={log.status} />
            </InfoRow>
            <InfoRow
              label="HTTP Status"
              value={log.httpStatus ? String(log.httpStatus) : "-"}
            />
            <InfoRow label="Attempts" value={String(log.attempts)} highlight />
            {log.lastAttemptAt && (
              <InfoRow
                label="Last Attempt"
                value={new Date(log.lastAttemptAt).toLocaleString()}
              />
            )}
            {log.nextRetryAt && (
              <InfoRow
                label="Next Retry"
                value={new Date(log.nextRetryAt).toLocaleString()}
              />
            )}
            {log.errorMessage && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                <span className="font-medium">Error: </span>{log.errorMessage}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Endpoint Details */}
        {log.endpoint && (
          <Card>
            <CardHeader className="flex flex-row items-center gap-3 pb-3">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Endpoint Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoRow label="Endpoint ID" value={log.endpoint.id} mono />
              <InfoRow label="Active">
                <StatusBadge status={log.endpoint.isActive ? "Active" : "Inactive"} />
              </InfoRow>
              {log.endpoint.description && (
                <InfoRow label="Description" value={log.endpoint.description} />
              )}
              <InfoRow
                label="Created"
                value={new Date(log.endpoint.createdAt).toLocaleString()}
              />
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Subscribed Events</p>
                <div className="flex flex-wrap gap-1.5">
                  {log.endpoint.events.map((event) => (
                    <Badge
                      key={event}
                      variant="secondary"
                      className={`text-xs ${event === log.eventType ? "bg-primary/20 text-primary" : ""}`}
                    >
                      {event}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Organization */}
        {log.organization && (
          <Card>
            <CardHeader className="flex flex-row items-center gap-3 pb-3">
              <Building2 className="h-5 w-5 text-primary" />
              <CardTitle>Organization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="Name" value={log.organization.name} />
              <InfoRow
                label="Type"
                value={log.organization.type?.replace(/_/g, " ") ?? "-"}
              />
              <InfoRow label="Email" value={log.organization.email ?? "-"} />
              <InfoRow label="Phone" value={log.organization.phoneNumber ?? "-"} />
              <InfoRow label="RC Number" value={log.organization.rcNumber ?? "-"} mono />
              <InfoRow label="Active">
                <StatusBadge
                  status={log.organization.isActive ? "Active" : "Inactive"}
                />
              </InfoRow>
            </CardContent>
          </Card>
        )}

        {/* Payload */}
        <Card className={log.endpoint && log.organization ? "lg:col-span-2" : ""}>
          <CardHeader>
            <CardTitle>Payload</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="overflow-auto rounded-lg bg-muted p-4 text-xs max-h-96">
              {JSON.stringify(log.payload, null, 2)}
            </pre>
          </CardContent>
        </Card>

        {/* Response Body */}
        {log.responseBody && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Response Body</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="overflow-auto rounded-lg bg-muted p-4 text-xs max-h-64 whitespace-pre-wrap">
                {log.responseBody.length > 500
                  ? log.responseBody.slice(0, 500) + "\n\n... (truncated — full response was too large to display)"
                  : log.responseBody}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={resendDialog} onOpenChange={setResendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resend Webhook</DialogTitle>
            <DialogDescription>
              Are you sure you want to resend the{" "}
              <strong>{log.eventType}</strong> webhook to{" "}
              <strong>{log.url}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResendDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleResend} disabled={resendLoading}>
              {resendLoading ? "Resending..." : "Yes, resend"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono,
  highlight,
  children,
}: {
  label: string;
  value?: string;
  mono?: boolean;
  highlight?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-center gap-4 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      {children ?? (
        <span
          className={[
            "text-right font-medium",
            mono ? "font-mono text-xs" : "",
            highlight ? "text-primary font-semibold" : "",
          ].join(" ")}
        >
          {value}
        </span>
      )}
    </div>
  );
}
