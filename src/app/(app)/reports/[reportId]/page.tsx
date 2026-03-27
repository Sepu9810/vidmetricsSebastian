import { ReportDetailScreen } from "@/components/reports/report-detail-screen";

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = await params;
  return <ReportDetailScreen reportId={reportId as any} />;
}
