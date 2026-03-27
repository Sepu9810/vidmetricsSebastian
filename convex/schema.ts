import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  users: defineTable({
    email: v.string(),
    authProviderId: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }).index("by_email", ["email"]),

  reports: defineTable({
    userId: v.id("users"),
    channelUrlInput: v.string(),
    channelHandle: v.optional(v.string()),
    channelName: v.optional(v.string()),
    channelAvatarUrl: v.optional(v.string()),
    channelExternalId: v.optional(v.string()),
    dateRange: v.string(),
    publishRecencyFilterEnabled: v.boolean(),
    status: v.union(
      v.literal("queued"),
      v.literal("generating"),
      v.literal("complete"),
      v.literal("failed")
    ),
    progressPercent: v.number(),
    progressStage: v.string(),
    errorMessage: v.optional(v.string()),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_status", ["userId", "status"]),

  reportVideos: defineTable({
    reportId: v.id("reports"),
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
    .index("by_report", ["reportId"])
    .index("by_report_and_score", ["reportId", "performanceScore"]),

  reportInsights: defineTable({
    reportId: v.id("reports"),
    executiveSummary: v.string(),
    topicPatterns: v.string(),
    titlePatterns: v.string(),
    thumbnailPatterns: v.string(),
    structurePatterns: v.string(),
    formatInsights: v.string(),
    strategicTakeaways: v.string(),
    methodologyNotes: v.string(),
  }).index("by_report", ["reportId"]),

  reportExports: defineTable({
    reportId: v.id("reports"),
    exportType: v.union(v.literal("pdf"), v.literal("json")),
    fileUrl: v.string(),
    createdAt: v.number(),
  }).index("by_report", ["reportId"]),

  processingLogs: defineTable({
    reportId: v.id("reports"),
    stage: v.string(),
    message: v.string(),
    severity: v.union(
      v.literal("info"),
      v.literal("warning"),
      v.literal("error")
    ),
    createdAt: v.number(),
  }).index("by_report", ["reportId"]),
});
