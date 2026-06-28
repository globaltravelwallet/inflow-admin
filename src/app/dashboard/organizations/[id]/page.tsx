"use client";

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApi } from "@/hooks/use-api";
import type { Organization } from "@/types/organization";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { ArrowLeft, CheckCircle, Ban, Unlock } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";

type OrgAction = "approve" | "block" | "unblock";

export default function OrganizationDetailPage() {
  const { id } = useParams() as { id: string };
  const navigate = useNavigate();
  const { data: org, isLoading, refetch } = useApi<Organization>(
    `/admin/organizations/${id}`
  );
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: OrgAction;
  }>({ open: false, action: "approve" });
  const [actionLoading, setActionLoading] = useState(false);

  const handleAction = async () => {
    setActionLoading(true);
    try {
      await api.post(`/admin/organizations/${id}/${actionDialog.action}`);
      toast.success(`Organization ${actionDialog.action}ed successfully`);
      setActionDialog({ open: false, action: "approve" });
      refetch();
    } catch {
      toast.error(`Failed to ${actionDialog.action} organization`);
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) return <LoadingSkeleton rows={6} columns={2} />;

  if (!org) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Organization not found</p>
      </div>
    );
  }

  const ownerName = [org.owner?.firstName, org.owner?.lastName]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard/organizations")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{org.name}</h1>
            <p className="text-sm text-muted-foreground">{org.slug}</p>
          </div>
          <StatusBadge status={org.isActive ? "Active" : "Inactive"} />
        </div>
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
            onClick={() => setActionDialog({ open: true, action: "block" })}
          >
            <Ban className="mr-2 h-4 w-4" />
            Block
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setActionDialog({ open: true, action: "unblock" })}
          >
            <Unlock className="mr-2 h-4 w-4" />
            Unblock
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Organization Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Type" value={org.type?.replace(/_/g, " ") ?? "-"} />
            <InfoRow label="Email" value={org.email ?? "-"} />
            <InfoRow label="Phone" value={org.phoneNumber ?? "-"} />
            <InfoRow label="Website" value={org.website ?? "-"} />
            <InfoRow label="RC Number" value={org.rcNumber ?? "-"} />
            <InfoRow
              label="Created"
              value={new Date(org.createdAt).toLocaleDateString()}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Owner Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Name" value={ownerName || "-"} />
            <InfoRow label="Email" value={org.owner?.email ?? "-"} />
            <InfoRow label="Phone" value={org.owner?.phoneNumber ?? "-"} />
            <InfoRow
              label="KYC Status"
              value={org.owner?.kycStatus ?? "-"}
            />
            <InfoRow
              label="Email Verified"
              value={org.owner?.emailVerified ? "Yes" : "No"}
            />
          </CardContent>
        </Card>

        {org.address && (
          <Card>
            <CardHeader>
              <CardTitle>Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="Street" value={org.address.street} />
              <InfoRow label="City" value={org.address.city} />
              <InfoRow label="State" value={org.address.state} />
              <InfoRow label="Postal Code" value={org.address.postalCode} />
              <InfoRow label="Country" value={org.address.country} />
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog
        open={actionDialog.open}
        onOpenChange={(open) =>
          !open && setActionDialog({ open: false, action: "approve" })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="capitalize">
              {actionDialog.action} Organization
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to {actionDialog.action}{" "}
              <strong>{org.name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialog({ open: false, action: "approve" })}
            >
              Cancel
            </Button>
            <Button
              variant={
                actionDialog.action === "block" ? "destructive" : "default"
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
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium capitalize">{value}</span>
    </div>
  );
}
