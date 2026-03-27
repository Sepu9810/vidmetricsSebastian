import { BadgeCheck, Bot, DatabaseZap, KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type IntegrationStatus = "connected" | "server-managed" | "pending";

const integrations = [
  {
    title: "Convex deployment",
    body: "Database, auth, and report persistence.",
    status: process.env.NEXT_PUBLIC_CONVEX_URL ? "connected" : "pending",
    icon: DatabaseZap,
  },
  {
    title: "OpenAI summaries",
    body: "Structured insight generation and validation, managed in Convex environment settings.",
    status: "server-managed",
    icon: Bot,
  },
  {
    title: "Apify ingestion",
    body: "Channel resolution, metrics fetch, and ranking inputs, managed in Convex environment settings.",
    status: "server-managed",
    icon: KeyRound,
  },
] satisfies Array<{
  title: string;
  body: string;
  status: IntegrationStatus;
  icon: typeof DatabaseZap;
}>;

function getStatusBadge(status: IntegrationStatus) {
  if (status === "connected") {
    return {
      label: "Connected",
      className: "bg-[rgba(68,165,255,0.14)] text-[color:var(--brand-blue)]",
    };
  }

  if (status === "server-managed") {
    return {
      label: "Server-managed",
      className: "bg-[rgba(166,140,255,0.14)] text-[color:var(--brand-violet)]",
    };
  }

  return {
    label: "Pending",
    className: "bg-white/6 text-subtle",
  };
}

export default function AccountPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-subtle">
          Project Setup
        </p>
        <h1 className="mt-3 font-heading text-4xl font-semibold tracking-[-0.05em] text-white">
          Stack readiness
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-subtle">
          The UI shell is in place. This page tracks which backend integrations are
          already configured in the environment.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {integrations.map(({ title, body, status, icon: Icon }) => {
          const badge = getStatusBadge(status);

          return (
            <Card key={title} className="premium-card rounded-[1.8rem] p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex size-12 items-center justify-center rounded-[1.2rem] bg-[color:var(--surface-low)] text-[color:var(--brand-violet)]">
                  <Icon className="size-5" />
                </div>
                <div
                  className={`rounded-full px-3 py-1 text-xs font-medium ${badge.className}`}
                >
                  {badge.label}
                </div>
              </div>
              <h2 className="mt-6 font-heading text-2xl tracking-[-0.04em] text-white">
                {title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-subtle">{body}</p>
            </Card>
          );
        })}
      </div>

      <Card className="premium-card rounded-[2rem] p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-subtle">
          Current implementation focus
        </p>
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {[
            "Marketing landing, login, reports dashboard, report detail, and intake flow now map to the Stitch concepts.",
            "Convex schema is prepared next so the UI can move from mocked state into owned report data and protected access.",
            "Authentication is planned as email-only for v1, matching the engineering spec and removing social complexity.",
            "Apify and OpenAI stay disconnected until you provide the keys and we wire the processing pipeline.",
          ].map((item) => (
            <div
              key={item}
              className="rounded-[1.4rem] bg-[color:var(--surface-low)] p-4 text-sm leading-7 text-subtle"
            >
              <div className="mb-3 flex size-8 items-center justify-center rounded-full bg-white/6 text-white">
                <BadgeCheck className="size-4" />
              </div>
              {item}
            </div>
          ))}
        </div>
        <div className="mt-6">
          <Button className="rounded-2xl">Backend wiring comes next</Button>
        </div>
      </Card>
    </div>
  );
}
