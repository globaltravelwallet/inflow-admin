"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApi } from "@/hooks/use-api";
import { Building2, Bell, ScrollText, Webhook } from "lucide-react";
import type { Organization } from "@/types/organization";
import type { AuditLog } from "@/types/audit-log";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";

interface NotificationsResponse {
  notifications: unknown[];
  total: number;
}

interface LogsResponse {
  logs: AuditLog[];
  total: number;
}

interface EndpointsResponse {
  endpoints: unknown[];
}

export default function DashboardPage() {
  const { data: orgs, isLoading: orgsLoading } = useApi<Organization[]>("/admin/organizations");
  const { data: notifs, isLoading: notifsLoading } = useApi<NotificationsResponse>("/admin/notifications", { limit: 1 });
  const { data: logsData, isLoading: logsLoading } = useApi<LogsResponse>("/admin/logs", { limit: 5 });
  const { data: webhooks, isLoading: webhooksLoading } = useApi<EndpointsResponse>("/admin/webhooks/endpoints");

  const stats = [
    {
      title: "Organizations",
      value: orgs?.length ?? 0,
      icon: Building2,
      loading: orgsLoading,
    },
    {
      title: "Notifications",
      value: notifs?.total ?? 0,
      icon: Bell,
      loading: notifsLoading,
    },
    {
      title: "Audit Logs",
      value: logsData?.total ?? 0,
      icon: ScrollText,
      loading: logsLoading,
    },
    {
      title: "Webhook Endpoints",
      value: webhooks?.endpoints?.length ?? 0,
      icon: Webhook,
      loading: webhooksLoading,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Overview</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {stat.loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <p className="text-2xl font-bold">{stat.value}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !logsData?.logs?.length ? (
            <p className="text-sm text-muted-foreground">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {logsData.logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{log.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {log.user?.email} &middot;{" "}
                      {new Date(log.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <StatusBadge status={log.success ? "success" : "failed"} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
