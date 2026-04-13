"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/use-api";
import type { Transaction } from "@/types/transaction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ArrowLeft, ArrowLeftRight, CreditCard, User, Building2, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: tx, isLoading, error } = useApi<Transaction>(
    `/admin/transactions/${id}`
  );

  if (isLoading) return <LoadingSkeleton rows={6} columns={2} />;

  if (error || !tx) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/transactions")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Transactions
        </Button>
        <EmptyState
          title="Transaction not available"
          description="This transaction could not be loaded. The endpoint may not be available yet."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/transactions")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold capitalize">{tx.type} Transaction</h1>
          <p className="font-mono text-sm text-muted-foreground">{tx.reference}</p>
        </div>
        <StatusBadge status={tx.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Transaction Details */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-3">
            <ArrowLeftRight className="h-5 w-5 text-primary" />
            <CardTitle>Transaction Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Type" value={tx.type} />
            <InfoRow label="Status" value={tx.status} />
            <InfoRow label="Source" value={tx.source} />
            <InfoRow label="Amount" value={`${tx.currency} ${Number(tx.amount).toLocaleString()}`} highlight />
            <InfoRow label="Fee" value={tx.fee ? `${tx.currency} ${Number(tx.fee).toLocaleString()}` : "-"} />
            {tx.balanceBefore && (
              <InfoRow label="Balance Before" value={`${tx.currency} ${Number(tx.balanceBefore).toLocaleString()}`} />
            )}
            {tx.balanceAfter && (
              <InfoRow label="Balance After" value={`${tx.currency} ${Number(tx.balanceAfter).toLocaleString()}`} />
            )}
            <InfoRow label="Description" value={tx.description ?? "-"} />
            {tx.narration && <InfoRow label="Narration" value={tx.narration} />}
            {tx.failureReason && (
              <div className="rounded-lg bg-destructive/10 p-2 text-sm text-destructive">
                <span className="font-medium">Failure: </span>{tx.failureReason}
              </div>
            )}
            <InfoRow label="Created" value={new Date(tx.createdAt).toLocaleString()} />
            <InfoRow label="Updated" value={new Date(tx.updatedAt).toLocaleString()} />
          </CardContent>
        </Card>

        {/* References */}
        <Card>
          <CardHeader>
            <CardTitle>References</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Reference" value={tx.reference} mono />
            <InfoRow label="External Ref" value={tx.externalReference ?? "-"} mono />
            <InfoRow label="Provider Ref" value={tx.providerReference ?? "-"} mono />
            <InfoRow label="Organization ID" value={tx.organizationId} mono />
            <InfoRow label="Customer ID" value={tx.customerId ?? "-"} mono />
            <InfoRow label="Card ID" value={tx.cardId ?? "-"} mono />
          </CardContent>
        </Card>

        {/* Card Info */}
        {tx.card && (
          <Card>
            <CardHeader className="flex flex-row items-center gap-3 pb-3">
              <CreditCard className="h-5 w-5 text-primary" />
              <CardTitle>Card</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="Masked PAN" value={tx.card.maskedPan} mono />
              <InfoRow label="Cardholder" value={tx.card.cardholderName} />
              <InfoRow label="Type" value={tx.card.cardType} />
              <InfoRow label="Brand" value={tx.card.brand.toUpperCase()} />
              <InfoRow label="Status">
                <StatusBadge status={tx.card.status} />
              </InfoRow>
              <InfoRow label="Expiry" value={tx.card.expiryDate} />
              <InfoRow label="Balance" value={`${tx.card.currency} ${Number(tx.card.balance).toLocaleString()}`} highlight />
              {tx.card.wallet && (
                <>
                  <div className="pt-2 border-t">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Wallet</p>
                    <InfoRow label="Account" value={tx.card.wallet.accountNumber ?? "-"} mono />
                    <InfoRow label="Bank" value={tx.card.wallet.bankName ?? "-"} />
                    <InfoRow label="Active" value={tx.card.wallet.isActive ? "Yes" : "No"} />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Customer Info */}
        {tx.customer && (
          <Card>
            <CardHeader className="flex flex-row items-center gap-3 pb-3">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="Name" value={`${tx.customer.firstName} ${tx.customer.lastName}`} />
              <InfoRow label="Email" value={tx.customer.email} />
              <InfoRow label="Phone" value={tx.customer.phone} />
              <InfoRow label="Gender" value={tx.customer.gender} />
              <InfoRow label="Date of Birth" value={tx.customer.dateOfBirth} />
              <InfoRow label="Identity Type" value={tx.customer.identityType} />
              <InfoRow label="Active" value={tx.customer.isActive ? "Yes" : "No"} />
            </CardContent>
          </Card>
        )}

        {/* Organization */}
        {tx.organization && (
          <Card>
            <CardHeader className="flex flex-row items-center gap-3 pb-3">
              <Building2 className="h-5 w-5 text-primary" />
              <CardTitle>Organization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="Name" value={tx.organization.name} />
              <InfoRow label="Type" value={tx.organization.type?.replace(/_/g, " ") ?? "-"} />
              <InfoRow label="Email" value={tx.organization.email ?? "-"} />
              <InfoRow label="Phone" value={tx.organization.phoneNumber ?? "-"} />
              <InfoRow label="RC Number" value={tx.organization.rcNumber ?? "-"} mono />
              <InfoRow label="Active">
                <StatusBadge status={tx.organization.isActive ? "Active" : "Inactive"} />
              </InfoRow>
            </CardContent>
          </Card>
        )}

        {/* Ledger Entries */}
        {tx.ledgerEntries && tx.ledgerEntries.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center gap-3 pb-3">
              <BookOpen className="h-5 w-5 text-primary" />
              <CardTitle>Ledger Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border divide-y">
                {tx.ledgerEntries.map((entry) => (
                  <div key={entry.id} className="p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Type</p>
                      <Badge variant="secondary" className="capitalize mt-1">{entry.type}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Amount</p>
                      <p className="font-semibold text-sm mt-1">{tx.currency} {Number(entry.amount).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Description</p>
                      <p className="text-sm mt-1">{entry.description}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Date</p>
                      <p className="text-sm mt-1">{new Date(entry.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="sm:col-span-2 lg:col-span-4">
                      <p className="text-xs text-muted-foreground">Reference</p>
                      <p className="font-mono text-xs mt-1 text-foreground break-all">{entry.reference}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Metadata */}
        {tx.metadata && Object.keys(tx.metadata).length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="overflow-auto rounded-lg bg-muted p-4 text-xs max-h-72">
                {JSON.stringify(tx.metadata, null, 2)}
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
            highlight ? "text-primary font-semibold text-base" : "",
          ].join(" ")}
        >
          {value}
        </span>
      )}
    </div>
  );
}
