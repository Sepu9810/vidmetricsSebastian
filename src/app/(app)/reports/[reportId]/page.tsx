import { ReportDetailScreen } from "@/components/reports/report-detail-screen";
import type { Id } from "../../../../../convex/_generated/dataModel";

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = await params;
  return <ReportDetailScreen reportId={reportId as Id<"reports">} />;
}
