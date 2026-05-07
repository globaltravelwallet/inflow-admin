"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/use-api";
import { StatusBadge } from "@/components/shared/status-badge";
import type { Payout } from "@/types/payout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, FastForward, XCircle, Building2, Landmark, Clock } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useState } from "react";
import { CancelPayoutDialog } from "@/components/payouts/cancel-payout-dialog";

export default function PayoutDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: payout, isLoading, refetch } = useApi<Payout>(`/admin/payouts/${id}`);
  const [cancelOpen, setCancelOpen] = useState(false);

  const handleExpedite = async () => {
    try {
      await api.post(`/admin/payouts/${id}/expedite`);
      toast.success("Payout expedited successfully");
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to expedite payout");
    }
  };

  const handleCancel = async (reason: string) => {
    try {
      await api.post(`/admin/payouts/${id}/cancel`, { reason });
      toast.success("Payout cancelled successfully");
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to cancel payout");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!payout) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Payout not found</h2>
        <Button variant="link" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    );
  }

  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: payout.currency,
  }).format(parseFloat(payout.amount));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Payout Details</h1>
        <StatusBadge status={payout.status} className="ml-auto" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Details */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Reference</p>
                <p className="font-mono font-medium">{payout.reference}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="text-xl font-bold">{formattedAmount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Scheduled Date</p>
                <p className="font-medium">{new Date(payout.scheduledDate).toDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created At</p>
                <p className="font-medium">{new Date(payout.createdAt).toLocaleString()}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Landmark className="h-4 w-4 text-muted-foreground" />
                Destination Account
              </h3>
              {payout.bankAccount ? (
                <div className="grid grid-cols-2 gap-4 bg-muted/50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Bank Name</p>
                    <p className="font-medium">{payout.bankAccount.bankName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Account Number</p>
                    <p className="font-mono font-medium">{payout.bankAccount.accountNumber}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Account Name</p>
                    <p className="font-medium">{payout.bankAccount.accountName}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No bank account details available.</p>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Processing Timeline
              </h3>
              <div className="space-y-3">
                 {payout.processedAt && (
                   <div className="flex items-center gap-4 text-sm">
                     <div className="w-2 h-2 rounded-full bg-green-500" />
                     <span className="text-muted-foreground w-24">Processed:</span>
                     <span>{new Date(payout.processedAt).toLocaleString()}</span>
                   </div>
                 )}
                 {payout.isExpedited && (
                   <div className="flex items-center gap-4 text-sm">
                     <div className="w-2 h-2 rounded-full bg-blue-500" />
                     <span className="text-muted-foreground w-24">Expedited:</span>
                     <span>{new Date(payout.expeditedAt!).toLocaleString()}</span>
                   </div>
                 )}
                 {payout.status === "cancelled" && (
                   <div className="flex items-center gap-4 text-sm">
                     <div className="w-2 h-2 rounded-full bg-red-500" />
                     <span className="text-muted-foreground w-24">Cancelled:</span>
                     <div className="space-y-1">
                        <p>{new Date(payout.cancelledAt!).toLocaleString()}</p>
                        <p className="text-xs text-destructive bg-destructive/10 px-2 py-1 rounded">Reason: {payout.cancelReason}</p>
                     </div>
                   </div>
                 )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar Info & Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                Organization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               {payout.organization ? (
                 <>
                   <div>
                     <p className="text-sm font-medium">{payout.organization.name}</p>
                     <p className="text-xs text-muted-foreground">{payout.organization.email}</p>
                   </div>
                   <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => router.push(`/dashboard/organizations/${payout.organizationId}`)}
                   >
                     View Organization
                   </Button>
                 </>
               ) : (
                 <p className="text-sm text-muted-foreground italic">Organization info missing.</p>
               )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start" 
                variant="default"
                disabled={payout.status !== "pending" || payout.isExpedited}
                onClick={handleExpedite}
              >
                <FastForward className="mr-2 h-4 w-4" />
                Expedite Payout
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="destructive"
                disabled={payout.status !== "pending" && payout.status !== "processing"}
                onClick={() => setCancelOpen(true)}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Cancel Payout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <CancelPayoutDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        onConfirm={handleCancel}
        reference={payout.reference}
      />
    </div>
  );
}
