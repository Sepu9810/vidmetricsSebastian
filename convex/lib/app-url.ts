const DEFAULT_PRODUCTION_APP_URL = "https://vidmetricssebastian.vercel.app";

function withProtocol(url: string) {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `https://${url}`;
}

export function getAppUrl() {
  const rawUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    process.env.MAIN_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    DEFAULT_PRODUCTION_APP_URL;

  return withProtocol(rawUrl).replace(/\/+$/, "");
}
