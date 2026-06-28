"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "@/hooks/use-api";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import type { CompanyKyc } from "@/types/kyc";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, CheckCircle, XCircle } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";

type KycAction = "approve" | "reject";

function ownerName(kyc: CompanyKyc): string {
  const owner = kyc.organization?.owner;
  const name = [owner?.firstName, owner?.lastName].filter(Boolean).join(" ");
  return name || owner?.email || "-";
}

export default function KycPage() {
  const { data, isLoading, refetch } = useApi<CompanyKyc[]>("/admin/kyc");
  const navigate = useNavigate();
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    kyc: CompanyKyc | null;
    action: KycAction;
  }>({ open: false, kyc: null, action: "approve" });
  const [reason, setReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const closeDialog = () => {
    setActionDialog({ open: false, kyc: null, action: "approve" });
    setReason("");
  };

  const handleAction = async () => {
    if (!actionDialog.kyc) return;
    if (actionDialog.action === "reject" && !reason.trim()) {
      toast.error("A rejection reason is required");
      return;
    }
    setActionLoading(true);
    try {
      await api.post(
        `/admin/kyc/${actionDialog.kyc.id}/${actionDialog.action}`,
        actionDialog.action === "reject" ? { reason: reason.trim() } : undefined
      );
      toast.success(
        actionDialog.action === "approve"
          ? "KYC approved — the organization owner has been notified by email"
          : "KYC rejected — the organization owner has been notified by email"
      );
      closeDialog();
      refetch();
    } catch (err: unknown) {
      const message =
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message
          ? (err as { response: { data: { message: string } } }).response.data
              .message
          : `Failed to ${actionDialog.action} KYC`;
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const columns: Column<CompanyKyc>[] = [
    {
      header: "Company",
      accessor: (row) => row.companyName || row.organization?.name || "-",
    },
    { header: "RC Number", accessor: (row) => row.rcNumber || "-" },
    { header: "Owner", accessor: (row) => ownerName(row) },
    {
      header: "Status",
      accessor: (row) => (
        <StatusBadge status={row.status.replace(/_/g, " ")} />
      ),
    },
    {
      header: "Submitted",
      accessor: (row) =>
        row.submittedAt
          ? new Date(row.submittedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "-",
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
                navigate(`/dashboard/kyc/${row.id}`);
              }}
            >
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setActionDialog({ open: true, kyc: row, action: "approve" });
              }}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setActionDialog({ open: true, kyc: row, action: "reject" });
              }}
              variant="destructive"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      className: "w-10",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">KYC Requests</h1>
        <p className="text-sm text-muted-foreground">
          Review and decide on organization verification requests.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={data ?? []}
        isLoading={isLoading}
        emptyTitle="No pending KYC requests"
        emptyDescription="There are no organization KYC requests awaiting review."
        onRowClick={(row) => navigate(`/dashboard/kyc/${row.id}`)}
      />

      <Dialog
        open={actionDialog.open}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="capitalize">
              {actionDialog.action} KYC
            </DialogTitle>
            <DialogDescription>
              {actionDialog.action === "approve" ? (
                <>
                  Approve the KYC for{" "}
                  <strong>
                    {actionDialog.kyc?.companyName ||
                      actionDialog.kyc?.organization?.name}
                  </strong>
                  ? The organization owner will be notified by email.
                </>
              ) : (
                <>
                  Reject the KYC for{" "}
                  <strong>
                    {actionDialog.kyc?.companyName ||
                      actionDialog.kyc?.organization?.name}
                  </strong>
                  ? The reason below will be emailed to the organization owner.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {actionDialog.action === "reject" && (
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection reason</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain what needs to be corrected before resubmission..."
                rows={4}
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              variant={
                actionDialog.action === "reject" ? "destructive" : "default"
              }
              onClick={handleAction}
              disabled={actionLoading}
            >
              {actionLoading
                ? "Processing..."
                : `Yes, ${actionDialog.action}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
