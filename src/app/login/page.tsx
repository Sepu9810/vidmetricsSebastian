"use client";

import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { LoginScreen } from "@/components/auth/login-screen";
import { hasConvexClient } from "@/components/providers/app-providers";
import { useRouter } from "next/navigation";
import { use, useEffect } from "react";

function RedirectToDashboard() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);
  return null;
}

function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 rounded-full border-4 border-secondary border-t-transparent animate-spin"></div>
    </div>
  );
}

function MissingConvexConfig() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-8 text-white shadow-2xl">
        <p className="text-xs uppercase tracking-[0.28em] text-subtle">Local setup required</p>
        <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight">
          Convex auth is not configured
        </h1>
        <p className="mt-4 text-sm leading-7 text-subtle">
          Add <code className="rounded bg-black/30 px-1.5 py-0.5 text-white">NEXT_PUBLIC_CONVEX_URL</code>{" "}
          and <code className="rounded bg-black/30 px-1.5 py-0.5 text-white">CONVEX_DEPLOYMENT</code>{" "}
          to <code className="rounded bg-black/30 px-1.5 py-0.5 text-white">.env.local</code>, then run{" "}
          <code className="rounded bg-black/30 px-1.5 py-0.5 text-white">npx convex dev</code>.
        </p>
      </div>
    </div>
  );
}

function LoginPageClient({
  initialStep,
  initialEmail,
  initialResetCode,
}: {
  initialStep: string;
  initialEmail: string;
  initialResetCode: string;
}) {
  if (!hasConvexClient) {
    return <MissingConvexConfig />;
  }

  return (
    <>
      <AuthLoading>
        <LoginLoading />
      </AuthLoading>
      <Authenticated>
        <RedirectToDashboard />
      </Authenticated>
      <Unauthenticated>
        <LoginScreen
          initialEmail={initialEmail}
          initialResetCode={initialResetCode}
          initialStep={initialStep}
        />
      </Unauthenticated>
    </>
  );
}

export default function LoginPage(props: PageProps<"/login">) {
  const searchParams = use(props.searchParams);

  return (
    <LoginPageClient
      initialEmail={typeof searchParams.email === "string" ? searchParams.email : ""}
      initialResetCode={typeof searchParams.code === "string" ? searchParams.code : ""}
      initialStep={typeof searchParams.step === "string" ? searchParams.step : "signIn"}
    />
  );
}
