"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export function LandingPage() {
  const router = useRouter();
  const [channelUrl, setChannelUrl] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAnalyze = () => {
    router.push("/login");
  };

  return (
    <div className="bg-background text-on-surface font-body selection:bg-secondary/30 antialiased overflow-x-hidden">
      {/* Global CSS Animations */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(166,140,255,0.15); }
          50% { box-shadow: 0 0 40px rgba(166,140,255,0.3); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
        .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; }
        .animate-slide-left { animation: slideInLeft 0.7s ease-out forwards; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-600 { animation-delay: 0.6s; }
        .delay-700 { animation-delay: 0.7s; }
        .glass-panel {
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.06);
        }
      `}</style>

      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 glass-panel border-b border-white/5">
        <div className={`flex justify-between items-center px-6 md:px-8 py-4 max-w-6xl mx-auto transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-surface-container-highest/80 shadow-[0_0_20px_rgba(166,140,255,0.15)] flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>insights</span>
            </div>
            <span className="font-headline font-bold text-lg tracking-tighter text-white">VidMetrics</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-on-surface-variant hover:text-white transition-colors text-sm font-medium">Log In</Link>
            <Link href="/login" className="primary-gradient text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-all active:scale-95 shadow-[0_4px_20px_rgba(166,140,255,0.25)]">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-0 md:pt-40 md:pb-0 overflow-hidden">
          {/* Ambient light effects */}
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-secondary/10 rounded-full blur-[160px] pointer-events-none animate-float"></div>
          <div className="absolute top-60 -left-40 w-[300px] h-[300px] bg-tertiary/5 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute top-40 -right-20 w-[250px] h-[250px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none"></div>

          {/* Diagonal light rays (from the template) */}
          <div aria-hidden className="z-[2] absolute inset-0 pointer-events-none isolate opacity-40 hidden lg:block">
            <div className="w-[35rem] h-[80rem] -translate-y-[350px] absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(260,60%,70%,.08)_0,hsla(260,40%,50%,.02)_50%,hsla(260,30%,40%,0)_80%)]" />
            <div className="h-[80rem] absolute left-0 top-0 w-56 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(260,60%,70%,.06)_0,hsla(260,40%,40%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
          </div>

          <div className="max-w-6xl mx-auto px-6 md:px-8 relative z-10">
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16 md:mb-20">
              {/* Badge */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-secondary text-xs font-bold uppercase tracking-widest mb-8 animate-pulse-glow ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                AI-Powered Video Intelligence
              </div>

              {/* Title */}
              <h1 className={`text-5xl md:text-6xl lg:text-7xl font-headline font-extrabold tracking-tight text-white mb-6 leading-[1.08] ${mounted ? 'animate-fade-in-up delay-100' : 'opacity-0'}`} style={{ animationFillMode: 'both' }}>
                Analyze Any YouTube{" "}
                <br className="hidden md:block" />
                Channel in Seconds.
              </h1>

              {/* Subtitle */}
              <p className={`text-lg text-on-surface-variant mb-10 max-w-xl leading-relaxed ${mounted ? 'animate-fade-in-up delay-200' : 'opacity-0'}`} style={{ animationFillMode: 'both' }}>
                Paste a channel URL and get a deep AI-powered report: top-performing videos, engagement patterns, and actionable strategy insights.
              </p>

              {/* Hero CTA */}
              <div className={`flex flex-col sm:flex-row items-center gap-3 w-full max-w-lg ${mounted ? 'animate-fade-in-up delay-300' : 'opacity-0'}`} style={{ animationFillMode: 'both' }}>
                <div className="relative flex-grow w-full group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-outline group-focus-within:text-secondary transition-colors">
                    <span className="material-symbols-outlined text-xl">link</span>
                  </div>
                  <input
                    value={channelUrl}
                    onChange={(e) => setChannelUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                    className="w-full glass-panel rounded-2xl pl-12 pr-4 py-4 text-on-surface placeholder:text-outline h-14 transition-all border-0 focus:ring-2 focus:ring-secondary/40 focus:border-secondary/40"
                    placeholder="https://youtube.com/@channel"
                    type="text"
                  />
                </div>
                <button
                  onClick={handleAnalyze}
                  className="primary-gradient text-white font-bold px-8 h-14 rounded-2xl hover:opacity-90 transition-all active:scale-95 whitespace-nowrap w-full sm:w-auto shadow-[0_8px_30px_rgba(166,140,255,0.3)] hover:shadow-[0_12px_40px_rgba(166,140,255,0.4)] flex items-center justify-center gap-2"
                >
                  Analyze
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </div>
              <p className={`text-xs text-outline mt-4 ${mounted ? 'animate-fade-in delay-400' : 'opacity-0'}`} style={{ animationFillMode: 'both' }}>Free to start — No credit card required</p>
            </div>

            {/* App Preview - Perspective Diagonal Style with Annotations */}
            <div className={`relative ${mounted ? 'animate-fade-in-up delay-500' : 'opacity-0'}`} style={{ animationFillMode: 'both' }}>
              
              {/* Hand-drawn style annotations - left side (desktop only) */}
              <div className="hidden lg:block absolute left-0 top-8 z-20 w-56 space-y-12">
                {/* Annotation 1 */}
                <div className="relative animate-fade-in-up delay-600" style={{ animationFillMode: 'both' }}>
                  <div className="glass-panel rounded-xl px-4 py-3 text-left">
                    <p className="text-sm font-semibold text-white" style={{ fontFamily: "'Caveat', cursive" }}>🧠 AI analyzes your top-performing videos automatically</p>
                  </div>
                  {/* Arrow SVG pointing right */}
                  <svg className="absolute -right-8 top-1/2 -translate-y-1/2 w-10 h-8 text-secondary/60" viewBox="0 0 40 30" fill="none">
                    <path d="M2 15 C10 15, 20 5, 35 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 3"/>
                    <path d="M30 7 L36 12 L30 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>

                {/* Annotation 2 */}
                <div className="relative animate-fade-in-up delay-700" style={{ animationFillMode: 'both' }}>
                  <div className="glass-panel rounded-xl px-4 py-3 text-left">
                    <p className="text-sm font-semibold text-white" style={{ fontFamily: "'Caveat', cursive" }}>📊 Engagement score for every video in seconds</p>
                  </div>
                  <svg className="absolute -right-8 top-1/2 -translate-y-1/2 w-10 h-8 text-tertiary/60" viewBox="0 0 40 30" fill="none">
                    <path d="M2 15 C12 20, 22 10, 35 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 3"/>
                    <path d="M30 9 L36 14 L30 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>

                {/* Annotation 3 */}
                <div className="relative animate-fade-in-up" style={{ animationDelay: '0.8s', animationFillMode: 'both' }}>
                  <div className="glass-panel rounded-xl px-4 py-3 text-left">
                    <p className="text-sm font-semibold text-white" style={{ fontFamily: "'Caveat', cursive" }}>🚀 Actionable strategy to outperform competitors</p>
                  </div>
                  <svg className="absolute -right-8 top-1/2 -translate-y-1/2 w-10 h-8 text-secondary/60" viewBox="0 0 40 30" fill="none">
                    <path d="M2 18 C15 22, 25 8, 35 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 3"/>
                    <path d="M30 10 L36 15 L30 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              {/* The diagonal image */}
              <div className="lg:ml-48">
                <div className="mx-auto -mr-8 md:-mr-16 lg:-mr-48 pl-4 md:pl-8 [perspective:1200px] [mask-image:linear-gradient(to_bottom,black_40%,transparent_95%)]">
                  <div className="[transform:rotateX(12deg)_rotateY(-8deg)] hover:[transform:rotateX(8deg)_rotateY(-4deg)] transition-transform duration-700 ease-out">
                    <div className="relative skew-x-[2deg]">
                      <img
                        className="rounded-2xl border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] w-full h-auto"
                        alt="VidMetrics Dashboard"
                        src="/app-preview.png"
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent rounded-2xl pointer-events-none"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 md:py-32 relative z-10">
          <div className="max-w-6xl mx-auto px-6 md:px-8">
            <div className="text-center mb-16">
              <span className="text-secondary text-xs font-bold uppercase tracking-widest">How It Works</span>
              <h2 className="text-3xl md:text-4xl font-headline font-bold text-white mt-4">Three Steps to Intelligence</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: "link", title: "Paste Channel URL", desc: "Enter any YouTube channel URL or handle to start the analysis." },
                { icon: "smart_toy", title: "AI Analyzes Content", desc: "Our AI scrapes videos, ranks performance, and identifies winning patterns." },
                { icon: "insights", title: "Get Your Report", desc: "Receive a comprehensive report with engagement metrics, top videos, and strategic takeaways." },
              ].map((step, i) => (
                <div key={i} className="p-8 rounded-2xl glass-panel hover:border-secondary/20 transition-all duration-500 group hover:shadow-[0_8px_30px_rgba(166,140,255,0.08)] hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-xl bg-secondary/15 flex items-center justify-center mb-6 text-secondary group-hover:bg-secondary/25 group-hover:scale-110 transition-all duration-300">
                    <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>{step.icon}</span>
                  </div>
                  <div className="text-xs font-bold text-on-surface-variant/60 uppercase tracking-widest mb-3">Step {i + 1}</div>
                  <h3 className="text-xl font-headline font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-on-surface-variant leading-relaxed text-sm">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-24 md:py-32 relative">
          <div className="absolute inset-0 bg-surface-container-low/50"></div>
          <div className="max-w-6xl mx-auto px-6 md:px-8 relative z-10">
            <div className="text-center mb-16">
              <span className="text-tertiary text-xs font-bold uppercase tracking-widest">Features</span>
              <h2 className="text-3xl md:text-4xl font-headline font-bold text-white mt-4">Everything You Need to Compete</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { icon: "trending_up", color: "secondary", title: "Performance Scoring", desc: "Each video gets an AI-computed performance score based on views, likes, comments, and engagement rate." },
                { icon: "psychology", color: "tertiary", title: "AI Analysis per Video", desc: "Understand precisely why each top video succeeded — patterns, hooks, timing, and audience triggers." },
                { icon: "compare", color: "secondary", title: "Shorts vs Long-Form", desc: "Compare Shorts and long-form content side-by-side. Discover which format wins for each channel." },
                { icon: "mail", color: "tertiary", title: "Email Notifications", desc: "Reports are generated in the background. Get notified via email when your analysis is ready." },
              ].map((f, i) => (
                <div key={i} className="p-8 rounded-2xl glass-panel hover:border-white/10 transition-all duration-500 group hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)]">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-all duration-300 ${f.color === 'secondary' ? 'bg-secondary/15' : 'bg-tertiary/15'}`}>
                    <span className={`material-symbols-outlined text-2xl ${f.color === 'secondary' ? 'text-secondary' : 'text-tertiary'}`} style={{ fontVariationSettings: "'FILL' 1" }}>{f.icon}</span>
                  </div>
                  <h3 className="text-lg font-headline font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 md:py-32">
          <div className="max-w-6xl mx-auto px-6 md:px-8">
            <div className="primary-gradient rounded-3xl p-12 md:p-16 text-center relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-[60px] pointer-events-none"></div>
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-headline font-extrabold text-white mb-4">Ready to outsmart the competition?</h2>
                <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">
                  Start analyzing YouTube channels in seconds. No credit card required.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 bg-white text-[#25006b] font-extrabold px-10 py-4 rounded-2xl hover:bg-gray-100 transition-all active:scale-95 shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.4)]"
                >
                  Get Started Free
                  <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10">
        <div className="max-w-6xl mx-auto px-6 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-surface-container-highest/60 flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>insights</span>
            </div>
            <span className="font-headline font-bold text-sm text-white">VidMetrics</span>
          </div>
          <div className="flex flex-col items-center md:items-end gap-1">
            <p className="text-xs text-outline">© 2025 VidMetrics. All rights reserved.</p>
            <p className="text-xs text-outline/60">Desarrollada por <span className="text-on-surface-variant">Sebastián Sepúlveda</span></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
