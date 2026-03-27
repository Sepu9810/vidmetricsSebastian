import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCheck, Shield, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { channelPreview, pipelineStages } from "@/lib/mock-data";

export function ChannelConfirmationScreen() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-subtle">
          Channel Confirmation
        </p>
        <h1 className="mt-3 font-heading text-4xl font-semibold tracking-[-0.05em] text-white">
          Confirm channel identity before generation
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-subtle">
          Resolve the channel once, persist the metadata, and then hand the job to
          the report pipeline.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="premium-card rounded-[2rem] p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-16 items-center justify-center rounded-[1.4rem] bg-linear-to-br from-[color:var(--brand-violet)] to-[color:var(--brand-violet-deep)] text-xl font-semibold text-white">
                TT
              </div>
              <div>
                <p className="font-heading text-2xl tracking-[-0.04em] text-white">
                  {channelPreview.name}
                </p>
                <p className="text-sm text-subtle">{channelPreview.handle}</p>
                <p className="mt-2 text-sm text-subtle">{channelPreview.url}</p>
              </div>
            </div>
            <div className="rounded-[1.25rem] bg-[color:var(--surface-low)] px-4 py-3 text-sm text-subtle">
              {channelPreview.subscribers}
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[channelPreview.cadence, channelPreview.classification, "Date range: 30d"].map(
              (value) => (
                <div
                  key={value}
                  className="rounded-[1.4rem] bg-[color:var(--surface-low)] p-4 text-sm text-subtle"
                >
                  {value}
                </div>
              )
            )}
          </div>

          <div className="mt-8 rounded-[1.6rem] bg-[color:var(--surface-low)] p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-subtle">
              Recent videos
            </p>
            <div className="mt-4 grid gap-3">
              {channelPreview.recentVideos.map((video) => (
                <div
                  key={video}
                  className="flex items-center justify-between rounded-[1.2rem] border border-white/5 bg-black/20 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-white/5">
                      <Video className="size-4 text-[color:var(--brand-violet)]" />
                    </div>
                    <span className="text-sm text-white">{video}</span>
                  </div>
                  <CheckCheck className="size-4 text-[color:var(--brand-blue)]" />
                </div>
              ))}
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="premium-card rounded-[2rem] p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-subtle">
              Pipeline stages
            </p>
            <div className="mt-4 space-y-3">
              {pipelineStages.map((stage) => (
                <div
                  key={stage.label}
                  className="flex items-center justify-between rounded-[1.2rem] bg-[color:var(--surface-low)] px-4 py-3 text-sm"
                >
                  <span className="text-white">{stage.label}</span>
                  <span className="text-subtle">{stage.percent}%</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="premium-card rounded-[2rem] p-6">
            <div className="flex items-start gap-3">
              <Shield className="mt-1 size-5 text-[color:var(--brand-blue)]" />
              <div>
                <p className="font-heading text-lg text-white">
                  Inference guardrail
                </p>
                <p className="mt-2 text-sm leading-6 text-subtle">
                  If transcript or script data is missing, the structure section is
                  labeled as inferred instead of pretending to know the exact script.
                </p>
              </div>
            </div>
          </Card>

          <div className="flex flex-col gap-3">
            <Button asChild size="lg" className="rounded-[1.35rem]">
              <Link href="/reports/techno-trends-review">
                Generate Report
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="rounded-[1.35rem]">
              <Link href="/reports/new">
                <ArrowLeft className="size-4" />
                Back to channel input
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
