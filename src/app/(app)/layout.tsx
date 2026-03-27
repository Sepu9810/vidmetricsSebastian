"use client";

import { AppShell } from "@/components/layout/app-shell";
import { hasConvexClient } from "@/components/providers/app-providers";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function RedirectToLogin() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/login");
  }, [router]);
  return null;
}

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (!hasConvexClient) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-8 text-white shadow-2xl">
          <p className="text-xs uppercase tracking-[0.28em] text-subtle">Local setup required</p>
          <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight">
            Convex app is not configured
          </h1>
          <p className="mt-4 text-sm leading-7 text-subtle">
            Set <code className="rounded bg-black/30 px-1.5 py-0.5 text-white">NEXT_PUBLIC_CONVEX_URL</code>{" "}
            and <code className="rounded bg-black/30 px-1.5 py-0.5 text-white">CONVEX_DEPLOYMENT</code>{" "}
            in <code className="rounded bg-black/30 px-1.5 py-0.5 text-white">.env.local</code>, then run{" "}
            <code className="rounded bg-black/30 px-1.5 py-0.5 text-white">npx convex dev</code>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AuthLoading>
        {/* Simple loading state while verifying session */}
        <div className="min-h-screen bg-background flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AuthLoading>
      <Authenticated>
        <AppShell>{children}</AppShell>
      </Authenticated>
      <Unauthenticated>
        <RedirectToLogin />
      </Unauthenticated>
    </>
  );
}
