import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUserPlan, getMonthlyUsage, PLAN_LIMITS } from "@/lib/usage";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [plan, used, docs] = await Promise.all([
    getUserPlan(userId),
    getMonthlyUsage(userId),
    prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, title: true, wordCount: true, createdAt: true },
    }),
  ]);

  const raw = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
  const limit = raw === Infinity ? -1 : raw;
  return NextResponse.json({ plan, used, limit, docs });
}
