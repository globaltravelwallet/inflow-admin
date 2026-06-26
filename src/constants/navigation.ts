import {
  LayoutDashboard,
  Building2,
  ShieldCheck,
  ArrowLeftRight,
  CreditCard,
  Banknote,
  Bell,
  ScrollText,
  Webhook,
} from "lucide-react";

export const navItems = [
  { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { title: "Organizations", href: "/dashboard/organizations", icon: Building2 },
  { title: "KYC Requests", href: "/dashboard/kyc", icon: ShieldCheck },
  {
    title: "Transactions",
    href: "/dashboard/transactions",
    icon: ArrowLeftRight,
  },
  { title: "Payments", href: "/dashboard/payments", icon: CreditCard },
  { title: "Payouts", href: "/dashboard/payouts", icon: Banknote },
  { title: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { title: "Audit Logs", href: "/dashboard/logs", icon: ScrollText },
  { title: "Webhooks", href: "/dashboard/webhooks", icon: Webhook },
];
