"use client";

import Link from "next/link";
import { QuillifyLogo } from "@/components/QuillifyLogo";
import {
  ArrowRight, Sparkles, FileText, BookOpen, Download,
  CheckCircle, Star, Zap, Shield, ChevronRight, Menu, X,
} from "lucide-react";
import { useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";

function Navbar() {
  const [open, setOpen] = useState(false);
  const { isSignedIn } = useUser();
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-indigo-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <QuillifyLogo size={32} />
        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm text-gray-500 hover:text-indigo-700 transition-colors cursor-pointer">Features</Link>
          <Link href="#how-it-works" className="text-sm text-gray-500 hover:text-indigo-700 transition-colors cursor-pointer">How it works</Link>
          <Link href="/pricing" className="text-sm text-gray-500 hover:text-indigo-700 transition-colors cursor-pointer">Pricing</Link>
        </div>
        <div className="hidden md:flex items-center gap-3">
          {isSignedIn ? (
            <>
              <Link href="/app" className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl cursor-pointer shadow-sm transition-colors">Open App</Link>
              <UserButton />
            </>
          ) : (
            <>
              <Link href="/sign-in" className="text-sm font-semibold text-indigo-700 px-4 py-2 cursor-pointer hover:text-indigo-900 transition-colors">Sign in</Link>
              <Link href="/sign-up" className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl cursor-pointer shadow-sm transition-colors">Start free</Link>
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
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 text-center bg-gradient-to-b from-indigo-50/60 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Sparkles className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            AI Detection Score · Academic References · APA 7 Formatting
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-indigo-950 leading-tight tracking-tight mb-6" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
            Write Human.<span className="block text-indigo-600">Sound Real.</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed mb-10">
            Quillify transforms AI-written text into natural, academic-quality writing &mdash; then finds real citations,
            inserts them automatically, and exports a perfectly formatted Word document.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-4 rounded-2xl text-base transition-all shadow-lg shadow-indigo-200 cursor-pointer">
              Start for free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="#how-it-works" className="flex items-center gap-2 text-indigo-700 font-semibold px-6 py-4 rounded-2xl text-base hover:bg-indigo-50 transition-colors cursor-pointer">
              See how it works <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <p className="mt-5 text-xs text-gray-400">Free tier available &middot; No credit card required</p>
          {/* Mock UI */}
          <div className="mt-16 relative max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl shadow-indigo-100 border border-indigo-100 overflow-hidden text-left">
              <div className="bg-indigo-600 px-4 py-3 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="ml-2 text-xs text-indigo-200">quillify.io/app</span>
              </div>
              <div className="p-5 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-2">AI Detection Score</p>
                  <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
                    <p className="text-3xl font-bold text-red-500">87%</p>
                    <p className="text-xs text-red-400 mt-0.5">Likely AI-generated</p>
                  </div>
                  <div className="mt-3 space-y-1.5">
                    {["Uniform sentence length","Formal vocabulary","No hedging language"].map(i => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-2.5 py-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />{i}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-2">After Humanizing</p>
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
                    <p className="text-3xl font-bold text-emerald-500">12%</p>
                    <p className="text-xs text-emerald-600 mt-0.5">Sounds human</p>
                  </div>
                  <div className="mt-3 space-y-1.5">
                    {["Natural sentence variety","Everyday vocabulary","Personal hedging added"].map(i => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-2.5 py-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />{i}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -inset-4 bg-indigo-400/10 rounded-3xl blur-2xl -z-10" />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-indigo-950 py-8 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { v: "3 engines", l: "Semantic Scholar, OpenAlex, arXiv" },
            { v: "APA 7", l: "Fully formatted citations and references" },
            { v: ".docx", l: "Word export with structure preserved" },
            { v: "Claude AI", l: "Powered by Anthropic models" },
          ].map(s => (
            <div key={s.v} className="text-center">
              <p className="text-2xl font-bold text-amber-400" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>{s.v}</p>
              <p className="text-xs text-indigo-300 mt-1">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-indigo-950 mb-4" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>Everything a student needs</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">From rough AI draft to polished, cited, submission-ready paper in one workflow.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {([
              { icon: <Zap className="w-6 h-6 text-amber-500" />, title: "AI Detection Score", desc: "Score your text 0-100% for AI likelihood. See exactly which patterns are flagging your writing.", badge: "Before you humanize", bg: "bg-amber-50 border-amber-100" },
              { icon: <Sparkles className="w-6 h-6 text-indigo-500" />, title: "Smart Humanizer", desc: "Two-pass Claude AI rewrites your text with varied sentences, everyday words, and natural hedging.", badge: "Core feature", bg: "bg-indigo-50 border-indigo-100" },
              { icon: <BookOpen className="w-6 h-6 text-emerald-500" />, title: "Academic Reference Finder", desc: "Searches 3 databases simultaneously to find open-access papers supporting your specific claims.", badge: "3 search engines", bg: "bg-emerald-50 border-emerald-100" },
              { icon: <FileText className="w-6 h-6 text-violet-500" />, title: "Auto Citation Insertion", desc: "Select papers to cite. Quillify inserts APA 7 in-text citations at the right sentences automatically.", badge: "APA 7", bg: "bg-violet-50 border-violet-100" },
              { icon: <Shield className="w-6 h-6 text-blue-500" />, title: "Structure Preserved", desc: "Upload your Word file and tables, headings, and formatting survive the AI pipeline intact.", badge: "Upload .docx, .pdf", bg: "bg-blue-50 border-blue-100" },
              { icon: <Download className="w-6 h-6 text-rose-500" />, title: "One-Click APA Export", desc: "Make your document APA 7 compliant with one click then download as a Word file.", badge: "Export .docx", bg: "bg-rose-50 border-rose-100" },
            ] as const).map(f => (
              <div key={f.title} className={`rounded-2xl border p-6 ${f.bg}`}>
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

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 bg-gradient-to-b from-indigo-950 to-indigo-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>From draft to submission in 4 steps</h2>
            <p className="text-indigo-300 text-lg">No other tool takes you this far.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { n: "01", title: "Paste or upload your text", desc: "Drop in a .docx, .pdf, or .txt file or paste directly. Quillify extracts content while preserving tables and structure." },
              { n: "02", title: "Analyse and humanize", desc: "Get an AI detection score with a full breakdown. Hit Humanize for a two-pass Claude rewrite that sounds genuinely human." },
              { n: "03", title: "Find and insert citations", desc: "Quillify checks your existing citations. If gaps exist, it searches 3 academic databases and auto-inserts relevant ones." },
              { n: "04", title: "Format and download", desc: "One click for APA 7 compliance. Download as a properly formatted Word file ready for submission." },
            ].map(s => (
              <div key={s.n} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                <span className="text-5xl font-bold text-indigo-700/40" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>{s.n}</span>
                <h3 className="text-lg font-bold text-white mt-2 mb-2">{s.title}</h3>
                <p className="text-sm text-indigo-300 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="py-24 px-4 sm:px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-indigo-950 mb-4" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>Simple, transparent pricing</h2>
            <p className="text-gray-500 text-lg">Start free. Upgrade when you need more.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 items-center">
            {([
              { name: "Free", price: "CA$0", words: "2,000 words/mo", features: ["AI detection score", "Humanizer (Quick mode)", "3 saved documents"], cta: "Start free", href: "/sign-up", hl: false },
              { name: "Pro", price: "CA$19", period: "/mo", words: "50,000 words/mo", features: ["Everything in Free", "Unlimited history", "Reference finder", "Auto citation insertion", "APA 7 export", "Priority processing"], cta: "Get Pro", href: "/pricing", hl: true },
              { name: "Scholar", price: "CA$39", period: "/mo", words: "Unlimited words", features: ["Everything in Pro", "Unlimited words", "Deep humanization mode", "API access"], cta: "Get Scholar", href: "/pricing", hl: false },
            ] as const).map(t => (
              <div key={t.name} className={`rounded-2xl border p-6 flex flex-col ${t.hl ? "bg-indigo-600 border-indigo-500 shadow-2xl shadow-indigo-200 scale-105" : "bg-white border-indigo-100"}`}>
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
                <Link href={t.href} className={`block text-center text-sm font-semibold py-3 rounded-xl transition-colors cursor-pointer ${t.hl ? "bg-white text-indigo-700 hover:bg-indigo-50" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}>{t.cta}</Link>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 mt-6">All prices in CAD · 7-day money-back guarantee on paid plans</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 mb-4">
            {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-indigo-950 mb-4" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>Ready to write like a human?</h2>
          <p className="text-gray-500 text-lg mb-8 max-w-xl mx-auto">Join students using Quillify for natural, well-cited, properly formatted academic writing.</p>
          <Link href="/sign-up" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-10 py-4 rounded-2xl text-base transition-all shadow-lg shadow-indigo-200 cursor-pointer">
            Get started for free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-indigo-50 bg-slate-50 py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <QuillifyLogo size={28} />
          <div className="flex items-center gap-6">
            <Link href="/pricing" className="text-xs text-gray-400 hover:text-indigo-600 transition-colors cursor-pointer">Pricing</Link>
            <Link href="/sign-in" className="text-xs text-gray-400 hover:text-indigo-600 transition-colors cursor-pointer">Sign in</Link>
            <Link href="/app" className="text-xs text-gray-400 hover:text-indigo-600 transition-colors cursor-pointer">App</Link>
          </div>
          <p className="text-xs text-gray-300">&copy; 2025 Quillify &middot; Deep Technologies Inc.</p>
        </div>
      </footer>
    </div>
  );
}
