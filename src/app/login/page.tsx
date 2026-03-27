"use client";

import { Authenticated, Unauthenticated } from "convex/react";
import { LoginScreen } from "@/components/auth/login-screen";
import { useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";

function RedirectToDashboard() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);
  return null;
}

export default function LoginPage() {
  return (
    <>
      <Authenticated>
        <RedirectToDashboard />
      </Authenticated>
      <Unauthenticated>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><div className="w-8 h-8 rounded-full border-4 border-secondary border-t-transparent animate-spin"></div></div>}>
          <LoginScreen />
        </Suspense>
      </Unauthenticated>
    </>
  );
}
