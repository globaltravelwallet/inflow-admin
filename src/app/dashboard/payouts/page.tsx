"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/use-api";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import type { Payout, PayoutsResponse } from "@/types/payout";
import type { Organization } from "@/types/organization";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ExternalLink, FastForward, XCircle } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { CancelPayoutDialog } from "@/components/payouts/cancel-payout-dialog";

export default function PayoutsPage() {
  const router = useRouter();
  const { data, isLoading, refetch } = useApi<PayoutsResponse>("/admin/payouts");
  const { data: orgs } = useApi<Organization[]>("/admin/organizations");
  
  const orgMap = useMemo(() => {
    const map = new Map<string, string>();
    if (Array.isArray(orgs)) {
      orgs.forEach((org) => map.set(org.id, org.name));
    }
    return map;
  }, [orgs]);

  const [cancelDialog, setCancelDialog] = useState<{
    open: boolean;
    payout: Payout | null;
  }>({ open: false, payout: null });

  const handleExpedite = async (id: string) => {
    try {
      await api.post(`/admin/payouts/${id}/expedite`);
      toast.success("Payout expedited successfully");
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to expedite payout");
    }
  };

  const handleCancel = async (reason: string) => {
    if (!cancelDialog.payout) return;
    try {
      await api.post(`/admin/payouts/${cancelDialog.payout.id}/cancel`, {
        reason,
      });
      toast.success("Payout cancelled successfully");
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to cancel payout");
    }
  };

  const columns: Column<Payout>[] = [
    {
      header: "Reference",
      accessor: (row) => (
        <span className="font-mono text-xs font-medium">{row.reference}</span>
      ),
    },
    {
      header: "Organization",
      accessor: (row) => {
        const name = row.organization?.name || orgMap.get(row.organizationId) || row.organizationId;
        return (
          <span className="truncate max-w-[120px] inline-block align-middle" title={name}>
            {name}
          </span>
        );
      },
    },
    {
      header: "Bank",
      accessor: (row) => row.bankAccount?.bankName ?? "-",
    },
    {
      header: "Account Name",
      accessor: (row) => row.bankAccount?.accountName ?? "-",
    },
    {
      header: "Amount",
      accessor: (row) => (
        <span className="font-medium">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: row.currency,
          }).format(parseFloat(row.amount))}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Scheduled Date",
      accessor: (row) =>
        new Date(row.scheduledDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
    },
    {
      header: "Created At",
      accessor: (row) =>
        new Date(row.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
    },
    {
      header: "",
      accessor: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/dashboard/payouts/${row.id}`);
              }}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            {row.status === "pending" && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleExpedite(row.id);
                }}
              >
                <FastForward className="mr-2 h-4 w-4" />
                Expedite
              </DropdownMenuItem>
            )}
            {(row.status === "pending" || row.status === "processing") && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setCancelDialog({ open: true, payout: row });
                }}
                className="text-destructive focus:text-destructive"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Cancel Payout
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      className: "w-10",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Payouts</h1>
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        emptyTitle="No payouts found"
        emptyDescription="There are no payouts matching your criteria."
        onRowClick={(row) => router.push(`/dashboard/payouts/${row.id}`)}
      />

      <CancelPayoutDialog
        open={cancelDialog.open}
        onOpenChange={(open) => !open && setCancelDialog({ open: false, payout: null })}
        onConfirm={handleCancel}
        reference={cancelDialog.payout?.reference ?? ""}
      />
    </div>
  );
}
