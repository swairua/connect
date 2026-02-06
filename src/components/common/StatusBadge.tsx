import { Badge } from "@/components/ui/badge";

type StatusType = "Active" | "Grace" | "Suspended" | "Paid" | "Pending" | "Overdue" | "Success" | "Failed" | "Open" | "In Progress" | "Closed";

interface StatusBadgeProps {
  status: StatusType;
}

const statusVariantMap: Record<StatusType, "active" | "grace" | "suspended" | "paid" | "pending" | "overdue" | "success" | "destructive" | "info" | "secondary" | "warning"> = {
  Active: "active",
  Grace: "grace",
  Suspended: "suspended",
  Paid: "paid",
  Pending: "pending",
  Overdue: "overdue",
  Success: "success",
  Failed: "destructive",
  Open: "warning",
  "In Progress": "info",
  Closed: "secondary",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return <Badge variant={statusVariantMap[status]}>{status}</Badge>;
}
