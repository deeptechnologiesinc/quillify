"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { QuillifyLogo } from "@/components/QuillifyLogo";
import {
  Users, FileText, Zap, TrendingUp, Shield, Crown, BookOpen,
  ChevronDown, AlertTriangle, RefreshCw,
} from "lucide-react";

type Stats = {
  totalUsers: number;
  proSubscribers: number;
  scholarSubscribers: number;
  wordsThisMonth: number;
  totalDocuments: number;
  recentDocs: { id: string; userId: string; title: string | null; wordCount: number; createdAt: string }[];
};

type User = {
  userId: string;
  email: string;
  name: string;
  imageUrl: string | null;
  plan: string;
  wordsThisMonth: number;
  joinedAt: number | null;
};

const PLAN_COLORS: Record<string, string> = {
  free:    "bg-gray-100 text-gray-600",
  pro:     "bg-indigo-100 text-indigo-700",
  scholar: "bg-violet-100 text-violet-700",
};

const PLAN_ICONS: Record<string, React.ReactNode> = {
  free:    <Zap className="w-3 h-3" />,
  pro:     <Crown className="w-3 h-3" />,
  scholar: <BookOpen className="w-3 h-3" />,
};

export default function AdminPage() {
  const { user, isLoaded } = useUser();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [grantTarget, setGrantTarget] = useState<User | null>(null);
  const [grantPlan, setGrantPlan] = useState("pro");
  const [granting, setGranting] = useState(false);
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    const [sRes, uRes] = await Promise.all([
      fetch("/api/admin/stats"),
      fetch("/api/admin/users"),
    ]);
    if (sRes.status === 403 || uRes.status === 403) {
      setForbidden(true);
      setLoading(false);
      return;
    }
    const [sData, uData] = await Promise.all([sRes.json(), uRes.json()]);
    setStats(sData);
    setUsers(uData.users ?? []);
    setLoading(false);
  }

  useEffect(() => { if (isLoaded) load(); }, [isLoaded]);

  async function handleGrant() {
    if (!grantTarget) return;
    setGranting(true);
    await fetch("/api/admin/grant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId: grantTarget.userId, plan: grantPlan }),
    });
    setGranting(false);
    setGrantTarget(null);
    load();
  }

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.userId.toLowerCase().includes(search.toLowerCase())
  );

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-indigo-600">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">Loading admin panel…</span>
        </div>
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-red-100 p-8 max-w-md w-full text-center">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-sm text-gray-500 mb-4">
            Your user ID is not in <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">ADMIN_USER_IDS</code>.
          </p>
          {user && (
            <div className="bg-slate-50 rounded-xl px-4 py-3 text-left mb-4">
              <p className="text-xs text-gray-400 mb-1">Your Clerk user ID:</p>
              <code className="text-xs font-mono text-indigo-700 break-all">{user.id}</code>
            </div>
          )}
          <p className="text-xs text-gray-400">
            Add this ID to <code className="bg-gray-100 px-1 rounded">ADMIN_USER_IDS</code> in Vercel env vars, then redeploy.
          </p>
          <Link href="/app" className="mt-5 inline-block text-sm text-indigo-600 hover:text-indigo-800 font-medium">
            ← Back to app
          </Link>
        </div>
      </div>
    );
  }

  const freeUsers = users.filter((u) => u.plan === "free").length;

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white border-b border-indigo-50 px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/"><QuillifyLogo size={26} showByline /></Link>
          <span className="flex items-center gap-1.5 bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold px-2.5 py-1 rounded-full">
            <Shield className="w-3 h-3" /> Admin
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={load} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 cursor-pointer transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <Link href="/app" className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-xl cursor-pointer transition-colors">
            Open App
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-indigo-950" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
            Admin Panel
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Signed in as {user?.primaryEmailAddress?.emailAddress}</p>
        </div>

        {/* Stats cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[
              { label: "Total Users",       value: stats.totalUsers,        icon: <Users className="w-4 h-4" />,      color: "text-indigo-600",  bg: "bg-indigo-50" },
              { label: "Free",              value: freeUsers,               icon: <Zap className="w-4 h-4" />,        color: "text-gray-600",    bg: "bg-gray-50" },
              { label: "Pro Subscribers",   value: stats.proSubscribers,    icon: <Crown className="w-4 h-4" />,      color: "text-indigo-600",  bg: "bg-indigo-50" },
              { label: "Scholar",           value: stats.scholarSubscribers,icon: <BookOpen className="w-4 h-4" />,   color: "text-violet-600",  bg: "bg-violet-50" },
              { label: "Words This Month",  value: stats.wordsThisMonth.toLocaleString(), icon: <TrendingUp className="w-4 h-4" />, color: "text-emerald-600", bg: "bg-emerald-50" },
            ].map((card) => (
              <div key={card.label} className="bg-white rounded-2xl border border-indigo-50 p-4">
                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-xl ${card.bg} ${card.color} mb-3`}>
                  {card.icon}
                </div>
                <p className="text-2xl font-bold text-indigo-950">{card.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{card.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Users table */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-indigo-50 overflow-hidden">
            <div className="px-5 py-4 border-b border-indigo-50 flex items-center justify-between gap-3">
              <h2 className="font-semibold text-indigo-950 text-sm">Users</h2>
              <input
                type="text"
                placeholder="Search by email or name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-xs border border-gray-200 rounded-xl px-3 py-1.5 outline-none focus:border-indigo-400 w-52"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Plan</th>
                    <th className="text-right px-3 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Words/mo</th>
                    <th className="px-3 py-2.5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-sm text-gray-400">
                        {search ? "No matching users" : "No users yet"}
                      </td>
                    </tr>
                  )}
                  {filtered.map((u) => (
                    <tr key={u.userId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          {u.imageUrl ? (
                            <img src={u.imageUrl} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-indigo-600">{(u.name[0] || u.email[0] || "?").toUpperCase()}</span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-gray-900 truncate">{u.name !== "—" ? u.name : u.email}</p>
                            <p className="text-xs text-gray-400 truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${PLAN_COLORS[u.plan] ?? PLAN_COLORS.free}`}>
                          {PLAN_ICONS[u.plan]}
                          {u.plan.charAt(0).toUpperCase() + u.plan.slice(1)}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right text-xs text-gray-600 tabular-nums">
                        {u.wordsThisMonth.toLocaleString()}
                      </td>
                      <td className="px-3 py-3">
                        <button
                          onClick={() => { setGrantTarget(u); setGrantPlan(u.plan === "pro" ? "scholar" : "pro"); }}
                          className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer transition-colors whitespace-nowrap"
                        >
                          Grant plan <ChevronDown className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent documents */}
          <div className="bg-white rounded-2xl border border-indigo-50 overflow-hidden">
            <div className="px-5 py-4 border-b border-indigo-50">
              <h2 className="font-semibold text-indigo-950 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" /> Recent Documents
              </h2>
            </div>
            <div className="divide-y divide-gray-50">
              {(stats?.recentDocs ?? []).length === 0 && (
                <p className="px-5 py-8 text-center text-sm text-gray-400">No documents yet</p>
              )}
              {(stats?.recentDocs ?? []).map((doc) => (
                <div key={doc.id} className="px-5 py-3">
                  <p className="text-xs font-medium text-gray-800 truncate">{doc.title ?? "Untitled"}</p>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-gray-400 font-mono truncate max-w-[120px]">{doc.userId.slice(0, 16)}…</p>
                    <p className="text-xs text-gray-400">{doc.wordCount.toLocaleString()} w</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grant plan modal */}
      {grantTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setGrantTarget(null)}>
          <div className="bg-white rounded-2xl border border-indigo-50 shadow-xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-indigo-950 mb-1">Grant Plan</h3>
            <p className="text-xs text-gray-400 mb-4">
              {grantTarget.email} · currently <span className="font-semibold text-indigo-600">{grantTarget.plan}</span>
            </p>
            <div className="grid grid-cols-3 gap-2 mb-5">
              {(["free", "pro", "scholar"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setGrantPlan(p)}
                  className={`py-2.5 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                    grantPlan === p
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setGrantTarget(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-500 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGrant}
                disabled={granting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer transition-colors disabled:opacity-60"
              >
                {granting ? "Saving…" : "Apply"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
