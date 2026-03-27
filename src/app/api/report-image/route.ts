import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const ALLOWED_REMOTE_HOSTS = [
  ".ggpht.com",
  ".googleusercontent.com",
  ".ytimg.com",
];

function isAllowedRemoteHost(hostname: string) {
  return ALLOWED_REMOTE_HOSTS.some((suffix) =>
    hostname === suffix.slice(1) || hostname.endsWith(suffix),
  );
}

export async function GET(request: NextRequest) {
  const source = request.nextUrl.searchParams.get("src");

  if (!source) {
    return new Response("Missing image source", { status: 400 });
  }

  let targetUrl: URL;

  try {
    targetUrl = new URL(source);
  } catch {
    return new Response("Invalid image source", { status: 400 });
  }

  if (targetUrl.protocol !== "https:") {
    return new Response("Unsupported image source", { status: 400 });
  }

  if (!isAllowedRemoteHost(targetUrl.hostname)) {
    return new Response("Disallowed image source", { status: 400 });
  }

  const upstream = await fetch(targetUrl, {
    cache: "force-cache",
    headers: {
      Accept: "image/*,*/*;q=0.8",
      "User-Agent": "VidMetrics PDF Export",
    },
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!upstream.ok) {
    return new Response("Unable to fetch image", { status: upstream.status });
  }

  const contentType = upstream.headers.get("content-type") || "";
  if (!contentType.startsWith("image/")) {
    return new Response("Unsupported upstream content type", { status: 400 });
  }

  const body = await upstream.arrayBuffer();
  const headers = new Headers();

  headers.set("Content-Type", contentType);
  headers.set("Cache-Control", "public, max-age=86400, s-maxage=86400");

  return new Response(body, {
    status: 200,
    headers,
  });
}
