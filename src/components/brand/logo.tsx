import Link from "next/link";
import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

type VidMetricsLogoProps = {
  className?: string;
  href?: string;
};

export function VidMetricsLogo({
  className,
  href = "/",
}: VidMetricsLogoProps) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-3 text-left", className)}
    >
      <span className="flex size-10 items-center justify-center rounded-2xl bg-surface-container-highest shadow-[0_0_20px_rgba(166,140,255,0.1)]">
        <span className="material-symbols-outlined text-secondary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>insights</span>
      </span>
      <span className="flex flex-col">
        <span className="font-heading text-base font-semibold tracking-[-0.04em] text-white">
          VidMetrics
        </span>
        <span className="text-[0.68rem] uppercase tracking-[0.28em] text-subtle">
          Video Intelligence
        </span>
      </span>
    </Link>
  );
}
