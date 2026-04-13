"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/use-api";
import { DataTable, type Column } from "@/components/shared/data-table";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { WebhookEndpoint, WebhookLog } from "@/types/webhook";
import api from "@/lib/axios";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";

interface EndpointsResponse {
  endpoints: WebhookEndpoint[];
}

interface WebhookLogsResponse {
  logs: WebhookLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function WebhooksPage() {
  const router = useRouter();
  const [logsPage, setLogsPage] = useState(1);
  const [logsLimit, setLogsLimit] = useState(20);
  const [resendDialog, setResendDialog] = useState<{
    open: boolean;
    log: WebhookLog | null;
  }>({ open: false, log: null });
  const [resendLoading, setResendLoading] = useState(false);

  const { data: endpointsData, isLoading: endpointsLoading } =
    useApi<EndpointsResponse>("/admin/webhooks/endpoints");

  const { data: logsData, isLoading: logsLoading, refetch: refetchLogs } =
    useApi<WebhookLogsResponse>("/admin/webhooks/logs", {
      page: logsPage,
      limit: logsLimit,
    });

  const handleResend = async () => {
    if (!resendDialog.log) return;
    setResendLoading(true);
    try {
      await api.post(`/admin/webhooks/logs/${resendDialog.log.id}/resend`);
      toast.success("Webhook resent successfully");
      setResendDialog({ open: false, log: null });
      refetchLogs();
    } catch {
      toast.error("Failed to resend webhook");
    } finally {
      setResendLoading(false);
    }
  };

  const endpointColumns: Column<WebhookEndpoint>[] = [
    {
      header: "URL",
      accessor: (row) => (
        <span className="font-mono text-xs break-all">{row.url}</span>
      ),
    },
    {
      header: "Organization",
      accessor: (row) => row.organization?.name ?? "-",
    },
    {
      header: "Events",
      accessor: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.events.slice(0, 3).map((e) => (
            <Badge key={e} variant="secondary" className="text-xs">
              {e}
            </Badge>
          ))}
          {row.events.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{row.events.length - 3}
            </Badge>
          )}
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (row) => (
        <StatusBadge status={row.isActive ? "Active" : "Inactive"} />
      ),
    },
    {
      header: "Created",
      accessor: (row) =>
        new Date(row.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
    },
  ];

  const logColumns: Column<WebhookLog>[] = [
    {
      header: "Event",
      accessor: (row) => (
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
          {row.eventType}
        </code>
      ),
    },
    {
      header: "URL",
      accessor: (row) => (
        <span className="font-mono text-xs truncate max-w-[200px] block">
          {row.url}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "HTTP",
      accessor: (row) => (row.httpStatus ? String(row.httpStatus) : "-"),
    },
    {
      header: "Attempts",
      accessor: (row) => String(row.attempts),
    },
    {
      header: "Error",
      accessor: (row) => (
        <span className="text-xs text-muted-foreground truncate max-w-[200px] block">
          {row.errorMessage ?? "-"}
        </span>
      ),
    },
    {
      header: "Date",
      accessor: (row) =>
        new Date(row.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
    {
      header: "",
      accessor: (row) =>
        row.status === "failed" ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setResendDialog({ open: true, log: row });
            }}
          >
            <RefreshCw className="mr-1 h-3 w-3" />
            Resend
          </Button>
        ) : null,
      className: "w-24",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Webhooks</h1>

      <Tabs defaultValue="endpoints">
        <TabsList>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="logs">Delivery Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="mt-4">
          <DataTable
            columns={endpointColumns}
            data={endpointsData?.endpoints ?? []}
            isLoading={endpointsLoading}
            emptyTitle="No webhook endpoints"
            emptyDescription="No webhook endpoints have been configured."
          />
        </TabsContent>

        <TabsContent value="logs" className="mt-4">
          <DataTable
            columns={logColumns}
            data={logsData?.logs ?? []}
            isLoading={logsLoading}
            emptyTitle="No delivery logs"
            emptyDescription="No webhook delivery logs found."
            onRowClick={(row) => router.push(`/dashboard/webhooks/${row.id}`)}
          />
          {logsData && logsData.totalPages > 0 && (
            <DataTablePagination
              page={logsData.page}
              totalPages={logsData.totalPages}
              total={logsData.total}
              limit={logsLimit}
              onPageChange={setLogsPage}
              onLimitChange={(l) => {
                setLogsLimit(l);
                setLogsPage(1);
              }}
            />
          )}
        </TabsContent>
      </Tabs>

      <Dialog
        open={resendDialog.open}
        onOpenChange={(open) =>
          !open && setResendDialog({ open: false, log: null })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resend Webhook</DialogTitle>
            <DialogDescription>
              Are you sure you want to resend the{" "}
              <strong>{resendDialog.log?.eventType}</strong> webhook to{" "}
              <strong>{resendDialog.log?.url}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setResendDialog({ open: false, log: null })}
            >
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
