"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, X, CheckCircle2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { analysisWindows } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function NewReportScreen() {
  const router = useRouter();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [timeRange, setTimeRange] = useState("30d");
  const [urlInput, setUrlInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [step, setStep] = useState<"input" | "confirm">("input");
  const [channelInfo, setChannelInfo] = useState<{ name: string; avatar: string; handle: string } | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const reports = useQuery(api.reports.getReports);
  const reportCount = reports?.length ?? 0;
  
  const createReport = useMutation(api.reports.createReport);
  const verifyChannel = useAction(api.verify.channel);

  const handleValidateClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (reportCount >= 10) {
      setShowUpgrade(true);
      return;
    }
    if (!urlInput.trim()) return;

    try {
      setIsGenerating(true);
      const result = await verifyChannel({ urlInput });
      if (result.valid) {
        setChannelInfo({
          name: result.channelName!,
          avatar: result.channelAvatarUrl!,
          handle: result.channelUrlInput!
        });
        setStep("confirm");
      } else {
        setValidationError(result.error || "Channel not found");
      }
    } catch (error) {
      console.error(error);
      setValidationError("Error validating channel: " + (error as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (reportCount >= 10) {
      setShowUpgrade(true);
      return;
    }
    
    try {
      setIsGenerating(true);
      await createReport({ 
        channelUrlInput: urlInput, 
        dateRange: timeRange,
        channelName: channelInfo?.name,
        channelAvatarUrl: channelInfo?.avatar
      });
      // Redirect to dashboard immediately - no waiting!
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Error: " + (error as Error).message);
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid gap-8">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs uppercase tracking-[0.28em] text-subtle">
          Report Intake
        </p>
        <h1 className="mt-4 font-heading text-5xl font-semibold tracking-[-0.06em] text-white">
          Create intelligence
          <span className="display-gradient"> report</span>
        </h1>
        <p className="mt-4 text-base leading-7 text-subtle">
          Input a YouTube channel or handle to generate deep performance insights.
        </p>
      </div>

      <div className="flex justify-center w-full px-4">
        <Card className="premium-card mx-auto w-full max-w-3xl rounded-[2rem] p-6 sm:p-8 relative">
          
          {step === "input" && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <label className="grid gap-3">
                <span className="text-xs uppercase tracking-[0.24em] text-subtle">
                  Channel URL or handle
                </span>
                <Input
                  placeholder="youtube.com/@channelname"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="h-14 rounded-[1.35rem] border-white/6 bg-black/70 px-5 text-base text-white"
                />
              </label>

              <div className="space-y-3">
                <span className="text-xs uppercase tracking-[0.24em] text-subtle">
                  Analysis time range
                </span>
                <div className="grid grid-cols-3 gap-3">
                  {analysisWindows.map((window) => (
                    <Button
                      key={window}
                      type="button"
                      variant="secondary"
                      size="lg"
                      className={cn(
                        "rounded-[1.2rem]",
                        window === timeRange ? "bg-white text-black hover:bg-white/90" : "bg-white/5 opacity-70 hover:opacity-100"
                      )}
                      onClick={() => setTimeRange(window)}
                    >
                      {window}
                    </Button>
                  ))}
                </div>
              </div>

              <Button 
                size="lg" 
                className="w-full rounded-[1.35rem]" 
                onClick={handleValidateClick}
                disabled={isGenerating || !urlInput.trim()}
              >
                {isGenerating ? "Resolving Channel..." : "Validate Channel"}
                {!isGenerating && <ArrowRight className="size-4 ml-2" />}
              </Button>
              

            </div>
          )}

          {step === "confirm" && channelInfo && (
            <div className="space-y-8 animate-in slide-in-from-right-8 fade-in duration-300">
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">Is this the correct channel?</h3>
                <p className="text-subtle text-sm">Please verify the channel identity before we use AI credits.</p>
              </div>
              
              <div className="flex flex-col items-center justify-center p-6 bg-surface-container-highest rounded-2xl gap-4">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-surface-container shadow-xl">
                  {channelInfo.avatar ? (
                    <img src={channelInfo.avatar} alt="Channel Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold bg-secondary">
                      {channelInfo.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <h4 className="text-2xl font-bold text-white">{channelInfo.name}</h4>
                  <p className="text-subtle mt-1">{channelInfo.handle}</p>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="flex-1 rounded-[1.35rem] border-white/10" 
                  onClick={() => setStep("input")}
                  disabled={isGenerating}
                >
                  No, go back
                </Button>
                <Button 
                  size="lg" 
                  className="flex-1 rounded-[1.35rem] bg-gradient-to-r from-secondary to-secondary-container" 
                  onClick={handleGenerateClick}
                  disabled={isGenerating}
                >
                  {isGenerating ? "Initializing..." : "Yes, Generate Report"}
                  {!isGenerating && <CheckCircle2 className="size-4 ml-2" />}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {showUpgrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <Card className="premium-card relative w-full max-w-md rounded-[2rem] p-8 text-center animate-in zoom-in-95 fade-in-0 duration-200">
            <button
              onClick={() => setShowUpgrade(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-subtle hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-secondary-container">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h2 className="mb-2 font-heading text-2xl font-bold text-white">Limit Reached</h2>
            <p className="mb-8 text-subtle">
              You have analyzed the maximum of 10 channels. To have unlimited reports, hire Sebastian Sepulveda as a vibe coder.
            </p>
            <Button
              className="w-full rounded-2xl bg-gradient-to-r from-secondary to-secondary-container text-white py-6"
              onClick={() => window.open('https://www.linkedin.com/in/sebastian-sepulveda/', '_blank')}
            >
              Hire Sebastian Sepulveda
            </Button>
          </Card>
        </div>
      )}

      {validationError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <Card className="premium-card relative w-full max-w-md rounded-[2rem] p-8 text-center animate-in zoom-in-95 fade-in-0 duration-200">
            <button
              onClick={() => setValidationError(null)}
              className="absolute right-4 top-4 rounded-full p-2 text-subtle hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-error/10 border border-error/20">
              <AlertCircle className="h-8 w-8 text-error" />
            </div>
            <h2 className="mb-2 font-heading text-2xl font-bold text-white">Channel Not Found</h2>
            <p className="mb-8 text-subtle">
              {validationError}
            </p>
            <Button
              className="w-full rounded-2xl bg-white/5 text-white hover:bg-white/10 py-6 hover:text-white border border-white/10"
              onClick={() => setValidationError(null)}
            >
              Try Again
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
