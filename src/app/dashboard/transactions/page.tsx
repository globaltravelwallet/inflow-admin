"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "@/hooks/use-api";
import { DataTable, type Column } from "@/components/shared/data-table";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { StatusBadge } from "@/components/shared/status-badge";
import type { Transaction } from "@/types/transaction";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

interface TransactionsResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const txTypes = ["debit", "credit", "transfer", "payment", "refund"];
const txStatuses = ["pending", "completed", "failed", "cancelled", "reversed"];
const txSources = ["internal", "plaid", "flutterwave"];

export default function TransactionsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [currencyFilter, setCurrencyFilter] = useState("");
  const debouncedCurrency = useDebounce(currencyFilter);

  const params: Record<string, unknown> = { page, limit, sortOrder: "DESC" };
  if (typeFilter) params.type = typeFilter;
  if (statusFilter) params.status = statusFilter;
  if (sourceFilter) params.source = sourceFilter;
  if (debouncedCurrency) params.currency = debouncedCurrency;

  const { data, isLoading, error } = useApi<TransactionsResponse>(
    "/admin/transactions",
    params
  );

  const hasFilters = typeFilter || statusFilter || sourceFilter || currencyFilter;

  const clearFilters = () => {
    setTypeFilter("");
    setStatusFilter("");
    setSourceFilter("");
    setCurrencyFilter("");
    setPage(1);
  };

  const columns: Column<Transaction>[] = [
    {
      header: "Type",
      accessor: (row) => (
        <span className="capitalize font-medium">{row.type}</span>
      ),
    },
    {
      header: "Amount",
      accessor: (row) => (
        <span className="font-mono">
          {row.currency} {row.amount.toLocaleString()}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Source",
      accessor: (row) => <span className="capitalize">{row.source}</span>,
    },
    {
      header: "Reference",
      accessor: (row) => (
        <span className="font-mono text-xs">{row.reference ?? "-"}</span>
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

  const isNotFound = error && !data;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Transactions</h1>

      <div className="flex items-center gap-3 flex-wrap">
        <Select
          value={typeFilter}
          onValueChange={(val) => {
            setTypeFilter(val ?? "");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            {txTypes.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(val) => {
            setStatusFilter(val ?? "");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {txStatuses.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={sourceFilter}
          onValueChange={(val) => {
            setSourceFilter(val ?? "");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            {txSources.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="Currency (e.g. USD)"
          value={currencyFilter}
          onChange={(e) => {
            setCurrencyFilter(e.target.value);
            setPage(1);
          }}
          className="w-[160px]"
        />

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-1 h-3 w-3" />
            Clear
          </Button>
        )}
      </div>

      {isNotFound ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <p className="text-lg font-medium">Transactions not available</p>
          <p className="mt-1 text-sm text-muted-foreground">
            The transactions endpoint is not yet available. Please check back
            later.
          </p>
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={(data as TransactionsResponse)?.transactions ?? []}
            isLoading={isLoading}
            emptyTitle="No transactions"
            emptyDescription="No transactions match your filters."
            onRowClick={(row) => navigate(`/dashboard/transactions/${row.id}`)}
          />

          {data && (data as TransactionsResponse).totalPages > 0 && (
            <DataTablePagination
              page={(data as TransactionsResponse).page}
              totalPages={(data as TransactionsResponse).totalPages}
              total={(data as TransactionsResponse).total}
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
