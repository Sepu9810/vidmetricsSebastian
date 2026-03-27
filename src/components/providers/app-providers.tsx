"use client";

import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convexClient = convexUrl ? new ConvexReactClient(convexUrl) : null;

export function AppProviders({ children }: { children: React.ReactNode }) {
  if (!convexClient) {
    return <>{children}</>;
  }

  return <ConvexAuthProvider client={convexClient}>{children}</ConvexAuthProvider>;
}
