"use client";

import Link from "next/link";
import { QuillifyLogo } from "@/components/QuillifyLogo";
import { UserButton } from "@clerk/nextjs";
import { LayoutDashboard, Zap } from "lucide-react";
import { useEffect, useState } from "react";

function AppNav() {
  const [usage, setUsage] = useState<{ used: number; limit: number; plan: string } | null>(null);

  useEffect(() => {
    fetch("/api/usage")
      .then(r => r.json())
      .then(d => setUsage({ used: d.used, limit: d.limit, plan: d.plan }))
      .catch(() => {});
  }, []);

  const pct = usage && usage.limit !== -1 && usage.limit !== Infinity
    ? Math.min(100, Math.round((usage.used / usage.limit) * 100))
    : null;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-indigo-50 px-4 sm:px-6 h-14 flex items-center justify-between">
      <Link href="/"><QuillifyLogo size={28} /></Link>
      <div className="flex items-center gap-3">
        {usage && pct !== null && (
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${pct > 80 ? "bg-red-500" : pct > 60 ? "bg-amber-500" : "bg-indigo-500"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs text-gray-400">{usage.used.toLocaleString()} / {usage.limit === Infinity ? "∞" : usage.limit.toLocaleString()}</span>
          </div>
        )}
        {usage?.plan === "free" && (
          <Link href="/pricing" className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors cursor-pointer">
            <Zap className="w-3 h-3" /> Upgrade
          </Link>
        )}
        <Link href="/dashboard" className="p-2 text-gray-400 hover:text-indigo-600 transition-colors cursor-pointer" title="Dashboard">
          <LayoutDashboard className="w-4.5 h-4.5 w-[18px] h-[18px]" />
        </Link>
        <UserButton  />
      </div>
    </nav>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppNav />
      {children}
    </>
  );
}
