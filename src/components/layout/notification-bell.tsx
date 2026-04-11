"use client";

import { Bell } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import Link from "next/link";

interface NotificationResponse {
  notifications: unknown[];
  total: number;
}

export function NotificationBell() {
  const { data } = useApi<NotificationResponse>("/admin/notifications", {
    limit: 1,
    read: false,
  });

  const unreadCount = data?.total ?? 0;

  return (
    <Link
      href="/dashboard/notifications"
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted hover:text-foreground"
    >
      <Bell className="h-4 w-4" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
      <span className="sr-only">Notifications</span>
    </Link>
  );
}
