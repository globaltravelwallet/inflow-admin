"use client";

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApi } from "@/hooks/use-api";
import type { CompanyKyc } from "@/types/kyc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { StatusBadge } from "@/components/shared/status-badge";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { ArrowLeft, CheckCircle, XCircle, FileText } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";

type KycAction = "approve" | "reject";

const DOCUMENTS: { label: string; key: keyof CompanyKyc }[] = [
  { label: "CAC Certificate", key: "cacCertificateUrl" },
  { label: "Proof of Address", key: "proofOfAddressUrl" },
  { label: "Valid ID", key: "validIdUrl" },
];

export default function KycDetailPage() {
  const { id } = useParams() as { id: string };
  const navigate = useNavigate();
  const { data: kyc, isLoading, refetch } = useApi<CompanyKyc>(
    `/admin/kyc/${id}`
  );
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: KycAction;
  }>({ open: false, action: "approve" });
  const [reason, setReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const closeDialog = () => {
    setActionDialog({ open: false, action: "approve" });
    setReason("");
  };

  const handleAction = async () => {
    if (actionDialog.action === "reject" && !reason.trim()) {
      toast.error("A rejection reason is required");
      return;
    }
    setActionLoading(true);
    try {
      await api.post(
        `/admin/kyc/${id}/${actionDialog.action}`,
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

  if (isLoading) return <LoadingSkeleton rows={6} columns={2} />;

  if (!kyc) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">KYC request not found</p>
      </div>
    );
  }

  const owner = kyc.organization?.owner;
  const ownerNameValue =
    [owner?.firstName, owner?.lastName].filter(Boolean).join(" ") ||
    owner?.email ||
    "-";
  const isPending = kyc.status === "pending" || kyc.status === "under_review";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard/kyc")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {kyc.companyName || kyc.organization?.name || "KYC Request"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {kyc.organization?.name ?? kyc.organizationId}
            </p>
          </div>
          <StatusBadge status={kyc.status.replace(/_/g, " ")} />
        </div>
        {isPending && (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => setActionDialog({ open: true, action: "approve" })}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setActionDialog({ open: true, action: "reject" })}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
          </div>
        )}
      </div>

      {kyc.status === "rejected" && kyc.rejectionReason && (
        <Card className="border-red-200 dark:border-red-900/40">
          <CardHeader>
            <CardTitle className="text-base">Rejection Reason</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {kyc.rejectionReason}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Company Name" value={kyc.companyName ?? "-"} />
            <InfoRow label="RC Number" value={kyc.rcNumber ?? "-"} />
            <InfoRow label="NIN" value={kyc.ninNumber ?? "-"} />
            <InfoRow
              label="Submitted"
              value={
                kyc.submittedAt
                  ? new Date(kyc.submittedAt).toLocaleString()
                  : "-"
              }
            />
            <InfoRow
              label="Reviewed"
              value={
                kyc.reviewedAt
                  ? new Date(kyc.reviewedAt).toLocaleString()
                  : "-"
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Owner Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Name" value={ownerNameValue} />
            <InfoRow label="Email" value={owner?.email ?? "-"} />
            <InfoRow label="Phone" value={owner?.phoneNumber ?? "-"} />
            <InfoRow
              label="Organization Email"
              value={kyc.organization?.email ?? "-"}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Registered Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Address Line 1" value={kyc.addressLine1 ?? "-"} />
            <InfoRow label="Address Line 2" value={kyc.addressLine2 ?? "-"} />
            <InfoRow label="City" value={kyc.city ?? "-"} />
            <InfoRow label="State" value={kyc.state ?? "-"} />
            <InfoRow label="Postal Code" value={kyc.postalCode ?? "-"} />
            <InfoRow label="Country" value={kyc.country ?? "-"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {DOCUMENTS.map((doc) => {
              const url = kyc[doc.key] as string | null;
              return (
                <div
                  key={doc.key}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground">{doc.label}</span>
                  {url ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      View
                    </a>
                  ) : (
                    <span className="font-medium">-</span>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

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
                    {kyc.companyName || kyc.organization?.name}
                  </strong>
                  ? The organization owner will be notified by email.
                </>
              ) : (
                <>
                  Reject the KYC for{" "}
                  <strong>
                    {kyc.companyName || kyc.organization?.name}
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
              {actionLoading ? "Processing..." : `Yes, ${actionDialog.action}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
