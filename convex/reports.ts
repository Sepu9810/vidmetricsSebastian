import { query, mutation, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";
import { internal } from "./_generated/api";

export const getReportForEmail = internalQuery({
  args: { reportId: v.id("reports") },
  handler: async (ctx, args) => {
    const report = await ctx.db.get(args.reportId);
    if (!report) return null;
    const user = await ctx.db.get(report.userId);
    return {
      report,
      email: user?.email,
    };
  }
});

export const getReports = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return [];
    }
    return await ctx.db
      .query("reports")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(50);
  },
});

export const getReportDetails = query({
  args: { reportId: v.id("reports") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;

    const report = await ctx.db.get(args.reportId);
    if (!report || report.userId !== userId) return null;

    const videosQuery = await ctx.db
      .query("reportVideos")
      .withIndex("by_report_and_score", (q) => q.eq("reportId", args.reportId))
      .order("desc")
      .take(100);

    const insights = await ctx.db
      .query("reportInsights")
      .withIndex("by_report", (q) => q.eq("reportId", args.reportId))
      .unique();

    return { ...report, videos: videosQuery.sort((a, b) => b.performanceScore - a.performanceScore), insights };
  },
});

export const deleteReport = mutation({
  args: { reportId: v.id("reports") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");

    const report = await ctx.db.get(args.reportId);
    if (!report || report.userId !== userId) {
      throw new Error("Report not found or unauthorized");
    }

    // Delete associated data
    const videos = await ctx.db.query("reportVideos").withIndex("by_report", q => q.eq("reportId", args.reportId)).collect();
    for (const v of videos) await ctx.db.delete(v._id);

    const insights = await ctx.db.query("reportInsights").withIndex("by_report", q => q.eq("reportId", args.reportId)).collect();
    for (const i of insights) await ctx.db.delete(i._id);

    // Delete the report itself
    await ctx.db.delete(args.reportId);
  },
});

export const createReport = mutation({
  args: {
    channelUrlInput: v.string(),
    dateRange: v.string(), // "7d" | "30d" | "90d"
    channelName: v.optional(v.string()),
    channelAvatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");

    const reports = await ctx.db
      .query("reports")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    
    if (reports.length >= 10) {
      throw new Error("Analysis limit reached");
    }

    const reportId = await ctx.db.insert("reports", {
      userId,
      channelUrlInput: args.channelUrlInput,
      dateRange: args.dateRange,
      publishRecencyFilterEnabled: true,
      status: "queued",
      progressPercent: 0,
      progressStage: "Initializing...",
      createdAt: Date.now(),
      channelName: args.channelName || "Analyzing...",
      channelHandle: args.channelUrlInput,
      channelAvatarUrl: args.channelAvatarUrl || "",
    });

    await ctx.scheduler.runAfter(0, internal.analyze.generateReportAction, {
      reportId,
      channelUrlInput: args.channelUrlInput,
      dateRange: args.dateRange,
    });

    return reportId;
  },
});

export const updateReportStatus = internalMutation({
  args: {
    reportId: v.id("reports"),
    status: v.union(v.literal("queued"), v.literal("generating"), v.literal("complete"), v.literal("failed")),
    progressPercent: v.number(),
    progressStage: v.string(),
    channelName: v.optional(v.string()),
    channelHandle: v.optional(v.string()),
    channelAvatarUrl: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { reportId, ...updates } = args;
    await ctx.db.patch(reportId, { ...updates });
  },
});

export const saveReportData = internalMutation({
  args: {
    reportId: v.id("reports"),
    videos: v.array(
      v.object({
        externalVideoId: v.string(),
        title: v.string(),
        thumbnailUrl: v.optional(v.string()),
        publishDate: v.string(),
        videoType: v.union(v.literal("short"), v.literal("long_form")),
        viewsPeriod: v.number(),
        likes: v.optional(v.number()),
        comments: v.optional(v.number()),
        engagementRate: v.number(),
        performanceScore: v.number(),
        performanceLabel: v.string(),
        youtubeUrl: v.string(),
        rawPayloadJson: v.optional(v.string()),
        aiAnalysis: v.optional(v.string()),
      })
    ),
    insights: v.object({
      executiveSummary: v.string(),
      topicPatterns: v.string(),
      titlePatterns: v.string(),
      thumbnailPatterns: v.string(),
      structurePatterns: v.string(),
      formatInsights: v.string(),
      strategicTakeaways: v.string(),
      methodologyNotes: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    for (const video of args.videos) {
      await ctx.db.insert("reportVideos", {
        reportId: args.reportId,
        ...video,
      });
    }
    
    await ctx.db.insert("reportInsights", {
      reportId: args.reportId,
      ...args.insights,
    });

    await ctx.db.patch(args.reportId, {
      status: "complete",
      progressPercent: 100,
      progressStage: "Complete",
      completedAt: Date.now(),
    });
  },
});
