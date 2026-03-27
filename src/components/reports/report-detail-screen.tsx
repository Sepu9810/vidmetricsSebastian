"use client";

import { useRef, useState } from "react";
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
  LoaderCircle,
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
import { Card } from "@/components/ui/card";

const metricIcons = [Play, TrendingUp, Trophy, Zap];
const insightIcons = [Lightbulb, Target, MessageSquare, Tv, BarChart3, Zap];
const PDF_EXPORT_WIDTH = 1120;
const PDF_BACKGROUND_RGB: [number, number, number] = [14, 14, 14];
const UNSUPPORTED_COLOR_FUNCTION_PATTERN = /(oklab|oklch|color-mix|lab\(|lch\(|color\()/i;

type ReportStatus = "complete" | "generating" | "failed" | "queued";

type ReportVideo = {
  aiAnalysis?: string;
  comments?: number;
  engagementRate: number;
  externalVideoId?: string;
  likes?: number;
  performanceScore: number;
  thumbnailUrl?: string;
  title: string;
  videoType: "short" | "long_form";
  viewsPeriod?: number;
};

type ReportInsights = {
  executiveSummary?: string;
  strategicTakeaways?: string;
  structurePatterns?: string;
  thumbnailPatterns?: string;
  titlePatterns?: string;
  topicPatterns?: string;
};

type ReportDetailData = {
  channelAvatarUrl?: string;
  channelHandle?: string;
  channelName?: string;
  channelUrlInput: string;
  createdAt: number;
  dateRange: string;
  errorMessage?: string;
  insights?: ReportInsights | null;
  progressPercent: number;
  progressStage: string;
  status: ReportStatus;
  videos?: ReportVideo[];
};

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const percent = Math.min((value / max) * 100, 100);
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${percent}%`, background: color }}
      />
    </div>
  );
}

function sanitizeFilenameSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9]/g, "_");
}

function buildPdfImageUrl(source?: string | null) {
  if (!source) {
    return undefined;
  }

  if (
    source.startsWith("/") ||
    source.startsWith("data:") ||
    source.startsWith("blob:")
  ) {
    return source;
  }

  return `/api/report-image?src=${encodeURIComponent(source)}`;
}

async function waitForImages(element: HTMLElement) {
  const images = Array.from(element.querySelectorAll("img"));

  await Promise.all(
    images.map(
      (image) =>
        new Promise<void>((resolve) => {
          if (image.complete) {
            resolve();
            return;
          }

          const finalize = () => resolve();
          image.addEventListener("load", finalize, { once: true });
          image.addEventListener("error", finalize, { once: true });
        })
    )
  );
}

async function waitForNextPaint() {
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

function paintPdfBackground(pdf: InstanceType<typeof import("jspdf").jsPDF>) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  pdf.setFillColor(...PDF_BACKGROUND_RGB);
  pdf.rect(0, 0, pageWidth, pageHeight, "F");
}

function inlineSafeComputedStyles(source: HTMLElement, clone: HTMLElement) {
  const computedStyles = window.getComputedStyle(source);

  clone.style.color = computedStyles.color;
  clone.style.backgroundColor = computedStyles.backgroundColor;
  clone.style.borderTopColor = computedStyles.borderTopColor;
  clone.style.borderRightColor = computedStyles.borderRightColor;
  clone.style.borderBottomColor = computedStyles.borderBottomColor;
  clone.style.borderLeftColor = computedStyles.borderLeftColor;
  clone.style.outlineColor = computedStyles.outlineColor;
  clone.style.textDecorationColor = computedStyles.textDecorationColor;
  clone.style.boxShadow = computedStyles.boxShadow;
  clone.style.fill = computedStyles.fill;
  clone.style.stroke = computedStyles.stroke;
  clone.style.opacity = computedStyles.opacity;

  const backgroundImage = computedStyles.backgroundImage;
  clone.style.backgroundImage = UNSUPPORTED_COLOR_FUNCTION_PATTERN.test(backgroundImage)
    ? "none"
    : backgroundImage;
}

function createPdfExportStage(source: HTMLDivElement) {
  const exportStage = document.createElement("div");
  const reportClone = source.cloneNode(true) as HTMLDivElement;
  const sourceElements = [source, ...Array.from(source.querySelectorAll<HTMLElement>("*"))];
  const cloneElements = [reportClone, ...Array.from(reportClone.querySelectorAll<HTMLElement>("*"))];

  reportClone.style.margin = "0";
  reportClone.style.maxWidth = "none";
  reportClone.style.width = `${PDF_EXPORT_WIDTH}px`;

  exportStage.style.position = "fixed";
  exportStage.style.top = "0";
  exportStage.style.left = "-20000px";
  exportStage.style.width = `${PDF_EXPORT_WIDTH}px`;
  exportStage.style.background = "#09090b";
  exportStage.style.pointerEvents = "none";
  exportStage.style.zIndex = "-1";

  sourceElements.forEach((sourceElement, index) => {
    const cloneElement = cloneElements[index];

    if (!cloneElement) {
      return;
    }

    inlineSafeComputedStyles(sourceElement, cloneElement);
  });

  exportStage.appendChild(reportClone);
  document.body.appendChild(exportStage);

  return { exportStage, reportClone };
}

function ReportSections({
  report,
  exportMode,
  resolveImageSrc,
}: {
  report: ReportDetailData;
  exportMode: boolean;
  resolveImageSrc: (source?: string | null) => string | undefined;
}) {
  const detailMetrics = [
    {
      label: "Videos examined",
      value: String(report.videos?.length || 0),
      detail: "In the selected time window",
    },
    {
      label: "Top score",
      value: String(report.videos?.[0]?.performanceScore || 0),
      detail: "Highest video performance",
    },
    {
      label: "Median engagement",
      value: "Available",
      detail: "Calculated across set",
    },
    {
      label: "Recency filter",
      value: "Active",
      detail: `${report.dateRange} focus`,
    },
  ];

  const insightSections = [
    {
      title: "Executive Summary",
      signal: "Overview",
      body: report.insights?.executiveSummary || "",
    },
    {
      title: "Topic patterns",
      signal: "Top themes",
      body: report.insights?.topicPatterns || "",
    },
    {
      title: "Title patterns",
      signal: "Repeatable template",
      body: report.insights?.titlePatterns || "",
    },
    {
      title: "Thumbnail patterns",
      signal: "Visual cue",
      body: report.insights?.thumbnailPatterns || "",
    },
    {
      title: "Content structure",
      signal: "Inference",
      body: report.insights?.structurePatterns || "",
    },
    {
      title: "Strategic takeaways",
      signal: "Recommended action",
      body: report.insights?.strategicTakeaways || "",
    },
  ];

  const topVideos = report.videos || [];
  const cardMotionClass = exportMode ? "" : "group hover:scale-[1.02] transition-transform";
  const insightMotionClass = exportMode ? "" : "group hover:scale-[1.01] transition-transform";

  return (
    <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {detailMetrics.map((metric, index) => {
          const Icon = metricIcons[index];

          return (
            <Card
              key={metric.label}
              className={`premium-card rounded-2xl p-5 ${cardMotionClass}`}
              style={exportMode ? { breakInside: "avoid" } : undefined}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10">
                  <Icon className="size-5 text-secondary" />
                </div>
              </div>
              <p className="font-heading text-3xl font-bold tracking-tight text-white">
                {metric.value}
              </p>
              <p className="mt-1 text-xs text-subtle">{metric.label}</p>
              <p className="mt-1 text-[11px] text-subtle/60">{metric.detail}</p>
            </Card>
          );
        })}
      </div>

      <Card
        className="premium-card rounded-2xl p-6 sm:p-8"
        style={exportMode ? { breakInside: "avoid" } : undefined}
      >
        <div className="flex items-start gap-4">
          <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/10">
            <Lightbulb className="size-5 text-secondary" />
          </div>
          <div>
            <h2 className="mb-2 font-heading text-lg font-semibold text-white">
              Executive Summary
            </h2>
            <p className="text-base leading-7 text-white/70">{insightSections[0]?.body}</p>
          </div>
        </div>
      </Card>

      <Card
        className="premium-card rounded-2xl p-6 sm:p-8"
        style={exportMode ? { breakInside: "avoid" } : undefined}
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10">
            <Trophy className="size-5 text-secondary" />
          </div>
          <h2 className="font-heading text-lg font-semibold text-white">
            Top Performing Videos
          </h2>
        </div>
        <div className="space-y-4">
          {topVideos.map((video: ReportVideo, index: number) => {
            const barColor =
              index === 0
                ? "#a68cff"
                : index === 1
                  ? "#7c6bff"
                  : index === 2
                    ? "#5a4fcf"
                    : "#3d3a99";
            const thumbnailSrc = resolveImageSrc(video.thumbnailUrl);

            return (
              <div
                key={video.externalVideoId || `${video.title}-${index}`}
                className="flex break-inside-avoid flex-col gap-4 rounded-xl bg-white/[0.03] p-4"
                style={exportMode ? { breakInside: "avoid" } : undefined}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <span className="w-8 shrink-0 text-center text-2xl font-bold text-white/20">
                      {index + 1}
                    </span>
                    {thumbnailSrc && (
                      <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-md bg-white/5">
                        <img
                          src={thumbnailSrc}
                          alt={video.title}
                          crossOrigin={exportMode ? undefined : "anonymous"}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-white">{video.title}</p>
                      <p className="mt-1 flex items-center gap-2 text-xs text-subtle">
                        <span className="rounded-full bg-white/5 px-2 py-0.5">
                          {video.videoType === "short" ? "⚡ Short" : "🎬 Long-form"}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 pl-12 sm:gap-6 sm:pl-0">
                    <div
                      className="flex cursor-help items-center gap-1.5 text-sm"
                      title="Total Views in the selected time period"
                    >
                      <Eye className="size-3.5 text-subtle" />
                      <span className="font-medium text-white">
                        {video.viewsPeriod?.toLocaleString()}
                      </span>
                    </div>
                    <div
                      className="flex cursor-help items-center gap-1.5 text-sm"
                      title="Total Likes on this video"
                    >
                      <Heart className="size-3.5 text-secondary" />
                      <span className="font-medium text-white">
                        {video.likes?.toLocaleString() || "0"}
                      </span>
                    </div>
                    <div
                      className="flex cursor-help items-center gap-1.5 text-sm"
                      title="Total Comments on this video"
                    >
                      <MessageSquare className="size-3.5 text-subtle" />
                      <span className="font-medium text-white">
                        {video.comments?.toLocaleString() || "0"}
                      </span>
                    </div>
                    <div
                      className="flex cursor-help items-center gap-1.5 text-sm"
                      title="Engagement Rate: Computed as (Likes + Comments) / Views * 100"
                    >
                      <Percent className="size-3.5 text-subtle" />
                      <span className="font-medium text-white">{video.engagementRate}%</span>
                    </div>
                    <div
                      className="hidden w-20 shrink-0 cursor-help border-l border-white/10 pl-2 md:block"
                      title="Performance Score (0-100): Calculated by multiplying Views * Engagement Rate, then normalizing against the #1 top video in this report."
                    >
                      <div className="mb-1 flex items-center justify-between text-[10px]">
                        <span className="uppercase text-subtle">Score</span>
                        <span className="font-bold text-white">{video.performanceScore}</span>
                      </div>
                      <ProgressBar value={video.performanceScore} max={100} color={barColor} />
                    </div>
                  </div>
                </div>

                {video.aiAnalysis && (
                  <div className="pl-12">
                    <div className="relative rounded-r-xl border-l-2 border-secondary bg-gradient-to-r from-secondary/10 to-transparent py-3 pl-6">
                      <Sparkles className="absolute top-3.5 -left-[9px] size-4 rounded-full bg-[#09090b] p-0.5 text-secondary" />
                      <p className="text-sm leading-relaxed text-white/90">{video.aiAnalysis}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <div className="break-inside-avoid">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10">
            <Zap className="size-5 text-secondary" />
          </div>
          <h2 className="font-heading text-lg font-semibold text-white">AI Insights</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {insightSections.slice(1).map((section, index) => {
            const Icon = insightIcons[index + 1] || Lightbulb;

            return (
              <Card
                key={section.title}
                className={`premium-card rounded-2xl p-6 ${insightMotionClass}`}
                style={exportMode ? { breakInside: "avoid" } : undefined}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary/10">
                    <Icon className="size-4 text-secondary" />
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-secondary/70">
                      {section.signal}
                    </p>
                    <h3 className="mb-2 font-heading text-base font-semibold text-white">
                      {section.title}
                    </h3>
                    <p className="text-sm leading-6 text-white/60">{section.body}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}

function ReportOverview({
  report,
  exportMode,
  isDownloading,
  onDownload,
  resolveImageSrc,
}: {
  report: ReportDetailData;
  exportMode: boolean;
  isDownloading: boolean;
  onDownload?: () => void;
  resolveImageSrc: (source?: string | null) => string | undefined;
}) {
  const channelAvatarSrc = resolveImageSrc(report.channelAvatarUrl);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-4 pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          {exportMode ? (
            <p className="inline-flex items-center gap-2 text-sm text-subtle">
              Channel intelligence report
            </p>
          ) : (
            <Link
              href="/dashboard"
              data-html2canvas-ignore="true"
              className="inline-flex items-center gap-2 text-sm text-subtle transition-colors hover:text-white"
            >
              <ArrowLeft className="size-4" />
              Back to reports
            </Link>
          )}
          <div className="mt-3 flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-secondary to-secondary-container text-xl font-bold text-white">
              {channelAvatarSrc ? (
                <img
                  src={channelAvatarSrc}
                  alt="Avatar"
                  crossOrigin={exportMode ? undefined : "anonymous"}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              ) : (
                "V"
              )}
            </div>
            <div>
              <h1 className="font-heading text-3xl font-semibold tracking-tight text-white">
                {report.channelName || report.channelUrlInput}
              </h1>
              <p className="mt-1 text-sm text-subtle">
                {report.channelHandle} · {report.dateRange} ·{" "}
                {new Date(report.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusPill status={report.status} />
          {!exportMode && (
            <button
              onClick={onDownload}
              disabled={isDownloading}
              data-html2canvas-ignore="true"
              className="inline-flex items-center gap-2 rounded-xl bg-secondary/10 px-4 py-2 text-sm font-bold text-secondary transition-all active:scale-95 hover:bg-secondary/20 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isDownloading ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Preparing PDF...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">download</span>
                  Download
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <ReportSections
        report={report}
        exportMode={exportMode}
        resolveImageSrc={resolveImageSrc}
      />
    </div>
  );
}

export function ReportDetailScreen({ reportId }: { reportId: Id<"reports"> }) {
  const report = useQuery(api.reports.getReportDetails, { reportId });
  const pdfRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  if (report === undefined) {
    return <div className="p-8 text-white">Loading report...</div>;
  }

  if (report === null) {
    return <div className="p-8 text-white">Report not found.</div>;
  }

  const loadedReport = report as ReportDetailData;

  if (
    loadedReport.status === "queued" ||
    loadedReport.status === "generating" ||
    loadedReport.status === "failed"
  ) {
    return (
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-subtle transition-colors hover:text-white"
          >
            <ArrowLeft className="size-4" /> Back to reports
          </Link>
          <StatusPill status={loadedReport.status} />
        </div>
        <div className="mt-20 flex flex-col items-center justify-center text-center">
          <div className="mb-4 text-5xl font-bold text-white">{loadedReport.progressPercent}%</div>
          <p className="text-xl text-subtle">{loadedReport.progressStage}</p>
          {loadedReport.errorMessage && (
            <p className="mt-4 rounded-xl bg-error/10 p-4 text-error">{loadedReport.errorMessage}</p>
          )}
        </div>
      </div>
    );
  }

  const handleDownload = async () => {
    if (!pdfRef.current || isDownloading) {
      return;
    }

    setIsDownloading(true);

    try {
      const { toPng } = await import("html-to-image");
      const { jsPDF } = await import("jspdf");
      const channelName = loadedReport.channelName || "report";
      const filename = `VidMetrics-${sanitizeFilenameSegment(channelName)}-Report.pdf`;

      await document.fonts.ready;
      await waitForNextPaint();
      await waitForImages(pdfRef.current);
      const { exportStage, reportClone } = createPdfExportStage(pdfRef.current);

      try {
        await waitForImages(reportClone);
        await waitForNextPaint();

        const dataUrl = await toPng(reportClone, {
          backgroundColor: "#09090b",
          cacheBust: true,
          pixelRatio: 2,
        });

        const pdf = new jsPDF({
          format: "a4",
          orientation: "portrait",
          unit: "mm",
        });
        const margin = 8;
        const pageWidth = pdf.internal.pageSize.getWidth() - margin * 2;
        const pageHeight = pdf.internal.pageSize.getHeight() - margin * 2;
        const image = new Image();

        image.src = dataUrl;
        await image.decode();

        const renderedHeight = (image.height * pageWidth) / image.width;
        let heightLeft = renderedHeight;
        let offsetY = margin;

        paintPdfBackground(pdf);
        pdf.addImage(dataUrl, "PNG", margin, offsetY, pageWidth, renderedHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
          offsetY = margin - (renderedHeight - heightLeft);
          pdf.addPage();
          paintPdfBackground(pdf);
          pdf.addImage(dataUrl, "PNG", margin, offsetY, pageWidth, renderedHeight);
          heightLeft -= pageHeight;
        }

        pdf.save(filename);
      } finally {
        exportStage.remove();
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("No pudimos generar el PDF. Intenta de nuevo.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <ReportOverview
        report={loadedReport}
        exportMode={false}
        isDownloading={isDownloading}
        onDownload={handleDownload}
        resolveImageSrc={(source) => source || undefined}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-[-10000px] opacity-0"
      >
        <div
          ref={pdfRef}
          className="bg-[#09090b] px-8 py-8 text-white"
          style={{ width: PDF_EXPORT_WIDTH }}
        >
          <ReportOverview
            report={loadedReport}
            exportMode={true}
            isDownloading={false}
            resolveImageSrc={buildPdfImageUrl}
          />
        </div>
      </div>
    </>
  );
}
