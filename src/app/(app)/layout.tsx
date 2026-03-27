"use client";

import { AppShell } from "@/components/layout/app-shell";
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
