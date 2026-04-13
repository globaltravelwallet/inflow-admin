"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/use-api";
import type { Payment } from "@/types/payment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ArrowLeft, CreditCard, User, Building2, ExternalLink } from "lucide-react";

export default function PaymentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: payment, isLoading, error } = useApi<Payment>(
    `/admin/payments/${id}`
  );

  if (isLoading) return <LoadingSkeleton rows={6} columns={2} />;

  if (error || !payment) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/payments")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Payments
        </Button>
        <EmptyState
          title="Payment not available"
          description="This payment could not be loaded. The endpoint may not be available yet."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/payments")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Payment Request</h1>
          <p className="font-mono text-sm text-muted-foreground">{payment.reference}</p>
        </div>
        <StatusBadge status={payment.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Payment Details */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-3">
            <CreditCard className="h-5 w-5 text-primary" />
            <CardTitle>Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Status" value={payment.status} />
            <InfoRow label="Region" value={payment.region.toUpperCase()} />
            <InfoRow
              label="Source Amount"
              value={`${payment.sourceCurrency} ${Number(payment.sourceAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
              highlight
            />
            <InfoRow
              label="Target Amount"
              value={`${payment.targetCurrency} ${Number(payment.targetAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
              highlight
            />
            <InfoRow label="Exchange Rate" value={Number(payment.exchangeRate).toLocaleString()} />
            <InfoRow label="Description" value={payment.description ?? "-"} />
            <InfoRow label="Payer Name" value={payment.payerName ?? "-"} />
            <InfoRow label="Payer Email" value={payment.payerEmail ?? "-"} />
            {payment.failureReason && (
              <div className="rounded-lg bg-destructive/10 p-2 text-sm text-destructive">
                <span className="font-medium">Failure: </span>{payment.failureReason}
              </div>
            )}
            <InfoRow label="Created" value={new Date(payment.createdAt).toLocaleString()} />
            {payment.paidAt && (
              <InfoRow label="Paid At" value={new Date(payment.paidAt).toLocaleString()} />
            )}
            {payment.expiresAt && (
              <InfoRow label="Expires At" value={new Date(payment.expiresAt).toLocaleString()} />
            )}
          </CardContent>
        </Card>

        {/* Plaid Details */}
        <Card>
          <CardHeader>
            <CardTitle>Plaid Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Payment ID" value={payment.plaidPaymentId ?? "-"} mono />
            <InfoRow label="Recipient ID" value={payment.plaidRecipientId ?? "-"} mono />
            <InfoRow label="Transfer ID" value={payment.plaidTransferId ?? "-"} mono />
            <InfoRow label="Authorization ID" value={payment.plaidAuthorizationId ?? "-"} mono />
            <InfoRow label="Link Token" value={payment.linkToken ? payment.linkToken.slice(0, 30) + "..." : "-"} mono />
            {payment.linkTokenExpiration && (
              <InfoRow label="Token Expires" value={new Date(payment.linkTokenExpiration).toLocaleString()} />
            )}
            {payment.hostedLinkUrl && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Hosted Link</span>
                <a
                  href={payment.hostedLinkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                >
                  Open <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer */}
        {payment.customer && (
          <Card>
            <CardHeader className="flex flex-row items-center gap-3 pb-3">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="Name" value={`${payment.customer.firstName} ${payment.customer.lastName}`} />
              <InfoRow label="Email" value={payment.customer.email} />
              <InfoRow label="Phone" value={payment.customer.phone} />
              <InfoRow label="Gender" value={payment.customer.gender} />
              <InfoRow label="Date of Birth" value={payment.customer.dateOfBirth} />
              <InfoRow label="Identity Type" value={payment.customer.identityType} />
              <InfoRow label="Active" value={payment.customer.isActive ? "Yes" : "No"} />
              {payment.customer.identityImage && (
                <div className="pt-2">
                  <p className="text-xs text-muted-foreground mb-2">Identity Document</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={payment.customer.identityImage}
                    alt="Identity Document"
                    className="w-full rounded-lg border object-cover max-h-40"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Organization */}
        {payment.organization && (
          <Card>
            <CardHeader className="flex flex-row items-center gap-3 pb-3">
              <Building2 className="h-5 w-5 text-primary" />
              <CardTitle>Organization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="Name" value={payment.organization.name} />
              <InfoRow label="Type" value={payment.organization.type?.replace(/_/g, " ") ?? "-"} />
              <InfoRow label="Email" value={payment.organization.email ?? "-"} />
              <InfoRow label="Phone" value={payment.organization.phoneNumber ?? "-"} />
              <InfoRow label="RC Number" value={payment.organization.rcNumber ?? "-"} mono />
              <InfoRow label="Active">
                <StatusBadge status={payment.organization.isActive ? "Active" : "Inactive"} />
              </InfoRow>
            </CardContent>
          </Card>
        )}

        {/* Metadata */}
        {payment.metadata && Object.keys(payment.metadata).length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="overflow-auto rounded-lg bg-muted p-4 text-xs max-h-72">
                {JSON.stringify(payment.metadata, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono,
  highlight,
  children,
}: {
  label: string;
  value?: string;
  mono?: boolean;
  highlight?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-center gap-4 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      {children ?? (
        <span
          className={[
            "text-right font-medium",
            mono ? "font-mono text-xs" : "",
            highlight ? "text-primary font-semibold" : "",
          ].join(" ")}
        >
          {value}
        </span>
      )}
    </div>
  );
}
