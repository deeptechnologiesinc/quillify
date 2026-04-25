"use client";

import Link from "next/link";
import { useState } from "react";
import { QuillifyLogo } from "@/components/QuillifyLogo";
import { CheckCircle, Zap, X } from "lucide-react";

const TIERS = [
  {
    name: "Free",
    monthly: { price: "CA$0", period: "", href: "/sign-up", billed: "" },
    annual:  { price: "CA$0", period: "", href: "/sign-up", billed: "" },
    words: "2,000 words/month",
    requestLimit: "500 words per request",
    features: [
      "AI detection score",
      "Humanizer — Quick mode",
      "3 saved documents",
      "Semantic Scholar search",
    ],
    notIncluded: [
      "Reference finder & citation insertion",
      "APA 7 export",
      "Document upload (.docx, .pdf)",
      "Unlimited history",
    ],
    cta: "Get started free",
    hl: false,
    badge: null,
  },
  {
    name: "Pro",
    monthly: { price: "CA$19", period: "/mo", href: "/api/stripe/checkout?plan=pro&period=monthly", billed: "Billed monthly" },
    annual:  { price: "CA$15", period: "/mo", href: "/api/stripe/checkout?plan=pro&period=annual",  billed: "CA$180 billed annually" },
    words: "50,000 words/month",
    requestLimit: "2,000 words per request",
    features: [
      "Everything in Free",
      "Humanizer — Quick & Balanced modes",
      "Unlimited document history",
      "Reference finder (3 engines)",
      "Auto citation insertion",
      "APA 7 formatting & export",
      "Document upload (.docx, .pdf)",
      "Priority Claude processing",
    ],
    notIncluded: [],
    cta: "Start Pro",
    hl: true,
    badge: "Most popular",
  },
  {
    name: "Scholar",
    monthly: { price: "CA$39", period: "/mo", href: "/api/stripe/checkout?plan=scholar&period=monthly", billed: "Billed monthly" },
    annual:  { price: "CA$31", period: "/mo", href: "/api/stripe/checkout?plan=scholar&period=annual",  billed: "CA$372 billed annually" },
    words: "Unlimited words",
    requestLimit: "Unlimited request size",
    features: [
      "Everything in Pro",
      "Humanizer — all 3 modes incl. Deep",
      "Unlimited words — no monthly cap",
      "API access (coming soon)",
      "Priority support",
    ],
    notIncluded: [],
    cta: "Start Scholar",
    hl: false,
    badge: "Best value",
  },
] as const;

const FAQS = [
  { q: "What counts as a word?", a: "We count words in the text you submit for humanization, analysis, or APA formatting. Searching for references does not consume your word quota." },
  { q: "Can I upgrade or downgrade at any time?", a: "Yes. Upgrades take effect immediately. Downgrades apply at the end of your current billing period." },
  { q: "Is there a free trial for paid plans?", a: "All paid plans include a 7-day money-back guarantee. If you are not satisfied, contact us within 7 days for a full refund — no questions asked." },
  { q: "What payment methods do you accept?", a: "We accept all major credit and debit cards through Stripe. Payments are processed securely — we never store your card details." },
  { q: "Do you store my documents?", a: "Pro and Scholar plans save your document history so you can return to previous work. Free tier stores up to 3 documents. You can delete your history at any time from your dashboard." },
  { q: "Why are prices in CAD?", a: "Quillify is proudly built by Deep Technologies Inc., a Canadian company based in British Columbia. All prices are in Canadian dollars." },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-indigo-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/"><QuillifyLogo size={30} showByline /></Link>
          <div className="flex items-center gap-4">
            <Link href="/sign-in" className="text-sm font-semibold text-indigo-700 px-4 py-2 cursor-pointer hover:text-indigo-900 transition-colors">Sign in</Link>
            <Link href="/sign-up" className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl cursor-pointer shadow-sm transition-colors">Start free</Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-32 pb-10 px-4 sm:px-6 text-center bg-gradient-to-b from-indigo-50/60 to-white">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Zap className="w-3.5 h-3.5" />
            7-day money-back guarantee on all paid plans
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-indigo-950 mb-4" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
            Simple, transparent pricing
          </h1>
          <p className="text-gray-500 text-lg mb-2">Start free. Upgrade when you need the full academic writing suite.</p>
          <p className="text-xs text-gray-400 mb-8">All prices in Canadian dollars (CAD) &middot; Proudly Canadian</p>

          {/* Annual / Monthly toggle */}
          <div className="inline-flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl p-1.5">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${!annual ? "bg-white shadow-sm text-indigo-700" : "text-gray-400 hover:text-gray-600"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${annual ? "bg-white shadow-sm text-indigo-700" : "text-gray-400 hover:text-gray-600"}`}
            >
              Annual
              <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">Save 20%</span>
            </button>
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="pb-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6 items-start">
          {TIERS.map(t => {
            const pricing = annual ? t.annual : t.monthly;
            return (
              <div key={t.name} className={`rounded-2xl border p-6 flex flex-col relative ${t.hl ? "bg-indigo-600 border-indigo-500 shadow-2xl shadow-indigo-200" : "bg-white border-indigo-100"}`}>
                {t.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">{t.badge}</div>
                )}
                <div className="mb-6">
                  <p className={`text-sm font-semibold mb-1 ${t.hl ? "text-indigo-200" : "text-gray-400"}`}>{t.name}</p>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className={`text-5xl font-bold ${t.hl ? "text-white" : "text-indigo-950"}`} style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>{pricing.price}</span>
                    {pricing.period && <span className={`text-sm ${t.hl ? "text-indigo-300" : "text-gray-400"}`}>{pricing.period}</span>}
                  </div>
                  <p className={`text-xs ${t.hl ? "text-indigo-200" : "text-gray-400"}`}>{t.words}</p>
                  <p className={`text-xs mt-0.5 ${t.hl ? "text-indigo-300" : "text-gray-300"}`}>{t.requestLimit}</p>
                  {pricing.billed && (
                    <p className={`text-xs mt-1.5 font-medium ${t.hl ? "text-amber-300" : "text-indigo-500"}`}>{pricing.billed}</p>
                  )}
                  {annual && t.name !== "Free" && (
                    <p className={`text-xs mt-0.5 ${t.hl ? "text-emerald-300" : "text-emerald-600"}`}>
                      You save {t.name === "Pro" ? "CA$48" : "CA$96"}/year
                    </p>
                  )}
                </div>
                <ul className="space-y-2 flex-1 mb-6">
                  {t.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${t.hl ? "text-amber-300" : "text-indigo-500"}`} />
                      <span className={t.hl ? "text-indigo-100" : "text-gray-700"}>{f}</span>
                    </li>
                  ))}
                  {t.notIncluded.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm opacity-40">
                      <X className={`w-4 h-4 flex-shrink-0 mt-0.5 ${t.hl ? "text-indigo-300" : "text-gray-400"}`} />
                      <span className={t.hl ? "text-indigo-300" : "text-gray-400"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={pricing.href}
                  className={`block text-center text-sm font-semibold py-3.5 rounded-xl transition-colors cursor-pointer ${t.hl ? "bg-white text-indigo-700 hover:bg-indigo-50" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}
                >
                  {t.cta}
                </Link>
              </div>
            );
          })}
        </div>
        <p className="text-center text-xs text-gray-400 mt-8">Secure payments via Stripe &middot; Cancel anytime &middot; 7-day money-back guarantee</p>
      </section>

      {/* Compare table */}
      <section className="py-16 px-4 sm:px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-indigo-950 mb-8 text-center" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>Full feature comparison</h2>
          <div className="bg-white rounded-2xl border border-indigo-50 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-indigo-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-1/2">Feature</th>
                  <th className="text-center px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Free</th>
                  <th className="text-center px-3 py-3 text-xs font-semibold text-indigo-600 uppercase tracking-wider bg-indigo-50/60">Pro</th>
                  <th className="text-center px-3 py-3 text-xs font-semibold text-violet-600 uppercase tracking-wider">Scholar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  ["Words per month",           "2,000",    "50,000",    "Unlimited"],
                  ["AI detection score",         "✓",        "✓",         "✓"],
                  ["Humanizer — Quick mode",     "✓",        "✓",         "✓"],
                  ["Humanizer — Balanced mode",  "—",        "✓",         "✓"],
                  ["Humanizer — Deep mode",      "—",        "—",         "✓"],
                  ["Document upload (.docx/.pdf)","—",       "✓",         "✓"],
                  ["Reference finder (3 engines)","—",       "✓",         "✓"],
                  ["Auto citation insertion",    "—",        "✓",         "✓"],
                  ["APA 7 formatting & export",  "—",        "✓",         "✓"],
                  ["Document history",           "3 docs",   "Unlimited", "Unlimited"],
                  ["Priority processing",        "—",        "✓",         "✓"],
                  ["API access",                 "—",        "—",         "Soon"],
                  ["Priority support",           "—",        "—",         "✓"],
                ].map(([feat, free, pro, scholar]) => (
                  <tr key={feat} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3 text-gray-700 font-medium">{feat}</td>
                    <td className="px-3 py-3 text-center text-gray-400">{free}</td>
                    <td className="px-3 py-3 text-center text-indigo-700 font-semibold bg-indigo-50/30">{pro}</td>
                    <td className="px-3 py-3 text-center text-violet-700 font-semibold">{scholar}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-indigo-950 mb-10 text-center" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>Frequently asked questions</h2>
          <div className="space-y-4">
            {FAQS.map(f => (
              <div key={f.q} className="bg-slate-50 rounded-2xl border border-indigo-50 px-6 py-5">
                <p className="text-sm font-bold text-indigo-950 mb-2">{f.q}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 bg-indigo-950">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>Start writing like a human today</h2>
          <p className="text-indigo-300 mb-7 text-sm">Free plan available &middot; No credit card required</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/sign-up" className="w-full sm:w-auto text-center bg-white text-indigo-700 hover:bg-indigo-50 font-semibold px-8 py-3.5 rounded-xl transition-colors cursor-pointer text-sm">
              Get started free
            </Link>
            <Link href="/sign-up" className="w-full sm:w-auto text-center bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors cursor-pointer text-sm border border-indigo-500">
              Start Pro — CA${annual ? "15" : "19"}/mo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-indigo-50 bg-white py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/"><QuillifyLogo size={26} /></Link>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xs text-gray-400 hover:text-indigo-600 cursor-pointer transition-colors">Home</Link>
            <Link href="/sign-in" className="text-xs text-gray-400 hover:text-indigo-600 cursor-pointer transition-colors">Sign in</Link>
            <Link href="/app" className="text-xs text-gray-400 hover:text-indigo-600 cursor-pointer transition-colors">App</Link>
          </div>
          <p className="text-xs text-gray-300">&copy; 2025 Quillify &middot; Deep Technologies Inc. &middot; Vancouver, BC</p>
        </div>
      </footer>
    </div>
  );
}
