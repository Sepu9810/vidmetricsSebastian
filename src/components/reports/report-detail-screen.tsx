"use client";

import { useRef } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
  ArrowLeft,
  BarChart3,
  Eye,
  Heart,
  Lightbulb,
  MessageSquare,
  Play,
  Target,
  TrendingUp,
  Trophy,
  Tv,
  Zap,
  Sparkles,
  Percent,
} from "lucide-react";

import { StatusPill } from "@/components/shared/status-pill";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const metricIcons = [Play, TrendingUp, Trophy, Zap];
const insightIcons = [Lightbulb, Target, MessageSquare, Tv, BarChart3, Zap];

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const percent = Math.min((value / max) * 100, 100);
  return (
    <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${percent}%`, background: color }}
      />
    </div>
  );
}

export function ReportDetailScreen({ reportId }: { reportId: Id<"reports"> }) {
  const report = useQuery(api.reports.getReportDetails, { reportId });
  const reportRef = useRef<HTMLDivElement>(null);

  if (report === undefined) {
    return <div className="text-white p-8">Loading report...</div>;
  }
  if (report === null) {
    return <div className="text-white p-8">Report not found.</div>;
  }

  // Si está generando o falló, mostramos una UI mínima
  if (report.status === "queued" || report.status === "generating" || report.status === "failed") {
     return (
       <div className="space-y-8 max-w-6xl mx-auto">
         {/* Header */}
         <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-subtle hover:text-white transition-colors">
              <ArrowLeft className="size-4" /> Back to reports
            </Link>
            <StatusPill status={report.status as any} />
         </div>
         <div className="mt-20 flex flex-col items-center justify-center text-center">
            <div className="text-5xl font-bold text-white mb-4">{report.progressPercent}%</div>
            <p className="text-xl text-subtle">{report.progressStage}</p>
            {report.errorMessage && (
              <p className="mt-4 text-error bg-error/10 p-4 rounded-xl">{report.errorMessage}</p>
            )}
         </div>
       </div>
     );
  }

  // Data mapping from Convex response
  const detailMetrics = [
    { label: "Videos examined", value: String(report.videos?.length || 0), detail: "In the selected time window" },
    { label: "Top score", value: String(report.videos?.[0]?.performanceScore || 0), detail: "Highest video performance" },
    { label: "Median engagement", value: "Available", detail: "Calculated across set" },
    { label: "Recency filter", value: "Active", detail: `${report.dateRange} focus` },
  ];

  const insightSections = [
    { title: "Executive Summary", signal: "Overview", body: report.insights?.executiveSummary || "" },
    { title: "Topic patterns", signal: "Top themes", body: report.insights?.topicPatterns || "" },
    { title: "Title patterns", signal: "Repeatable template", body: report.insights?.titlePatterns || "" },
    { title: "Thumbnail patterns", signal: "Visual cue", body: report.insights?.thumbnailPatterns || "" },
    { title: "Content structure", signal: "Inference", body: report.insights?.structurePatterns || "" },
    { title: "Strategic takeaways", signal: "Recommended action", body: report.insights?.strategicTakeaways || "" },
  ];

  const topVideos = report.videos || [];

  const handleDownload = async () => {
    if (!reportRef.current) return;
    
    try {
      // Importación dinámica para evitar problemas SSR
      const { toPng } = await import('html-to-image');
      const { jsPDF } = await import('jspdf');
      
      const element = reportRef.current;
      const channelName = report.channelName || "report";
      const filename = `VidMetrics-${channelName.replace(/[^a-zA-Z0-9]/g, '_')}-Report.pdf`;

      const dataUrl = await toPng(element, { 
        quality: 1, 
        backgroundColor: '#09090b',
        pixelRatio: 2, // Alta resolución
        filter: (node) => {
          // Respetar el atributo para ocultar botones
          if (node instanceof HTMLElement && node.dataset.html2canvasIgnore === 'true') {
            return false;
          }
          return true;
        }
      });

      // Crear PDF con altura dinámica (1 sola página infinita perfecta para digital)
      const pdfRef = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdfRef.internal.pageSize.getWidth();
      const imgProps = pdfRef.getImageProperties(dataUrl);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pdfWidth, pdfHeight]
      });
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(filename);
      
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Hubo un error al generar el PDF. Revisa la consola.');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto" ref={reportRef}>
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-4">
        <div>
          <Link
            href="/dashboard"
            data-html2canvas-ignore="true"
            className="inline-flex items-center gap-2 text-sm text-subtle hover:text-white transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to reports
          </Link>
          <div className="mt-3 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-secondary-container text-xl font-bold text-white shrink-0 overflow-hidden">
              {report.channelAvatarUrl ? <img src={report.channelAvatarUrl} alt="Avatar" /> : "V"}
            </div>
            <div>
              <h1 className="font-heading text-3xl font-semibold tracking-tight text-white">
                {report.channelName || report.channelUrlInput}
              </h1>
              <p className="text-sm text-subtle mt-1">
                {report.channelHandle} · {report.dateRange} · {new Date(report.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusPill status={report.status} />
          <button
            onClick={handleDownload}
            data-html2canvas-ignore="true"
            className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 hover:bg-secondary/20 text-secondary text-sm font-bold rounded-xl transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-base">download</span>
            Download
          </button>
        </div>
      </div>

      {/* Key Metrics - Clean visual cards with icons */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {detailMetrics.map((metric, i) => {
          const Icon = metricIcons[i];
          return (
            <Card key={metric.label} className="premium-card rounded-2xl p-5 group hover:scale-[1.02] transition-transform">
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10">
                  <Icon className="size-5 text-secondary" />
                </div>
              </div>
              <p className="font-heading text-3xl font-bold tracking-tight text-white">
                {metric.value}
              </p>
              <p className="text-xs text-subtle mt-1">{metric.label}</p>
              <p className="text-[11px] text-subtle/60 mt-1">{metric.detail}</p>
            </Card>
          );
        })}
      </div>

      {/* Executive Summary - Clean hero card */}
      <Card className="premium-card rounded-2xl p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 shrink-0 mt-1">
            <Lightbulb className="size-5 text-secondary" />
          </div>
          <div>
            <h2 className="font-heading text-lg font-semibold text-white mb-2">
              Executive Summary
            </h2>
            <p className="text-base leading-7 text-white/70">
              {insightSections[0]?.body}
            </p>
          </div>
        </div>
      </Card>

      {/* Top Videos - Visual ranking */}
      <Card className="premium-card rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10">
            <Trophy className="size-5 text-secondary" />
          </div>
          <h2 className="font-heading text-lg font-semibold text-white">
            Top Performing Videos
          </h2>
        </div>
        <div className="space-y-4">
          {topVideos.map((video: any, index: number) => {
            const barColor =
              index === 0
                ? "#a68cff"
                : index === 1
                ? "#7c6bff"
                : index === 2
                ? "#5a4fcf"
                : "#3d3a99";
            return (
              <div
                key={video.title}
                className="flex flex-col gap-4 rounded-xl bg-white/[0.03] p-4 hover:bg-white/[0.06] transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <span className="text-2xl font-bold text-white/20 w-8 text-center shrink-0">
                      {index + 1}
                    </span>
                    {video.thumbnailUrl && (
                      <div className="h-12 w-20 shrink-0 overflow-hidden rounded-md bg-white/5 relative">
                        <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-white truncate">{video.title}</p>
                      <p className="text-xs text-subtle mt-1 flex items-center gap-2">
                        <span className="bg-white/5 px-2 py-0.5 rounded-full">
                           {video.videoType === "short" ? "⚡ Short" : "🎬 Long-form"}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 sm:gap-6 pl-12 sm:pl-0">
                    <div className="flex items-center gap-1.5 text-sm cursor-help" title="Total Views in the selected time period">
                      <Eye className="size-3.5 text-subtle" />
                      <span className="text-white font-medium">{video.viewsPeriod?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm cursor-help" title="Total Likes on this video">
                      <Heart className="size-3.5 text-secondary" />
                      <span className="text-white font-medium">{video.likes?.toLocaleString() || "0"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm cursor-help" title="Total Comments on this video">
                      <MessageSquare className="size-3.5 text-subtle" />
                      <span className="text-white font-medium">{video.comments?.toLocaleString() || "0"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm cursor-help" title="Engagement Rate: Computed as (Likes + Comments) / Views * 100">
                      <Percent className="size-3.5 text-subtle" />
                      <span className="text-white font-medium">{video.engagementRate}%</span>
                    </div>
                    <div className="w-20 shrink-0 hidden md:block pl-2 border-l border-white/10 cursor-help" title="Performance Score (0-100): Calculated by multiplying Views * Engagement Rate, then normalizing against the #1 top video in this report.">
                      <div className="flex items-center justify-between text-[10px] mb-1">
                        <span className="text-subtle uppercase">Score</span>
                        <span className="text-white font-bold">{video.performanceScore}</span>
                      </div>
                      <ProgressBar value={video.performanceScore} max={100} color={barColor} />
                    </div>
                  </div>
                </div>

                {/* AI Analysis Row */}
                {video.aiAnalysis && (
                  <div className="pl-12">
                    <div className="relative pl-6 py-3 border-l-2 border-secondary bg-gradient-to-r from-secondary/10 to-transparent rounded-r-xl">
                      <Sparkles className="absolute -left-[9px] top-3.5 size-4 text-secondary bg-[#09090b] rounded-full p-0.5" />
                      <p className="text-sm leading-relaxed text-white/90">
                        {video.aiAnalysis}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* AI Insights - Cleaner icon-based grid */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10">
            <Zap className="size-5 text-secondary" />
          </div>
          <h2 className="font-heading text-lg font-semibold text-white">
            AI Insights
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {insightSections.slice(1).map((section, i) => {
            const Icon = insightIcons[i + 1] || Lightbulb;
            return (
              <Card key={section.title} className="premium-card rounded-2xl p-6 group hover:scale-[1.01] transition-transform">
                <div className="flex items-start gap-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/10 shrink-0 mt-0.5">
                    <Icon className="size-4 text-secondary" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-secondary/70 mb-1">
                      {section.signal}
                    </p>
                    <h3 className="font-heading text-base font-semibold text-white mb-2">
                      {section.title}
                    </h3>
                    <p className="text-sm leading-6 text-white/60">
                      {section.body}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
