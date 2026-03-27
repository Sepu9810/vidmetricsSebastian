"use client";

import { useState, useEffect } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function getFriendlyErrorMessage(errorMsg: string, flow: string): string {
  if (!errorMsg) return "An authentication error occurred.";
  
  const msgContext = errorMsg.toLowerCase();
  
  if (msgContext.includes("invalidaccountid") || msgContext.includes("invalid credentials") || msgContext.includes("invalid password")) {
    if (flow === "signIn") return "Invalid email or password. Please try again.";
    if (flow === "forgotPassword") return "No account found with this email address.";
    return "Invalid credentials provided.";
  }
  
  if (msgContext.includes("already exists") || msgContext.includes("already registered")) {
    return "This email is already registered. Please log in instead.";
  }
  
  if (msgContext.includes("invalid password requirements") || msgContext.includes("length")) {
    return "Password does not meet requirements (minimum 8 characters).";
  }

  // If it's a huge stack trace string from a server error, just hide it
  if (errorMsg.includes("Server Error ") || errorMsg.includes("Uncaught Error:") || errorMsg.length > 100) {
    return "Authentication failed. Please check your details and try again.";
  }
  
  return errorMsg;
}

export function LoginScreen() {
  const searchParams = useSearchParams();
  const initialStep = (searchParams.get("step") as any) || "signIn";
  
  const [step, setStep] = useState<"signIn" | "signUp" | "forgotPassword" | "checkEmail" | "resetPassword">(initialStep);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { signIn } = useAuthActions();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("email")) setEmail(searchParams.get("email") || "");
    if (searchParams.get("code")) setResetCode(searchParams.get("code") || "");
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (step === "signIn" || step === "signUp") {
        await signIn("password", { email, password, flow: step });
        router.push("/dashboard");
      } else if (step === "forgotPassword") {
        await signIn("password", { email, flow: "reset" });
        setStep("checkEmail");
      } else if (step === "resetPassword") {
        await signIn("password", { email, code: resetCode, newPassword: password, flow: "reset-verification" });
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err.message, step));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-6 overflow-hidden bg-background text-on-surface font-body selection:bg-secondary/30 antialiased">
      {/* Atmospheric Background Element */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-tertiary/10 blur-[120px] pointer-events-none"></div>

      <main className="relative z-10 w-full max-w-[440px]">
        {/* Branding Header */}
        <div className="flex flex-col items-center mb-10">
          <div className="mb-6 h-12 w-12 flex items-center justify-center rounded-2xl bg-surface-container-highest shadow-[0_0_30px_rgba(166,140,255,0.15)]">
            <span className="material-symbols-outlined text-secondary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>insights</span>
          </div>
          <h1 className="font-headline font-extrabold text-4xl tracking-tighter text-white mb-2">VidMetrics</h1>
          <p className="text-on-surface-variant font-medium tracking-wide">Enter the intelligence suite</p>
        </div>

        {/* Login Card */}
        <div className="glass-panel border border-outline-variant/20 rounded-3xl p-8 md:p-10 shadow-[0_40px_80px_rgba(0,0,0,0.5)]">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-error text-sm text-center font-medium font-body mb-4 leading-relaxed">
                {error}
              </div>
            )}
            
            {/* Check Email State */}
            {step === "checkEmail" && (
              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 bg-tertiary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-tertiary text-3xl">mark_email_read</span>
                </div>
                <h3 className="text-2xl font-bold text-white">Check your email</h3>
                <p className="text-on-surface-variant text-sm px-4 leading-relaxed">
                  We sent a password reset link to <br/><strong className="text-white">{email}</strong>
                </p>
                <div className="pt-6">
                  <button type="button" onClick={() => setStep("signIn")} className="text-secondary hover:text-white transition-colors text-sm font-semibold flex items-center justify-center gap-2 mx-auto">
                    <span className="material-symbols-outlined text-[1rem]">arrow_back</span>
                    Return to login
                  </button>
                </div>
              </div>
            )}

            {/* Email Field */}
            {step !== "checkEmail" && step !== "resetPassword" && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant px-1" htmlFor="email">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-outline group-focus-within:text-tertiary transition-colors">
                    <span className="material-symbols-outlined text-xl">alternate_email</span>
                  </div>
                  <input required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-14 pl-12 pr-4 bg-surface-container-lowest border-0 rounded-2xl text-on-surface placeholder:text-outline focus:ring-2 focus:ring-tertiary/40 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]" id="email" name="email" placeholder="name@company.com" type="email"/>
                </div>
              </div>
            )}



            {/* Password Field */}
            {step !== "forgotPassword" && step !== "checkEmail" && (
              <div className="space-y-2">
                {step === "resetPassword" && (
                  <p className="text-sm text-on-surface-variant mb-6 text-center">Enter a new secure password for your account.</p>
                )}
                <div className="flex justify-between items-center px-1">
                  <label className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant" htmlFor="password">
                    {step === "resetPassword" ? "New Password" : "Password"}
                  </label>
                  {step === "signIn" && (
                    <button type="button" onClick={() => { setStep("forgotPassword"); setError(""); }} className="text-xs font-semibold text-secondary hover:text-white transition-colors">Forgot Password?</button>
                  )}
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-outline group-focus-within:text-tertiary transition-colors">
                    <span className="material-symbols-outlined text-xl">lock</span>
                  </div>
                  <input required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full h-14 pl-12 pr-12 bg-surface-container-lowest border-0 rounded-2xl text-on-surface placeholder:text-outline focus:ring-2 focus:ring-tertiary/40 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]" id="password" name="password" placeholder="••••••••" type="password"/>
                </div>
              </div>
            )}

            {/* Action Button */}
            {step !== "checkEmail" && (
              <div className="pt-2 flex flex-col gap-4">
                <button disabled={loading} className="primary-gradient w-full h-14 rounded-2xl text-on-secondary font-headline font-bold text-lg flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(166,140,255,0.25)] hover:shadow-[0_15px_40px_rgba(166,140,255,0.35)] active:scale-[0.98] transition-all duration-300 disabled:opacity-50" type="submit">
                  {step === "signIn" ? "Login" : step === "signUp" ? "Create Account" : step === "forgotPassword" ? "Send Reset Link" : "Reset Password"}
                  {!loading && <span className="material-symbols-outlined">{step === "forgotPassword" ? "mail" : "arrow_forward"}</span>}
                  {loading && <span className="material-symbols-outlined animate-spin">refresh</span>}
                </button>
              </div>
            )}
          </form>
          
          {step !== "checkEmail" && (
            <div className="mt-8 text-center text-sm font-medium text-on-surface-variant">
            {step === "signIn" ? (
              <>
                Don&apos;t have an account?{" "}
                <button type="button" onClick={() => { setStep("signUp"); setError(""); }} className="text-tertiary hover:text-white font-bold ml-1 transition-colors">Sign Up</button>
              </>
            ) : step === "signUp" ? (
              <>
                Already have an account?{" "}
                <button type="button" onClick={() => { setStep("signIn"); setError(""); }} className="text-tertiary hover:text-white font-bold ml-1 transition-colors">Login</button>
              </>
            ) : (
              <button type="button" onClick={() => { setStep("signIn"); setError(""); }} className="text-tertiary hover:text-white font-bold inline-flex items-center gap-1 transition-colors">
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Back to Login
              </button>
            )}
          </div>
          )}
        </div>
      </main>

      {/* Decorative Network Detail */}
      <div className="fixed bottom-12 right-12 hidden xl:block max-w-[200px]">
        <div className="space-y-4">
          <div className="p-4 glass-panel border border-outline-variant/10 rounded-2xl">
            <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-2">Network Status</p>
            <div className="flex items-end gap-1 h-8">
              <div className="w-1 bg-tertiary/20 h-4 rounded-full"></div>
              <div className="w-1 bg-tertiary h-6 rounded-full"></div>
              <div className="w-1 bg-tertiary/60 h-8 rounded-full"></div>
              <div className="w-1 bg-tertiary h-5 rounded-full"></div>
              <div className="w-1 bg-tertiary/40 h-7 rounded-full"></div>
              <div className="w-1 bg-secondary h-4 rounded-full"></div>
              <div className="w-1 bg-secondary/80 h-6 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
