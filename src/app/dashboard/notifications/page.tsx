"use client";

import { useState } from "react";
import { useApi } from "@/hooks/use-api";
import { DataTable, type Column } from "@/components/shared/data-table";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { StatusBadge } from "@/components/shared/status-badge";
import type { Notification } from "@/types/notification";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const notificationTypes = [
  "transaction_alert",
  "security_alert",
  "system_notification",
  "payment_update",
  "card_alert",
];

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [typeFilter, setTypeFilter] = useState<string>("");

  const params: Record<string, unknown> = { page, limit };
  if (typeFilter) params.type = typeFilter;

  const { data, isLoading } = useApi<NotificationsResponse>(
    "/admin/notifications",
    params
  );

  const columns: Column<Notification>[] = [
    { header: "Title", accessor: "title" },
    {
      header: "Type",
      accessor: (row) => (
        <StatusBadge status={row.type} />
      ),
    },
    {
      header: "User",
      accessor: (row) => row.user?.email ?? "-",
    },
    {
      header: "Priority",
      accessor: (row) => (
        <span className="capitalize">{row.priority}</span>
      ),
    },
    {
      header: "Read",
      accessor: (row) => (
        <StatusBadge status={row.read ? "true" : "false"} />
      ),
    },
    {
      header: "Date",
      accessor: (row) =>
        new Date(row.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Notifications</h1>

      <div className="flex items-center gap-3">
        <Select
          value={typeFilter}
          onValueChange={(val) => {
            setTypeFilter(val ?? "");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            {notificationTypes.map((t) => (
              <SelectItem key={t} value={t}>
                {t.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {typeFilter && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setTypeFilter("");
              setPage(1);
            }}
          >
            <X className="mr-1 h-3 w-3" />
            Clear
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={data?.notifications ?? []}
        isLoading={isLoading}
        emptyTitle="No notifications"
        emptyDescription="There are no notifications to display."
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
