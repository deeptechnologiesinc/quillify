"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function ReferralTracker() {
  const params = useSearchParams();
  useEffect(() => {
    const ref = params.get("ref");
    if (ref && ref.startsWith("QLFY-")) {
      localStorage.setItem("qfy_ref", ref);
    }
  }, [params]);
  return null;
}
