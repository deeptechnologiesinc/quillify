import { auth, clerkClient } from "@clerk/nextjs/server";
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

  const [subscriptions, usageRows] = await Promise.all([
    prisma.subscription.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.usage.findMany({
      where: { month: currentMonth() },
      select: { userId: true, words: true },
    }),
  ]);

  // Collect all unique userIds
  const allUserIds = [...new Set([
    ...subscriptions.map((s) => s.userId),
    ...usageRows.map((u) => u.userId),
  ])];

  // Fetch Clerk user details
  let clerkUsers: Record<string, { email: string; name: string; imageUrl: string; createdAt: number }> = {};
  if (allUserIds.length > 0) {
    try {
      const client = await clerkClient();
      const result = await client.users.getUserList({ userId: allUserIds, limit: 100 });
      for (const u of result.data) {
        clerkUsers[u.id] = {
          email: u.emailAddresses[0]?.emailAddress ?? "—",
          name: [u.firstName, u.lastName].filter(Boolean).join(" ") || "—",
          imageUrl: u.imageUrl,
          createdAt: u.createdAt,
        };
      }
    } catch {
      // Clerk unavailable — continue without user details
    }
  }

  const usageMap = Object.fromEntries(usageRows.map((r) => [r.userId, r.words]));
  const subMap = Object.fromEntries(subscriptions.map((s) => [s.userId, s]));

  const users = allUserIds.map((uid) => {
    const sub = subMap[uid];
    const clerk = clerkUsers[uid];
    return {
      userId: uid,
      email: clerk?.email ?? "—",
      name: clerk?.name ?? "—",
      imageUrl: clerk?.imageUrl ?? null,
      plan: sub?.status === "active" ? (sub.plan ?? "free") : "free",
      wordsThisMonth: usageMap[uid] ?? 0,
      joinedAt: clerk?.createdAt ?? null,
    };
  });

  return NextResponse.json({ users });
}
