"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "@/hooks/use-api";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import type { Organization } from "@/types/organization";
import { Button } from "@/components/ui/button";
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
import { MoreHorizontal, CheckCircle, Ban, Unlock } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";

type OrgAction = "approve" | "block" | "unblock";

export default function OrganizationsPage() {
  const { data, isLoading, refetch } = useApi<Organization[]>("/admin/organizations");
  const navigate = useNavigate();
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    org: Organization | null;
    action: OrgAction;
  }>({ open: false, org: null, action: "approve" });
  const [actionLoading, setActionLoading] = useState(false);

  const handleAction = async () => {
    if (!actionDialog.org) return;
    setActionLoading(true);
    try {
      await api.post(
        `/admin/organizations/${actionDialog.org.id}/${actionDialog.action}`
      );
      toast.success(
        `Organization ${actionDialog.action}${actionDialog.action === "approve" ? "d" : actionDialog.action === "block" ? "ed" : "ed"} successfully`
      );
      setActionDialog({ open: false, org: null, action: "approve" });
      refetch();
    } catch {
      toast.error(`Failed to ${actionDialog.action} organization`);
    } finally {
      setActionLoading(false);
    }
  };

  const columns: Column<Organization>[] = [
    { header: "Name", accessor: "name" },
    {
      header: "Type",
      accessor: (row) => (
        <span className="capitalize">{row.type?.replace(/_/g, " ") ?? "-"}</span>
      ),
    },
    { header: "Email", accessor: (row) => row.email ?? "-" },
    {
      header: "Owner",
      accessor: (row) => {
        const name = [row.owner?.firstName, row.owner?.lastName]
          .filter(Boolean)
          .join(" ");
        return name || row.owner?.email || "-";
      },
    },
    {
      header: "Status",
      accessor: (row) => (
        <StatusBadge status={row.isActive ? "Active" : "Inactive"} />
      ),
    },
    {
      header: "Created",
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
                navigate(`/dashboard/organizations/${row.id}`);
              }}
            >
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setActionDialog({ open: true, org: row, action: "approve" });
              }}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setActionDialog({ open: true, org: row, action: "block" });
              }}
              variant="destructive"
            >
              <Ban className="mr-2 h-4 w-4" />
              Block
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setActionDialog({ open: true, org: row, action: "unblock" });
              }}
            >
              <Unlock className="mr-2 h-4 w-4" />
              Unblock
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      className: "w-10",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Organizations</h1>

      <DataTable
        columns={columns}
        data={data ?? []}
        isLoading={isLoading}
        emptyTitle="No organizations"
        emptyDescription="There are no organizations to display."
        onRowClick={(row) => navigate(`/dashboard/organizations/${row.id}`)}
      />

      <Dialog
        open={actionDialog.open}
        onOpenChange={(open) =>
          !open && setActionDialog({ open: false, org: null, action: "approve" })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="capitalize">
              {actionDialog.action} Organization
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to {actionDialog.action}{" "}
              <strong>{actionDialog.org?.name}</strong>? This action can be
              reversed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setActionDialog({ open: false, org: null, action: "approve" })
              }
            >
              Cancel
            </Button>
            <Button
              variant={actionDialog.action === "block" ? "destructive" : "default"}
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
