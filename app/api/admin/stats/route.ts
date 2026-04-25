import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export async function GET() {
  const { userId } = await auth();
  if (!userId || !isAdmin(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [
    totalDocs,
    wordsThisMonth,
    planCounts,
    recentDocs,
  ] = await Promise.all([
    prisma.document.count(),
    prisma.usage.aggregate({
      where: { month: currentMonth() },
      _sum: { words: true },
    }),
    prisma.subscription.groupBy({
      by: ["plan", "status"],
      _count: { _all: true },
    }),
    prisma.document.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, userId: true, title: true, wordCount: true, createdAt: true },
    }),
  ]);

  const activeSubs = planCounts.filter((r) => r.status === "active");
  const proCount = activeSubs.find((r) => r.plan === "pro")?._count._all ?? 0;
  const scholarCount = activeSubs.find((r) => r.plan === "scholar")?._count._all ?? 0;

  const uniqueUsers = await prisma.usage.findMany({
    distinct: ["userId"],
    select: { userId: true },
  });

  return NextResponse.json({
    totalUsers: uniqueUsers.length,
    proSubscribers: proCount,
    scholarSubscribers: scholarCount,
    wordsThisMonth: wordsThisMonth._sum.words ?? 0,
    totalDocuments: totalDocs,
    recentDocs,
  });
}
