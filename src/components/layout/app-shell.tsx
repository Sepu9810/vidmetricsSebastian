"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { cn } from "@/lib/utils";
import { X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navigation = [
  { href: "/reports/new", label: "Add Channel", icon: "add_circle" },
  { href: "/dashboard", label: "Reports", icon: "dashboard" },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard" || pathname.startsWith("/reports") && pathname !== "/reports/new";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuthActions();
  const reports = useQuery(api.reports.getReports);
  const user = useQuery(api.users.current);
  const reportCount = reports?.length ?? 0;
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="bg-background text-on-surface font-body selection:bg-secondary/30 antialiased h-screen w-full flex overflow-hidden">
      {/* Side Navigation Bar */}
      <aside className="hidden md:flex flex-col w-64 bg-surface-container-low py-8 px-4 gap-y-6 shrink-0 h-full overflow-y-auto">
        <div className="flex items-center gap-3 px-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-surface-container-highest shadow-[0_0_20px_rgba(166,140,255,0.1)] flex items-center justify-center">
            <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>insights</span>
          </div>
          <div>
            <h1 className="font-headline font-bold tracking-tighter text-white leading-none">VidMetrics</h1>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">Video Intelligence</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          {navigation.map(({ href, label, icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer group",
                  active
                    ? "bg-surface-container-highest text-white active:scale-[0.98]"
                    : "text-on-surface-variant hover:bg-surface-container-highest/50 hover:text-white"
                )}
              >
                <span className={cn("material-symbols-outlined transition-colors", !active && "group-hover:text-secondary")}>
                  {icon}
                </span>
                <span className={cn(active ? "font-medium" : "")}>{label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto space-y-1">
          <div className="p-4 rounded-xl bg-surface-container mb-4">
            <p className="text-xs text-on-surface-variant mb-2">Analysis Limit</p>
              <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full bg-secondary rounded-full" style={{ width: `${Math.min((reportCount / 10) * 100, 100)}%` }}></div>
            </div>
            <p className="text-[10px] mt-2 text-on-surface-variant">{reportCount} of 10 channels analyzed</p>
            <button
              onClick={() => setShowUpgrade(true)}
              className="w-full mt-3 py-2 px-4 bg-gradient-to-r from-secondary to-secondary-container text-white text-xs font-bold rounded-lg active:scale-95 transition-transform"
            >
              Upgrade Plan
            </button>
          </div>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-white transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-sm">help</span>
            <span className="text-xs">Help</span>
          </button>
          <button onClick={async () => { await signOut(); router.push("/login"); }} className="w-full flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-error transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-sm">logout</span>
            <span className="text-xs">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="h-16 shrink-0 bg-surface-container-low flex justify-between items-center px-6 z-30 glow-shadow border-b border-outline-variant/5">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-on-surface" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
            </button>
            <h2 className="font-headline font-bold text-lg text-on-surface hidden md:block">Dashboard Overview</h2>
          </div>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-8 h-8 rounded-full overflow-hidden border border-secondary/20 bg-surface-container-highest flex items-center justify-center text-xs font-bold text-white hover:bg-surface-container-highest/80 transition-colors cursor-pointer outline-none">
                  {user?.email?.[0]?.toUpperCase() ?? "S"}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-surface-container-low border-white/10 text-on-surface">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1 text-left">
                    <p className="text-xs leading-none text-on-surface-variant truncate">
                      {user !== undefined ? (user?.email || "No email") : "Loading..."}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem 
                  className="text-error focus:text-error focus:bg-error/10 cursor-pointer"
                  onClick={async () => { await signOut(); router.push("/login"); }}
                >
                  <span className="material-symbols-outlined text-[1rem] mr-2">logout</span>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Canvas */}
        <main className="flex-1 overflow-y-auto pt-8 pb-32 md:pb-12 px-6">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full glass-effect z-50 flex items-center justify-around h-16 border-t border-white/5">
        {navigation.map(({ href, label, icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link key={href} href={href} className={cn("flex flex-col items-center gap-1", active ? "text-secondary" : "text-on-surface-variant")}>
              <span className="material-symbols-outlined" style={active ? { fontVariationSettings: "'FILL' 1" } : {}}>{icon}</span>
              <span className={cn("text-[10px]", active && "font-bold")}>{label === "Add Channel" ? "Add" : label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Mobile Slide-Out Sidebar */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
          <aside className="absolute left-0 top-0 h-full w-64 bg-surface-container-low py-8 px-4 flex flex-col gap-y-6 animate-in slide-in-from-left duration-200 shadow-2xl">
            <div className="flex items-center gap-3 px-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-surface-container-highest shadow-[0_0_20px_rgba(166,140,255,0.1)] flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>insights</span>
              </div>
              <div>
                <h1 className="font-headline font-bold tracking-tighter text-white leading-none">VidMetrics</h1>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">Video Intelligence</p>
              </div>
            </div>
            <nav className="flex-1 space-y-1">
              {navigation.map(({ href, label, icon }) => {
                const active = isActive(pathname, href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer group",
                      active
                        ? "bg-surface-container-highest text-white"
                        : "text-on-surface-variant hover:bg-surface-container-highest/50 hover:text-white"
                    )}
                  >
                    <span className={cn("material-symbols-outlined transition-colors", !active && "group-hover:text-secondary")}>
                      {icon}
                    </span>
                    <span className={cn(active ? "font-medium" : "")}>{label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="mt-auto space-y-1">
              <button onClick={async () => { await signOut(); router.push("/login"); }} className="w-full flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-error transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-sm">logout</span>
                <span className="text-xs">Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {showUpgrade && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
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
            <h2 className="mb-2 font-heading text-2xl font-bold text-white">Hire a Vibe Coder</h2>
            <p className="mb-8 text-subtle">
              To have unlimited reports, hire Sebastian Sepulveda as a vibe coder.
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
    </div>
  );
}
