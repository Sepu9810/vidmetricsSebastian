import { AlertTriangle, Clock, LoaderCircle, Sparkle, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ReportStatus = "complete" | "generating" | "failed" | "queued";

const statusConfig: Record<
  ReportStatus,
  {
    label: string;
    icon: LucideIcon;
    className: string;
  }
> = {
  complete: {
    label: "Complete",
    icon: Sparkle,
    className: "bg-[rgba(166,140,255,0.16)] text-[color:var(--brand-violet)]",
  },
  queued: {
    label: "Queued",
    icon: Clock,
    className: "bg-[rgba(68,165,255,0.14)] text-[color:var(--brand-blue)]",
  },
  generating: {
    label: "Generating",
    icon: LoaderCircle,
    className: "bg-[rgba(68,165,255,0.14)] text-[color:var(--brand-blue)]",
  },
  failed: {
    label: "Failed",
    icon: AlertTriangle,
    className: "bg-[rgba(238,125,119,0.18)] text-destructive",
  },
};

export function StatusPill({ status }: { status: ReportStatus }) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border-0 px-3 py-1 text-xs font-medium",
        config.className
      )}
    >
      <Icon className={cn("size-3.5", status === "generating" && "animate-spin")} />
      {config.label}
    </Badge>
  );
}
