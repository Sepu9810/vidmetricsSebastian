"use client";

import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { LoginScreen } from "@/components/auth/login-screen";
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

function LoginPageClient({
  initialStep,
  initialEmail,
  initialResetCode,
}: {
  initialStep: string;
  initialEmail: string;
  initialResetCode: string;
}) {
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
