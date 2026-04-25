"use client";

import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";
import { ReferralTracker } from "@/components/ReferralTracker";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 flex items-center justify-center p-4">
      <Suspense fallback={null}>
        <ReferralTracker />
      </Suspense>
      <SignUp forceRedirectUrl="/app" />
    </div>
  );
}
