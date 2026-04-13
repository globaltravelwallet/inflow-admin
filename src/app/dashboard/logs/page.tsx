"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/use-api";
import { DataTable, type Column } from "@/components/shared/data-table";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { StatusBadge } from "@/components/shared/status-badge";
import type { AuditLog } from "@/types/audit-log";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface LogsResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const actions = [
  "create",
  "update",
  "delete",
  "view",
  "approve",
  "reject",
  "login",
  "logout",
];

const resourceTypes = [
  "user",
  "organization",
  "customer",
  "card",
  "transaction",
  "wallet",
  "payment",
  "api_key",
  "webhook",
];

export default function AuditLogsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [actionFilter, setActionFilter] = useState<string>("");
  const [resourceFilter, setResourceFilter] = useState<string>("");

  const params: Record<string, unknown> = { page, limit };
  if (actionFilter) params.action = actionFilter;
  if (resourceFilter) params.resourceType = resourceFilter;

  const { data, isLoading } = useApi<LogsResponse>("/admin/logs", params);

  const hasFilters = actionFilter || resourceFilter;

  const clearFilters = () => {
    setActionFilter("");
    setResourceFilter("");
    setPage(1);
  };

  const columns: Column<AuditLog>[] = [
    {
      header: "Action",
      accessor: (row) => (
        <span className="capitalize font-medium">
          {row.action.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      header: "Resource",
      accessor: (row) => (
        <span className="capitalize">{row.resourceType.replace(/_/g, " ")}</span>
      ),
    },
    { header: "Description", accessor: "description" },
    {
      header: "User",
      accessor: (row) => row.user?.email ?? "-",
    },
    {
      header: "Method",
      accessor: (row) => (
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
          {row.requestMethod}
        </code>
      ),
    },
    {
      header: "Status",
      accessor: (row) => (
        <StatusBadge status={row.success ? "success" : "failed"} />
      ),
    },
    {
      header: "IP",
      accessor: "ipAddress",
      className: "font-mono text-xs",
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
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Audit Logs</h1>

      <div className="flex items-center gap-3 flex-wrap">
        <Select
          value={actionFilter}
          onValueChange={(val) => {
            setActionFilter(val ?? "");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            {actions.map((a) => (
              <SelectItem key={a} value={a}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={resourceFilter}
          onValueChange={(val) => {
            setResourceFilter(val ?? "");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Resource type" />
          </SelectTrigger>
          <SelectContent>
            {resourceTypes.map((r) => (
              <SelectItem key={r} value={r}>
                {r.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-1 h-3 w-3" />
            Clear filters
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={data?.logs ?? []}
        isLoading={isLoading}
        emptyTitle="No audit logs"
        emptyDescription="There are no audit logs matching your filters."
        onRowClick={(row) => router.push(`/dashboard/logs/${row.id}`)}
      />

      {data && data.totalPages > 0 && (
        <DataTablePagination
          page={data.page}
          totalPages={data.totalPages}
          total={data.total}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={(l) => {
            setLimit(l);
            setPage(1);
          }}
        />
      )}
    </div>
  );
}
