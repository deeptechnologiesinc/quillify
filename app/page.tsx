"use client";

import Link from "next/link";
import { QuillifyLogo } from "@/components/QuillifyLogo";
import {
  ArrowRight, Sparkles, FileText, BookOpen, Download,
  CheckCircle, Star, Zap, Shield, ChevronRight, Menu, X,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useUser, UserButton } from "@clerk/nextjs";

function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function useCounter(target: number, inView: boolean, duration = 1600) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const t = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(t); }
      else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(t);
  }, [inView, target, duration]);
  return val;
}

function Navbar() {
  const [open, setOpen] = useState(false);
  const { isSignedIn } = useUser();
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-indigo-50/80 shadow-sm shadow-indigo-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <QuillifyLogo size={32} showByline />
        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm text-gray-500 hover:text-indigo-700 transition-colors cursor-pointer">Features</Link>
          <Link href="#how-it-works" className="text-sm text-gray-500 hover:text-indigo-700 transition-colors cursor-pointer">How it works</Link>
          <Link href="/pricing" className="text-sm text-gray-500 hover:text-indigo-700 transition-colors cursor-pointer">Pricing</Link>
          <Link href="/blog" className="text-sm text-gray-500 hover:text-indigo-700 transition-colors cursor-pointer">Blog</Link>
        </div>
        <div className="hidden md:flex items-center gap-3">
          {isSignedIn ? (
            <>
              <Link href="/app" className="btn-shine text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl cursor-pointer shadow-sm transition-colors">Open App</Link>
              <UserButton />
            </>
          ) : (
            <>
              <Link href="/sign-in" className="text-sm font-semibold text-indigo-700 px-4 py-2 cursor-pointer hover:text-indigo-900 transition-colors">Sign in</Link>
              <Link href="/sign-up" className="btn-shine text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl cursor-pointer shadow-sm transition-colors">Start free</Link>
            </>
          )}
        </div>
        <button className="md:hidden p-2 cursor-pointer" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-white border-t border-indigo-50 px-4 py-4 space-y-3">
          <Link href="#features" className="block text-sm text-gray-600 py-2" onClick={() => setOpen(false)}>Features</Link>
          <Link href="#how-it-works" className="block text-sm text-gray-600 py-2" onClick={() => setOpen(false)}>How it works</Link>
          <Link href="/pricing" className="block text-sm text-gray-600 py-2" onClick={() => setOpen(false)}>Pricing</Link>
          <Link href="/blog" className="block text-sm text-gray-600 py-2" onClick={() => setOpen(false)}>Blog</Link>
          <div className="pt-2 flex flex-col gap-2">
            {isSignedIn ? (
              <Link href="/app" className="block text-center text-sm font-semibold bg-indigo-600 text-white rounded-xl py-2.5">Open App</Link>
            ) : (
              <>
                <Link href="/sign-in" className="block text-center text-sm font-semibold text-indigo-700 border border-indigo-200 rounded-xl py-2.5">Sign in</Link>
                <Link href="/sign-up" className="block text-center text-sm font-semibold bg-indigo-600 text-white rounded-xl py-2.5">Start free</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default function LandingPage() {
  useScrollReveal();
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVisible(true); }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 text-center overflow-hidden bg-gradient-to-b from-indigo-50/70 via-white/60 to-white">

        {/* Ambient orbs */}
        <div className="absolute top-12 left-[10%] w-[500px] h-[500px] bg-indigo-300/20 rounded-full blur-[100px] animate-orb pointer-events-none -z-10" />
        <div className="absolute top-32 right-[8%] w-[350px] h-[350px] bg-amber-300/15 rounded-full blur-[80px] animate-orb-2 pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-[35%] w-[400px] h-[300px] bg-violet-300/12 rounded-full blur-[90px] animate-orb pointer-events-none -z-10" style={{ animationDelay: "3s" }} />

        <div className="max-w-4xl mx-auto">

          <div className="animate-badge-pop inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 shadow-sm shadow-amber-100">
            <Sparkles className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            AI Detection Score · Academic References · APA 7 Formatting
          </div>

          <h1 className="animate-fade-in text-5xl sm:text-6xl lg:text-7xl font-bold text-indigo-950 leading-tight tracking-tight mb-6" style={{ fontFamily: "'EB Garamond', Georgia, serif", animationDelay: "0.1s", opacity: 0 }}>
            Write Human.
            <span className="block gradient-text">Sound Real.</span>
          </h1>

          <p className="animate-fade-in text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed mb-10" style={{ animationDelay: "0.25s", opacity: 0 }}>
            Quillify transforms AI-written text into natural, academic-quality writing — then finds real citations,
            inserts them automatically, and exports a perfectly formatted Word document.
          </p>

          <div className="animate-fade-in flex flex-col sm:flex-row items-center justify-center gap-4" style={{ animationDelay: "0.4s", opacity: 0 }}>
            <Link href="/sign-up" className="btn-shine flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-4 rounded-2xl text-base transition-all shadow-lg shadow-indigo-200/60 cursor-pointer animate-pulse-glow">
              Start for free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="#how-it-works" className="flex items-center gap-2 text-indigo-700 font-semibold px-6 py-4 rounded-2xl text-base hover:bg-indigo-50 transition-colors cursor-pointer">
              See how it works <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <p className="mt-5 text-xs text-gray-400 animate-fade-in" style={{ animationDelay: "0.5s", opacity: 0 }}>Free tier available · No credit card required</p>

          {/* Mock UI — floating */}
          <div className="mt-16 relative max-w-3xl mx-auto animate-float">
            <div className="bg-white rounded-2xl shadow-2xl shadow-indigo-200/50 border border-indigo-100 overflow-hidden text-left">
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-3 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="ml-2 text-xs text-indigo-200 font-mono">quillify.io/app</span>
              </div>
              <div className="p-5 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-2">AI Detection Score</p>
                  <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
                    <p className="text-3xl font-bold text-red-500" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>87%</p>
                    <p className="text-xs text-red-400 mt-0.5">Likely AI-generated</p>
                  </div>
                  <div className="mt-3 space-y-1.5">
                    {["Uniform sentence length", "Formal vocabulary", "No hedging language"].map(i => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-2.5 py-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />{i}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-2">After Humanizing</p>
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
                    <p className="text-3xl font-bold text-emerald-500" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>12%</p>
                    <p className="text-xs text-emerald-600 mt-0.5">Sounds human</p>
                  </div>
                  <div className="mt-3 space-y-1.5">
                    {["Natural sentence variety", "Everyday vocabulary", "Personal hedging added"].map(i => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-2.5 py-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />{i}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* Glow halo behind card */}
            <div className="absolute -inset-6 bg-indigo-400/10 rounded-3xl blur-3xl -z-10" />
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────── */}
      <StatsBanner ref={statsRef} visible={statsVisible} />

      {/* ── Features ─────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 reveal">
            <h2 className="text-4xl sm:text-5xl font-bold text-indigo-950 mb-4" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
              Everything a student needs
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">From rough AI draft to polished, cited, submission-ready paper in one workflow.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {([
              { icon: <Zap className="w-6 h-6 text-amber-500" />,    title: "AI Detection Score",        desc: "Score your text 0–100% for AI likelihood. See exactly which patterns are flagging your writing.",                     badge: "Before you humanize", bg: "bg-amber-50   border-amber-100",  glow: "hover:shadow-amber-100/80" },
              { icon: <Sparkles className="w-6 h-6 text-indigo-500" />, title: "Smart Humanizer",        desc: "Two-pass Claude AI rewrites your text with varied sentences, everyday words, and natural hedging.",                   badge: "Core feature",       bg: "bg-indigo-50  border-indigo-100", glow: "hover:shadow-indigo-100/80" },
              { icon: <BookOpen className="w-6 h-6 text-emerald-500" />, title: "Academic Reference Finder", desc: "Searches 3 databases simultaneously to find open-access papers supporting your specific claims.",               badge: "3 search engines",   bg: "bg-emerald-50 border-emerald-100",glow: "hover:shadow-emerald-100/80" },
              { icon: <FileText className="w-6 h-6 text-violet-500" />, title: "Auto Citation Insertion", desc: "Select papers to cite. Quillify inserts APA 7 in-text citations at the right sentences automatically.",            badge: "APA 7",              bg: "bg-violet-50  border-violet-100", glow: "hover:shadow-violet-100/80" },
              { icon: <Shield className="w-6 h-6 text-blue-500" />,   title: "Structure Preserved",      desc: "Upload your Word file and tables, headings, and formatting survive the AI pipeline intact.",                         badge: "Upload .docx, .pdf", bg: "bg-blue-50    border-blue-100",   glow: "hover:shadow-blue-100/80" },
              { icon: <Download className="w-6 h-6 text-rose-500" />, title: "One-Click APA Export",     desc: "Make your document APA 7 compliant with one click then download as a Word file.",                                   badge: "Export .docx",       bg: "bg-rose-50    border-rose-100",   glow: "hover:shadow-rose-100/80" },
            ] as const).map((f, i) => (
              <div key={f.title}
                className={`card-hover reveal rounded-2xl border p-6 ${f.bg} ${f.glow} delay-${i * 100}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-white rounded-xl shadow-sm">{f.icon}</div>
                  <span className="text-xs font-semibold text-gray-400 bg-white/70 px-2 py-0.5 rounded-full border border-gray-100">{f.badge}</span>
                </div>
                <h3 className="text-base font-bold text-indigo-950 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 bg-gradient-to-b from-indigo-950 to-indigo-900 relative overflow-hidden">
        {/* Background orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto relative">
          <div className="text-center mb-16 reveal">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
              From draft to submission in 4 steps
            </h2>
            <p className="text-indigo-300 text-lg">No other tool takes you this far.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { n: "01", title: "Paste or upload your text",    desc: "Drop in a .docx, .pdf, or .txt file or paste directly. Quillify extracts content while preserving tables and structure.", dir: "reveal-left" },
              { n: "02", title: "Analyse and humanize",         desc: "Get an AI detection score with a full breakdown. Hit Humanize for a two-pass Claude rewrite that sounds genuinely human.", dir: "reveal-right" },
              { n: "03", title: "Find and insert citations",    desc: "Quillify checks your existing citations. If gaps exist, it searches 3 academic databases and auto-inserts relevant ones.", dir: "reveal-left" },
              { n: "04", title: "Format and download",          desc: "One click for APA 7 compliance. Download as a properly formatted Word file ready for submission.", dir: "reveal-right" },
            ].map((s) => (
              <div key={s.n} className={`${s.dir} bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 transition-all duration-300 cursor-default`}>
                <span className="text-5xl font-bold text-indigo-400/50" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>{s.n}</span>
                <h3 className="text-lg font-bold text-white mt-2 mb-2">{s.title}</h3>
                <p className="text-sm text-indigo-300 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Before / After ───────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50/60 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-5xl mx-auto relative">
          <div className="text-center mb-14 reveal">
            <span className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Real transformation
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-indigo-950 mb-4" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
              See the difference yourself
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">Same ideas, completely different voice. One click is all it takes.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 items-start">
            {/* Before */}
            <div className="reveal-left rounded-2xl border border-red-100 bg-red-50/40 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-red-100 bg-red-50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Before · AI-generated</span>
                </div>
                <span className="text-xs font-bold text-red-500 bg-red-100 px-2 py-0.5 rounded-full">87% AI</span>
              </div>
              <div className="px-5 py-5 text-sm text-gray-700 leading-relaxed space-y-3">
                <p>The implementation of sustainable practices within corporate frameworks necessitates a multifaceted approach that leverages stakeholder engagement and organizational synergies. It is paramount that businesses utilize comprehensive strategies to delve into the intricate complexities of environmental governance.</p>
                <p>Furthermore, the aforementioned paradigm shifts require meticulous analysis of the interplay between economic imperatives and ecological considerations, ensuring that all relevant parameters are systematically addressed.</p>
              </div>
            </div>
            {/* After */}
            <div className="reveal-right rounded-2xl border border-emerald-100 bg-emerald-50/40 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-emerald-100 bg-emerald-50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">After · Humanized</span>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">11% AI</span>
              </div>
              <div className="px-5 py-5 text-sm text-gray-700 leading-relaxed space-y-3">
                <p>Getting companies to actually embrace sustainability isn&apos;t simple. From what I&apos;ve seen, it really comes down to getting the right people on board and making sure different parts of the business are working toward the same goals — rather than treating it as a box-ticking exercise.</p>
                <p>There&apos;s also a real tension between short-term financial pressure and doing the right thing environmentally. I think the businesses that handle this well tend to treat environmental concerns as a core part of their strategy, not an afterthought.</p>
              </div>
            </div>
          </div>
          <div className="mt-8 text-center reveal">
            <Link href="/sign-up" className="btn-shine inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3.5 rounded-2xl text-sm transition-all shadow-lg shadow-indigo-200/60 cursor-pointer">
              Try it on your text <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 bg-slate-50 relative overflow-hidden">
        <div className="absolute bottom-0 left-1/3 w-96 h-64 bg-indigo-100/40 rounded-full blur-[80px] pointer-events-none" />
        <div className="max-w-5xl mx-auto relative">
          <div className="text-center mb-14 reveal">
            <div className="inline-flex items-center gap-1 mb-4">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-indigo-950 mb-3" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
              Students love Quillify
            </h2>
            <p className="text-gray-500 text-lg">Real feedback from real academics.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {([
              {
                quote: "I had a 3,000-word essay that was flagged as 91% AI. After Quillify, it came back at 8%. My professor had no idea. Genuinely saved my semester.",
                name: "Priya M.",
                role: "MBA student, UBC",
                stars: 5,
              },
              {
                quote: "The citation finder is the best part. It searches three databases at once and just drops the references in. Used to spend hours on this manually.",
                name: "James T.",
                role: "PhD candidate, University of Toronto",
                stars: 5,
              },
              {
                quote: "The APA export feature alone is worth the subscription. Downloads a properly formatted Word doc with a references list. My formatting anxiety is gone.",
                name: "Sofia R.",
                role: "Undergraduate, McGill",
                stars: 5,
              },
              {
                quote: "It's not just swapping words — the sentences actually flow differently. Reads like something a real, thoughtful student wrote. Impressive.",
                name: "Daniel K.",
                role: "Masters student, SFU",
                stars: 5,
              },
              {
                quote: "I was skeptical at first. But the before/after score went from 79% to 14% on my lit review. I'm a convert.",
                name: "Aisha L.",
                role: "Research assistant, Waterloo",
                stars: 5,
              },
              {
                quote: "The deep humanization mode is another level. Different sentence structures, hedging language, contractions — it's genuinely hard to detect.",
                name: "Marcus W.",
                role: "Law student, Dalhousie",
                stars: 5,
              },
            ]).map((t, i) => (
              <div key={t.name} className={`card-hover reveal bg-white rounded-2xl border border-indigo-50 p-5 flex flex-col delay-${(i % 3) * 100}`}>
                <div className="flex items-center gap-0.5 mb-3">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed flex-1 italic">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-4 pt-4 border-t border-indigo-50">
                  <p className="text-sm font-semibold text-indigo-950">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing preview ──────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 reveal">
            <h2 className="text-4xl sm:text-5xl font-bold text-indigo-950 mb-4" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
              Simple, transparent pricing
            </h2>
            <p className="text-gray-500 text-lg">Start free. Upgrade when you need more.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 items-center">
            {([
              { name: "Free",    price: "CA$0",  words: "2,000 words/mo",  features: ["AI detection score", "Humanizer (Quick mode)", "3 saved documents"],                                                                              cta: "Start free",   href: "/sign-up",  hl: false, cls: "reveal-left  delay-0" },
              { name: "Pro",     price: "CA$19", period: "/mo", words: "50,000 words/mo", features: ["Everything in Free", "Unlimited history", "Reference finder", "Auto citation insertion", "APA 7 export", "Priority processing"], cta: "Get Pro",      href: "/pricing",  hl: true,  cls: "reveal-scale delay-100" },
              { name: "Scholar", price: "CA$39", period: "/mo", words: "Unlimited words", features: ["Everything in Pro", "Unlimited words", "Deep humanization mode", "API access"],                                                    cta: "Get Scholar",  href: "/pricing",  hl: false, cls: "reveal-right delay-200" },
            ] as const).map(t => (
              <div key={t.name} className={`${t.cls} rounded-2xl border p-6 flex flex-col ${t.hl ? "bg-indigo-600 border-indigo-500 shadow-2xl shadow-indigo-200 scale-105 glow-card" : "bg-white border-indigo-100 card-hover"}`}>
                <p className={`text-sm font-semibold mb-1 ${t.hl ? "text-indigo-200" : "text-gray-400"}`}>{t.name}</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className={`text-4xl font-bold ${t.hl ? "text-white" : "text-indigo-950"}`} style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>{t.price}</span>
                  {"period" in t && <span className={`text-sm ${t.hl ? "text-indigo-300" : "text-gray-400"}`}>{t.period}</span>}
                </div>
                <p className={`text-xs mb-4 ${t.hl ? "text-indigo-200" : "text-gray-400"}`}>{t.words}</p>
                <ul className="space-y-2 flex-1 mb-6">
                  {t.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle className={`w-4 h-4 flex-shrink-0 ${t.hl ? "text-amber-300" : "text-indigo-400"}`} />
                      <span className={t.hl ? "text-indigo-100" : "text-gray-600"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href={t.href} className={`btn-shine block text-center text-sm font-semibold py-3 rounded-xl transition-colors cursor-pointer ${t.hl ? "bg-white text-indigo-700 hover:bg-indigo-50" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}>
                  {t.cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 mt-6">All prices in CAD · 7-day money-back guarantee on paid plans</p>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/60 via-white to-violet-50/40 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-200/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative reveal">
          <div className="inline-flex items-center gap-1.5 mb-4">
            {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-indigo-950 mb-4" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
            Ready to write like a human?
          </h2>
          <p className="text-gray-500 text-lg mb-8 max-w-xl mx-auto">
            Join students using Quillify for natural, well-cited, properly formatted academic writing.
          </p>
          <Link href="/sign-up" className="btn-shine inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-10 py-4 rounded-2xl text-base transition-all shadow-xl shadow-indigo-200 cursor-pointer animate-pulse-glow">
            Get started for free <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="mt-4 text-xs text-gray-400">Free tier available · No credit card required</p>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-indigo-50 bg-slate-50 py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <QuillifyLogo size={28} />
          <div className="flex items-center gap-6">
            <Link href="/pricing" className="text-xs text-gray-400 hover:text-indigo-600 transition-colors cursor-pointer">Pricing</Link>
            <Link href="/blog" className="text-xs text-gray-400 hover:text-indigo-600 transition-colors cursor-pointer">Blog</Link>
            <Link href="/sign-in" className="text-xs text-gray-400 hover:text-indigo-600 transition-colors cursor-pointer">Sign in</Link>
            <Link href="/app" className="text-xs text-gray-400 hover:text-indigo-600 transition-colors cursor-pointer">App</Link>
          </div>
          <p className="text-xs text-gray-300">&copy; 2025 Quillify · Deep Technologies Inc.</p>
        </div>
      </footer>
    </div>
  );
}

/* ── Animated stats banner ───────────────────────────────────── */
import { forwardRef } from "react";

const StatsBanner = forwardRef<HTMLDivElement, { visible: boolean }>(function StatsBanner({ visible }, ref) {
  const c1 = useCounter(3,    visible, 800);
  const c2 = useCounter(7,    visible, 1000);
  const c3 = useCounter(100,  visible, 1400);
  const c4 = useCounter(2026, visible, 1600);

  const stats = [
    { v: `${c1} engines`,    l: "Semantic Scholar, OpenAlex, arXiv" },
    { v: "APA 7",            l: "Fully formatted citations and references" },
    { v: `.docx`,            l: "Word export with structure preserved" },
    { v: "Claude AI",        l: "Powered by Anthropic models" },
  ];

  return (
    <section ref={ref} className="bg-indigo-950 py-10 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(99,102,241,0.15)_0%,_transparent_70%)] pointer-events-none" />
      <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {stats.map((s, i) => (
          <div key={s.l} className={`text-center reveal delay-${i * 100}`}>
            <p className="text-2xl sm:text-3xl font-bold text-amber-400" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>{s.v}</p>
            <p className="text-xs text-indigo-300 mt-1 leading-snug">{s.l}</p>
          </div>
        ))}
      </div>
    </section>
  );
});
