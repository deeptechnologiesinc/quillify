import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUserPlan, getMonthlyUsage, PLAN_LIMITS } from "@/lib/usage";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [{ plan, bonusWords }, used, docs] = await Promise.all([
    getUserPlan(userId),
    getMonthlyUsage(userId),
    prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, title: true, wordCount: true, createdAt: true },
    }),
  ]);

  const baseLimit = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
  const raw = baseLimit === Infinity ? -1 : baseLimit + bonusWords;
  return NextResponse.json({ plan, used, limit: raw, bonusWords, docs });
}
