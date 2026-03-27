"use client";

import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convexClient = convexUrl ? new ConvexReactClient(convexUrl) : null;

export function AppProviders({ children }: { children: React.ReactNode }) {
  if (!convexClient) {
    return <>{children}</>;
  }

  return (
    <ConvexAuthProvider
      client={convexClient}
      shouldHandleCode={() => {
        if (typeof window === "undefined") return true;
        const searchParams = new URLSearchParams(window.location.search);
        return searchParams.get("step") !== "resetPassword";
      }}
    >
      {children}
    </ConvexAuthProvider>
  );
}
