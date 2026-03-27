"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import OpenAI from "openai";
import { Resend } from "resend";
import { getAppUrl } from "./lib/appUrl";

function getDaysFromRange(dateRange: string) {
  if (dateRange === "7d") return 7;
  if (dateRange === "30d") return 30;
  if (dateRange === "90d") return 90;
  return 30;
}

type ApifyActorRunInput = {
  maxResults: number;
  maxResultsShorts: number;
  maxResultStreams: number;
  startUrls: Array<{ url: string }>;
};

type ApifyRunData = {
  data: {
    defaultDatasetId: string;
    id: string;
    status?: string;
  };
};

type ApifyVideoItem = {
  channelName?: string;
  channelUrl?: string;
  commentsCount?: number | string;
  date?: string;
  duration?: string;
  id?: string;
  likes?: number | string;
  thumbnailUrl?: string;
  title?: string;
  url?: string;
  viewCount?: number | string;
};

type ProcessedVideo = {
  aiAnalysis: string;
  comments: number;
  engagementRate: number;
  externalVideoId: string;
  likes: number;
  performanceLabel: string;
  performanceScore: number;
  publishDate: string;
  thumbnailUrl: string;
  title: string;
  videoType: "short" | "long_form";
  viewsPeriod: number;
  youtubeUrl: string;
};

type AiVideoAnalysis = {
  insight?: unknown;
  videoId?: string;
};

type AiInsightPayload = {
  executiveSummary?: unknown;
  formatInsights?: unknown;
  methodologyNotes?: unknown;
  strategicTakeaways?: unknown;
  structurePatterns?: unknown;
  thumbnailPatterns?: unknown;
  titlePatterns?: unknown;
  topicPatterns?: unknown;
  videoAnalysis?: AiVideoAnalysis[];
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error occurred";
}

async function runApifyActor(
  token: string,
  actorId: string,
  input: ApifyActorRunInput,
): Promise<ApifyVideoItem[]> {
  const runRes = await fetch(
    `https://api.apify.com/v2/acts/${actorId}/runs?token=${token}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }
  );

  if (!runRes.ok) {
    const errText = await runRes.text();
    throw new Error(`Apify actor start failed: ${runRes.status} ${errText}`);
  }

  const runData = (await runRes.json()) as ApifyRunData;
  const runId = runData.data.id;
  const datasetId = runData.data.defaultDatasetId;

  // Poll until the run finishes (max ~5 min)
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    const statusRes = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}?token=${token}`
    );
    const statusData = (await statusRes.json()) as ApifyRunData;
    const st = statusData.data.status;
    if (st === "SUCCEEDED") break;
    if (st === "FAILED" || st === "ABORTED" || st === "TIMED-OUT") {
      throw new Error(`Apify run ended with status: ${st}`);
    }
  }

  // Fetch dataset items
  const dataRes = await fetch(
    `https://api.apify.com/v2/datasets/${datasetId}/items?token=${token}&format=json`
  );
  if (!dataRes.ok) throw new Error("Failed to fetch Apify dataset");
  return (await dataRes.json()) as ApifyVideoItem[];
}

export const generateReportAction = internalAction({
  args: {
    reportId: v.id("reports"),
    channelUrlInput: v.string(),
    dateRange: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      await ctx.runMutation(internal.reports.updateReportStatus, {
        reportId: args.reportId,
        status: "generating",
        progressPercent: 10,
        progressStage: "Resolving channel with Apify",
      });

      const APIFY_TOKEN = process.env.APIFY_API_TOKEN;
      const OPENAI_KEY = process.env.OPENAI_API_KEY;
      if (!APIFY_TOKEN || !OPENAI_KEY) throw new Error("Missing API keys");

      const openai = new OpenAI({ apiKey: OPENAI_KEY });

      // Build the channel URL
      let urlInput = args.channelUrlInput.trim();
      if (urlInput.startsWith("@")) {
        urlInput = `https://www.youtube.com/${urlInput}`;
      } else if (!urlInput.startsWith("http")) {
        urlInput = `https://www.youtube.com/@${urlInput}`;
      }

      // ─── 1. Apify: bernardo/youtube-scraper ───
      // This actor returns one object per video with fields:
      // title, id, url, thumbnailUrl, viewCount, date, likes,
      // channelName, channelUrl, numberOfSubscribers, duration, commentsCount
      const datasetItems = await runApifyActor(
        APIFY_TOKEN,
        "streamers~youtube-scraper",
        {
          startUrls: [{ url: urlInput }],
          maxResults: 10,
          maxResultsShorts: 10,
          maxResultStreams: 0,
        }
      );

      if (!datasetItems || datasetItems.length === 0) {
        throw new Error("No data found for this channel. Check the URL/handle.");
      }

      // Extract channel info from the first video
      const first = datasetItems[0];
      const channelName = first.channelName || urlInput.split("/").pop() || "Unknown";
      const channelHandle = first.channelUrl
        ? first.channelUrl.replace("http://www.youtube.com/", "").replace("https://www.youtube.com/", "")
        : args.channelUrlInput;

      await ctx.runMutation(internal.reports.updateReportStatus, {
        reportId: args.reportId,
        status: "generating",
        progressPercent: 40,
        progressStage: `Found ${datasetItems.length} videos, filtering by date`,
        channelName,
        channelHandle,
      });

      // ─── 2. Filter by date range ───
      const daysCutoff = getDaysFromRange(args.dateRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysCutoff);

      const filteredVideos: ProcessedVideo[] = datasetItems
        .filter((video) => {
          const videoDate = video.date;
          if (!videoDate) return true;
          return new Date(videoDate) >= cutoffDate;
        })
        .map((video) => {
          const views = Number(video.viewCount || 0);
          const likes = Number(video.likes || 0);
          const comments = Number(video.commentsCount || 0);
          const engRate = views > 0 ? ((likes + comments) / views) * 100 : 0;
          const rawScore = views * Math.max(engRate, 0.1);

          // Detect shorts by duration (under 61 seconds) or URL
          let videoType: "short" | "long_form" = "long_form";
          if (video.url && video.url.includes("/shorts/")) {
            videoType = "short";
          } else if (video.duration) {
            // duration format: "HH:MM:SS" or "MM:SS"
            const parts = video.duration.split(":").map(Number);
            const totalSecs =
              parts.length === 3
                ? parts[0] * 3600 + parts[1] * 60 + parts[2]
                : parts.length === 2
                ? parts[0] * 60 + parts[1]
                : 0;
            if (totalSecs > 0 && totalSecs <= 60) videoType = "short";
          }

          return {
            externalVideoId: video.id || "unknown",
            title: video.title || "Untitled",
            thumbnailUrl: video.thumbnailUrl || `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`,
            publishDate: video.date || new Date().toISOString(),
            videoType,
            viewsPeriod: views,
            likes,
            comments,
            engagementRate: Number(engRate.toFixed(2)),
            performanceScore: rawScore,
            performanceLabel: "Average",
            youtubeUrl: video.url || `https://youtube.com/watch?v=${video.id}`,
            aiAnalysis: "",
          };
        });

      if (filteredVideos.length === 0) {
        throw new Error(`No videos found in the last ${daysCutoff} days for this channel.`);
      }

      // ─── 3. Normalize scores 0-100 ───
      const maxScore = Math.max(...filteredVideos.map((video) => video.performanceScore));
      filteredVideos.forEach((video) => {
        video.performanceScore = maxScore > 0 ? Math.round((video.performanceScore / maxScore) * 100) : 0;
        if (video.performanceScore > 75) video.performanceLabel = "High";
        else if (video.performanceScore > 35) video.performanceLabel = "Medium";
        else video.performanceLabel = "Low";
      });

      filteredVideos.sort((a, b) => b.performanceScore - a.performanceScore);
      const topVideos = filteredVideos.slice(0, 10);

      await ctx.runMutation(internal.reports.updateReportStatus, {
        reportId: args.reportId,
        status: "generating",
        progressPercent: 70,
        progressStage: "Analyzing patterns with OpenAI",
      });

      // ─── 4. OpenAI Analysis ───
      const videoSummary = topVideos.map((video, i) =>
        `#${i + 1} "${video.title}" | Views: ${video.viewsPeriod} | Likes: ${video.likes} | Comments: ${video.comments} | Eng: ${video.engagementRate}% | Type: ${video.videoType} | Date: ${video.publishDate}`
      ).join("\n");

      const prompt = `You are a YouTube strategist. Analyze these top performing videos from channel "${channelName}" and produce strategic insights.

Videos:
${videoSummary}

Respond STRICTLY in valid JSON with these keys:
{
  "executiveSummary": "2-3 sentence overview of this channel's content strategy and performance.",
  "topicPatterns": "What topics/themes recur in the best performing videos.",
  "titlePatterns": "What title structures or formulas work best.",
  "thumbnailPatterns": "Any observable patterns in packaging (inferred from titles/types).",
  "structurePatterns": "Content format and pacing observations.",
  "formatInsights": "Distribution between shorts vs long-form and performance differences.",
  "strategicTakeaways": "3-5 actionable recommendations for this channel.",
  "methodologyNotes": "Brief note on how this analysis was conducted.",
  "videoAnalysis": [{"videoId": "string", "insight": "1-2 sentence explanation of why this specific video ranks in the top performances based on its title, stats and type."}]
}`;

      const aiResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a professional YouTube strategist. Output ONLY valid JSON." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      });

      const aiContent = aiResponse.choices[0].message.content || "{}";
      const aiJson = JSON.parse(aiContent) as AiInsightPayload;

      // ─── 5. Save everything to Convex ───
      const safeString = (val: unknown, fallback: string) => {
        if (!val) return fallback;
        if (Array.isArray(val)) return val.join("\n• ");
        return String(val);
      };

      if (aiJson.videoAnalysis && Array.isArray(aiJson.videoAnalysis)) {
        for (const video of topVideos) {
          const match = aiJson.videoAnalysis.find(
            (analysis) => analysis.videoId === video.externalVideoId,
          );
          if (match) {
            video.aiAnalysis = safeString(match.insight, "");
          }
        }
      }

      await ctx.runMutation(internal.reports.saveReportData, {
        reportId: args.reportId,
        videos: topVideos,
        insights: {
          executiveSummary: safeString(aiJson.executiveSummary, "Analysis complete."),
          topicPatterns: safeString(aiJson.topicPatterns, "Not enough data."),
          titlePatterns: safeString(aiJson.titlePatterns, "Not enough data."),
          thumbnailPatterns: safeString(aiJson.thumbnailPatterns, "Not enough data."),
          structurePatterns: safeString(aiJson.structurePatterns, "Not enough data."),
          formatInsights: safeString(aiJson.formatInsights, "Not enough data."),
          strategicTakeaways: safeString(aiJson.strategicTakeaways, "Review recommended."),
          methodologyNotes: safeString(aiJson.methodologyNotes, "AI-powered analysis."),
        },
      });

      // ─── 6. Send Email Notification ───
      if (process.env.RESEND_API_KEY) {
        try {
          const reportDetails = await ctx.runQuery(internal.reports.getReportForEmail, { reportId: args.reportId });
          if (reportDetails?.email) {
            const resend = new Resend(process.env.RESEND_API_KEY);
            const fromEmail = process.env.RESEND_FROM_EMAIL || "VidMetrics <vidmetrics@app.solventio.co>";
            const baseUrl = getAppUrl();
            const reportLink = `${baseUrl}/reports/${args.reportId}`;

            const emailHtml = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; border-radius: 10px;">
                <div style="background-color: #1a1a1a; padding: 24px; border-radius: 10px 10px 0 0; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px;">VidMetrics</h1>
                  <p style="color: #a68cff; margin: 4px 0 0; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">Video Intelligence</p>
                </div>
                <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #eaeaea;">
                  <h2 style="color: #333333; margin-top: 0;">Your Report is Ready! 🎉</h2>
                  <p style="color: #555555; line-height: 1.6;">Hi there,</p>
                  <p style="color: #555555; line-height: 1.6;">Great news! Your YouTube analysis report for <strong style="color: #333;">${channelName}</strong> is complete and ready to explore.</p>
                  <div style="background-color: #f8f8ff; border-left: 4px solid #704aff; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                    <p style="margin: 0; color: #444; font-size: 14px;">📊 Top videos ranked &amp; analyzed</p>
                    <p style="margin: 4px 0 0; color: #444; font-size: 14px;">🧠 AI-powered performance insights</p>
                    <p style="margin: 4px 0 0; color: #444; font-size: 14px;">📈 Engagement metrics &amp; patterns</p>
                  </div>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${reportLink}" style="background-color: #704aff; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">View Your Report</a>
                  </div>
                  <p style="color: #999999; font-size: 12px; text-align: center; margin-bottom: 0;">Powered by VidMetrics &mdash; Premium Video Intelligence</p>
                </div>
              </div>
            `;

            await resend.emails.send({
              from: fromEmail,
              to: reportDetails.email,
              subject: `Your VidMetrics Report for ${channelName} is Ready! 🎉`,
              html: emailHtml,
            });
          }
        } catch (error) {
          console.error("Failed to send email:", error);
        }
      }
    } catch (error) {
      console.error("generateReportAction error:", error);
      await ctx.runMutation(internal.reports.updateReportStatus, {
        reportId: args.reportId,
        status: "failed",
        progressPercent: 0,
        progressStage: "Failed",
        errorMessage: getErrorMessage(error),
      });
    }
  },
});
