"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

export const channel = action({
  args: { urlInput: v.string() },
  handler: async (ctx, args) => {
    let url = args.urlInput.trim();
    if (url.startsWith("@")) {
      url = `https://www.youtube.com/${url}`;
    } else if (!url.startsWith("http")) {
      url = `https://www.youtube.com/@${url}`;
    }

    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
      });
      if (!res.ok) {
        return { valid: false, error: "Channel not found (HTTP " + res.status + ")" };
      }

      const html = await res.text();
      const titleMatch = html.match(/<meta property="og:title" content="([^"]+)">/);
      const imageMatch = html.match(/<meta property="og:image" content="([^"]+)">/);

      if (!titleMatch && !imageMatch) {
         return { valid: false, error: "Could not resolve channel details. Check the handle." };
      }

      const title = titleMatch ? titleMatch[1] : url.split("/").pop() || "Unknown Channel";
      const image = imageMatch ? imageMatch[1] : "";

      // YouTube tends to append " - YouTube" to the title, strip it
      const cleanTitle = title.endsWith(" - YouTube") ? title.slice(0, -10) : title;

      return {
        valid: true,
        channelName: cleanTitle,
        channelAvatarUrl: image,
        channelUrlInput: url
      };
    } catch (e: any) {
      return { valid: false, error: e.message || "Failed to fetch channel details." };
    }
  },
});
