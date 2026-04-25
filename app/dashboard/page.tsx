"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { QuillifyLogo } from "@/components/QuillifyLogo";
import { UserButton } from "@clerk/nextjs";
import { FileText, Zap, ArrowRight, Clock, ChevronRight, Copy, Check, Gift } from "lucide-react";

interface Doc { id: string; title: string; wordCount: number; createdAt: string; }
interface UsageData { plan: string; used: number; limit: number; bonusWords: number; docs: Doc[]; }
interface ReferralData { code: string; bonusWords: number; referralCount: number; }

function UsageMeter({ used, limit, plan }: { used: number; limit: number; plan: string }) {
  const pct = limit === -1 ? 0 : Math.min(100, Math.round((used / limit) * 100));
  const color = pct > 80 ? "bg-red-500" : pct > 60 ? "bg-amber-500" : "bg-indigo-500";
  return (
    <div className="bg-white rounded-2xl border border-indigo-100 p-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Monthly Usage</p>
          <p className="text-2xl font-bold text-indigo-950 mt-0.5" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
            {limit === -1 ? "Unlimited" : `${used.toLocaleString()} / ${limit.toLocaleString()}`}
            <span className="text-sm font-normal text-gray-400 ml-1">words</span>
          </p>
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${
          plan === "scholar" ? "bg-violet-100 text-violet-700" :
          plan === "pro" ? "bg-indigo-100 text-indigo-700" :
          "bg-gray-100 text-gray-600"
        }`}>{plan}</span>
      </div>
      {limit !== -1 && (
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
        </div>
      )}
      {plan === "free" && (
        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-gray-400">{limit - used} words remaining this month</p>
          <Link href="/pricing" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer">
            Upgrade <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      )}
    </div>
  );
}

function ReferralWidget() {
  const [ref, setRef] = useState<ReferralData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/referral").then(r => r.json()).then(setRef).catch(() => {});
  }, []);

  const link = ref ? `${typeof window !== "undefined" ? window.location.origin : ""}/sign-up?ref=${ref.code}` : "";

  const handleCopy = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!ref) return null;
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl border border-indigo-100 p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 bg-indigo-100 rounded-xl">
          <Gift className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-indigo-950">Refer friends, earn words</p>
          <p className="text-xs text-gray-500 mt-0.5">You get <strong>500 bonus words</strong> for every friend who signs up with your link.</p>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-white border border-indigo-100 rounded-xl px-3 py-2.5 mb-4">
        <code className="text-xs text-indigo-700 flex-1 truncate font-mono">{link}</code>
        <button
          onClick={handleCopy}
          className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      <div className="flex items-center gap-6">
        <div>
          <p className="text-xl font-bold text-indigo-950" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>{ref.referralCount}</p>
          <p className="text-xs text-gray-400">Friends referred</p>
        </div>
        <div className="w-px h-8 bg-indigo-100" />
        <div>
          <p className="text-xl font-bold text-indigo-950" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>{ref.bonusWords.toLocaleString()}</p>
          <p className="text-xs text-gray-400">Bonus words earned</p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/usage")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Nav */}
      <nav className="bg-white border-b border-indigo-50 px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/"><QuillifyLogo size={30} showByline /></Link>
        <div className="flex items-center gap-4">
          <Link href="/app" className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl cursor-pointer transition-colors">
            Open Editor
          </Link>
          <UserButton />
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-bold text-indigo-950 mb-8" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>Dashboard</h1>

        {loading ? (
          <div className="flex items-center gap-3 text-gray-400">
            <div className="w-5 h-5 border-2 border-indigo-300 border-t-transparent rounded-full animate-spin" />
            Loading your data...
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Usage meter */}
            <UsageMeter used={data.used} limit={data.limit === Infinity ? -1 : data.limit} plan={data.plan} />

            {/* Quick actions */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Link href="/app" className="group bg-indigo-600 hover:bg-indigo-700 rounded-2xl p-5 flex items-center justify-between transition-colors cursor-pointer">
                <div>
                  <p className="text-sm font-bold text-white">Start new document</p>
                  <p className="text-xs text-indigo-200 mt-0.5">Paste text or upload a file</p>
                </div>
                <ArrowRight className="w-5 h-5 text-indigo-200 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/pricing" className="group bg-white border border-indigo-100 rounded-2xl p-5 flex items-center justify-between hover:border-indigo-300 transition-colors cursor-pointer">
                <div>
                  <p className="text-sm font-bold text-indigo-950">Manage subscription</p>
                  <p className="text-xs text-gray-400 mt-0.5">View plans, billing, upgrade</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 transition-colors" />
              </Link>
            </div>

            {/* Document history */}
            <div className="bg-white rounded-2xl border border-indigo-100">
              <div className="px-6 py-4 border-b border-indigo-50 flex items-center justify-between">
                <p className="text-sm font-bold text-indigo-950">Recent documents</p>
                <Zap className="w-4 h-4 text-indigo-300" />
              </div>
              {data.docs.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <FileText className="w-8 h-8 text-indigo-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">No documents yet.</p>
                  <Link href="/app" className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer">
                    Create your first <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-indigo-50">
                  {data.docs.map(doc => (
                    <div key={doc.id} className="px-6 py-4 flex items-center justify-between hover:bg-indigo-50/30 transition-colors">
                      <div className="flex items-start gap-3 min-w-0">
                        <FileText className="w-4 h-4 text-indigo-300 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-indigo-950 truncate">{doc.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Clock className="w-3 h-3 text-gray-300" />
                            <p className="text-xs text-gray-400">{new Date(doc.createdAt).toLocaleDateString()}</p>
                            <span className="text-gray-200">·</span>
                            <p className="text-xs text-gray-400">{doc.wordCount.toLocaleString()} words</p>
                          </div>
                        </div>
                      </div>
                      <Link href="/app" className="flex-shrink-0 text-xs font-semibold text-indigo-500 hover:text-indigo-700 cursor-pointer ml-4">
                        Open
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Referral program */}
            <ReferralWidget />

            {data.plan === "free" && (
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-white">Unlock the full academic writing suite</p>
                  <p className="text-xs text-indigo-200 mt-1">References, citation insertion, APA 7 export, unlimited history — from $9/mo</p>
                </div>
                <Link href="/pricing" className="flex-shrink-0 bg-white text-indigo-700 hover:bg-indigo-50 text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap">
                  See plans
                </Link>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-400">Could not load dashboard. Please refresh.</p>
        )}
      </div>
    </div>
  );
}
