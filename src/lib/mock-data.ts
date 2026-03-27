export type ReportStatus = "complete" | "generating" | "failed";

export type SavedReport = {
  id: string;
  title: string;
  handle: string;
  timeRange: string;
  generatedAt: string;
  status: ReportStatus;
  progress: number;
  summary: string;
  avatar: string;
};

export type InsightSection = {
  title: string;
  body: string;
  signal: string;
};

export const heroStats = [
  { label: "Accuracy in trend prediction", value: "98%" },
  { label: "Competitor videos analyzed monthly", value: "12M+" },
  { label: "Average time to a usable report", value: "2m" },
];

export const landingFeatures = [
  {
    title: "Topic pattern analysis",
    body: "Cluster what keeps winning in a niche without guessing which formats actually move viewers.",
  },
  {
    title: "Title and thumbnail insights",
    body: "See how packaging shifts by performer tier, publish window, and format before you ship a brief.",
  },
  {
    title: "Strategic takeaways",
    body: "Turn observed patterns into clear actions for editorial planning, shorts mix, and experiment velocity.",
  },
];

export const savedReports: SavedReport[] = [
  {
    id: "techno-trends-review",
    title: "TechnoTrends Review",
    handle: "@technotrends_hq",
    timeRange: "Last 30 Days",
    generatedAt: "Dec 24, 2023",
    status: "complete",
    progress: 100,
    summary: "High-frequency benchmark videos anchored by premium packaging.",
    avatar: "TT",
  },
  {
    id: "quarterly-brand-audit",
    title: "Quarterly Brand Audit",
    handle: "@creative_minds",
    timeRange: "Oct 2023",
    generatedAt: "Nov 02, 2023",
    status: "generating",
    progress: 72,
    summary: "Channel successfully resolved. Ranking performance and extracting patterns.",
    avatar: "QB",
  },
  {
    id: "competitive-drift-analysis",
    title: "Competitive Drift Analysis",
    handle: "@streamlabs_plus",
    timeRange: "Year to Date",
    generatedAt: "Oct 30, 2023",
    status: "failed",
    progress: 45,
    summary: "AI insight generation timed out after core metrics were collected.",
    avatar: "CD",
  },
  {
    id: "monthly-growth-sprint",
    title: "Monthly Growth Sprint",
    handle: "@dev_vlogs_daily",
    timeRange: "Sept 2023",
    generatedAt: "Oct 01, 2023",
    status: "complete",
    progress: 100,
    summary: "Shorts-led spikes supported by clear curiosity framing in titles.",
    avatar: "MG",
  },
];

export const detailMetrics = [
  { label: "Videos analyzed", value: "36", detail: "24 long-form, 12 shorts" },
  { label: "Median engagement", value: "8.4%", detail: "Across the selected 30-day window" },
  { label: "Top score", value: "91", detail: "Composite score from views, engagement, and recency" },
  { label: "Packaging repeatability", value: "High", detail: "Three title formats account for 68% of winners" },
];

export const topVideos = [
  {
    title: "The Best Budget Camera Setup Right Now",
    type: "Long-form",
    views: "842K",
    engagement: "9.7%",
    score: "91",
  },
  {
    title: "3 Editing Tricks That Keep Viewers Watching",
    type: "Short",
    views: "611K",
    engagement: "11.2%",
    score: "88",
  },
  {
    title: "My Honest Review After 30 Days with the M4 Air",
    type: "Long-form",
    views: "498K",
    engagement: "8.9%",
    score: "84",
  },
  {
    title: "One Thumbnail Fix That Doubled CTR",
    type: "Short",
    views: "447K",
    engagement: "10.4%",
    score: "82",
  },
];

export const insightSections: InsightSection[] = [
  {
    title: "Executive summary",
    signal: "Observed packaging tendency",
    body: "The channel wins by combining utility-led review topics with authority framing. High performers consistently promise a specific upgrade, benchmark, or mistake avoidance outcome within the first six title words.",
  },
  {
    title: "Topic patterns",
    signal: "Top themes",
    body: "Budget-conscious comparison formats and creator workflow upgrades lead the period. Review videos perform best when the angle narrows to a single use case instead of broad product coverage.",
  },
  {
    title: "Title patterns",
    signal: "Repeatable template",
    body: "Winning titles follow one of three structures: direct recommendation, 'after X days' proof framing, or a quantified lesson. Soft curiosity works better than hype language in this niche.",
  },
  {
    title: "Thumbnail patterns",
    signal: "Visual cue",
    body: "Top thumbnails isolate one hero object against dark negative space and reinforce the decision being made. Text overlays stay minimal and almost never compete with the focal object.",
  },
  {
    title: "Content structure signals",
    signal: "Inference only",
    body: "When transcripts are missing, the strongest inference is pacing discipline: winners front-load the promised outcome, transition quickly into proof, and reserve broader context for the middle of the video.",
  },
  {
    title: "Strategic takeaways",
    signal: "Recommended action",
    body: "For v1 experimentation, create briefs around one claim, one decision, and one proof asset. Pair the report with a fixed testing cadence so each new topic reuses the best title and thumbnail archetypes.",
  },
];

export const methodology = [
  "Score each video using normalized views, engagement rate, and recency weighting from the selected analysis window.",
  "Separate shorts and long-form content to avoid misleading averages when the format mix shifts.",
  "Generate insight blocks from ranked metadata and available text inputs. When transcript data is unavailable, structure observations are labeled as inferred signals.",
  "Persist status, progress stage, and errors so users can leave the dashboard and return without losing report state.",
];

export const pipelineStages = [
  { label: "Validating input", percent: 5 },
  { label: "Resolving channel", percent: 15 },
  { label: "Fetching videos", percent: 30 },
  { label: "Calculating metrics", percent: 45 },
  { label: "Ranking performance", percent: 60 },
  { label: "Analyzing patterns", percent: 75 },
  { label: "Generating summary", percent: 90 },
  { label: "Complete", percent: 100 },
];

export const analysisWindows = ["7d", "30d", "90d"];

export const channelPreview = {
  name: "TechnoTrends HQ",
  handle: "@technotrends_hq",
  url: "youtube.com/@technotrends_hq",
  subscribers: "1.2M subscribers",
  cadence: "4 uploads in the last 30 days",
  classification: "Mixed long-form and shorts",
  recentVideos: [
    "The Best Budget Camera Setup Right Now",
    "3 Editing Tricks That Keep Viewers Watching",
    "A Creator Laptop Worth Buying in 2026",
  ],
};

export function getReportById(reportId: string) {
  return savedReports.find((report) => report.id === reportId);
}
