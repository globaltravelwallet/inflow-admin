"use client";

import { useState } from "react";
import { useApi } from "@/hooks/use-api";
import { DataTable, type Column } from "@/components/shared/data-table";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { StatusBadge } from "@/components/shared/status-badge";
import type { Payment } from "@/types/payment";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface PaymentsResponse {
  payments: Payment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const regions = ["us", "eu", "uk"];

export default function PaymentsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [statusFilter, setStatusFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");

  const params: Record<string, unknown> = { page, limit };
  if (statusFilter) params.status = statusFilter;
  if (regionFilter) params.region = regionFilter;

  const { data, isLoading, error } = useApi<PaymentsResponse>(
    "/admin/payments",
    params
  );

  const hasFilters = statusFilter || regionFilter;

  const clearFilters = () => {
    setStatusFilter("");
    setRegionFilter("");
    setPage(1);
  };

  const columns: Column<Payment>[] = [
    {
      header: "Reference",
      accessor: (row) => (
        <span className="font-mono text-xs">{row.reference ?? "-"}</span>
      ),
    },
    {
      header: "Source",
      accessor: (row) => (
        <span className="font-mono">
          {row.sourceCurrency} {row.sourceAmount.toLocaleString()}
        </span>
      ),
    },
    {
      header: "Target",
      accessor: (row) => (
        <span className="font-mono">
          {row.targetCurrency} {row.targetAmount.toLocaleString()}
        </span>
      ),
    },
    {
      header: "Rate",
      accessor: (row) => row.exchangeRate,
    },
    {
      header: "Region",
      accessor: (row) => (
        <span className="uppercase font-medium">{row.region}</span>
      ),
    },
    {
      header: "Status",
      accessor: (row) => <StatusBadge status={row.status} />,
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

  const isNotFound = error && !data;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Payments</h1>

      <div className="flex items-center gap-3 flex-wrap">
        <Select
          value={statusFilter}
          onValueChange={(val) => {
            setStatusFilter(val ?? "");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {["pending", "completed", "failed", "cancelled"].map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={regionFilter}
          onValueChange={(val) => {
            setRegionFilter(val ?? "");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Region" />
          </SelectTrigger>
          <SelectContent>
            {regions.map((r) => (
              <SelectItem key={r} value={r}>
                {r.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-1 h-3 w-3" />
            Clear
          </Button>
        )}
      </div>

      {isNotFound ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <p className="text-lg font-medium">Payments not available</p>
          <p className="mt-1 text-sm text-muted-foreground">
            The payments endpoint is not yet available. Please check back later.
          </p>
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={(data as PaymentsResponse)?.payments ?? []}
            isLoading={isLoading}
            emptyTitle="No payments"
            emptyDescription="No payments match your filters."
          />

          {data && (data as PaymentsResponse).totalPages > 0 && (
            <DataTablePagination
              page={(data as PaymentsResponse).page}
              totalPages={(data as PaymentsResponse).totalPages}
              total={(data as PaymentsResponse).total}
              limit={limit}
              onPageChange={setPage}
              onLimitChange={(l) => {
                setLimit(l);
                setPage(1);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
