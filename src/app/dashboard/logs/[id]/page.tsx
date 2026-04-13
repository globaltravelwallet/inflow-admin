"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/use-api";
import type { AuditLog } from "@/types/audit-log";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { ArrowLeft, ScrollText, User, Monitor } from "lucide-react";

export default function AuditLogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: log, isLoading } = useApi<AuditLog>(`/admin/logs/${id}`);

  if (isLoading) return <LoadingSkeleton rows={6} columns={2} />;

  if (!log) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Audit log not found</p>
      </div>
    );
  }

  const userName = [log.user?.firstName, log.user?.lastName]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard/logs")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold capitalize">
            {log.action.replace(/_/g, " ")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {new Date(log.createdAt).toLocaleString("en-US", {
              dateStyle: "long",
              timeStyle: "short",
            })}
          </p>
        </div>
        <StatusBadge status={log.success ? "success" : "failed"} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center gap-3 pb-3">
            <ScrollText className="h-5 w-5 text-primary" />
            <CardTitle>Log Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm">{log.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <InfoRow label="Action" value={log.action.replace(/_/g, " ")} />
              <InfoRow
                label="Resource Type"
                value={log.resourceType.replace(/_/g, " ")}
              />
              <InfoRow label="Resource ID" value={log.resourceId} mono />
              <InfoRow label="Method" value={log.requestMethod} />
              <InfoRow label="Path" value={log.requestPath} mono />
              {log.errorMessage && (
                <InfoRow label="Error" value={log.errorMessage} />
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
            <InfoRow label="Email" value={log.user?.email ?? "-"} />
            <InfoRow label="Role" value={log.user?.role ?? "-"} />
            <InfoRow label="KYC" value={log.user?.kycStatus ?? "-"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-3">
            <Monitor className="h-5 w-5 text-primary" />
            <CardTitle>Request Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="IP Address" value={log.ipAddress} mono />
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">User Agent</p>
              <p className="text-xs font-mono break-all text-foreground">
                {log.userAgent}
              </p>
            </div>
          </CardContent>
        </Card>

        {log.metadata && Object.keys(log.metadata).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="overflow-auto rounded-lg bg-muted p-4 text-xs">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {Boolean(log.previousState || log.newState) && (
          <Card>
            <CardHeader>
              <CardTitle>State Changes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Boolean(log.previousState) && (
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">
                    Previous State
                  </p>
                  <pre className="overflow-auto rounded-lg bg-muted p-3 text-xs">
                    {JSON.stringify(log.previousState, null, 2)}
                  </pre>
                </div>
              )}
              {Boolean(log.newState) && (
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">
                    New State
                  </p>
                  <pre className="overflow-auto rounded-lg bg-muted p-3 text-xs">
                    {JSON.stringify(log.newState, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span
        className={`text-right font-medium capitalize ${mono ? "font-mono text-xs" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
