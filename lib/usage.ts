import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";

export const PLAN_LIMITS: Record<string, number> = {
  free: 2000,
  pro: 50000,
  scholar: Infinity,
};

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export async function getUserPlan(userId: string): Promise<string> {
  if (isAdmin(userId)) return "scholar";
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  return sub?.status === "active" ? (sub.plan ?? "free") : "free";
}

export async function getMonthlyUsage(userId: string): Promise<number> {
  const row = await prisma.usage.findUnique({
    where: { userId_month: { userId, month: currentMonth() } },
  });
  return row?.words ?? 0;
}

export async function checkAndDeductWords(
  userId: string,
  wordCount: number
): Promise<{ allowed: boolean; used: number; limit: number; plan: string }> {
  if (isAdmin(userId)) return { allowed: true, used: 0, limit: Infinity, plan: "scholar" };
  const plan = await getUserPlan(userId);
  const limit = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
  const used = await getMonthlyUsage(userId);

  if (limit !== Infinity && used + wordCount > limit) {
    return { allowed: false, used, limit, plan };
  }

  if (wordCount > 0) {
    await prisma.usage.upsert({
      where: { userId_month: { userId, month: currentMonth() } },
      create: { userId, month: currentMonth(), words: wordCount },
      update: { words: { increment: wordCount } },
    });
  }

  return { allowed: true, used: used + wordCount, limit, plan };
}

export async function saveDocument(
  userId: string,
  original: string,
  humanized: string | null,
  title?: string
): Promise<void> {
  if (isAdmin(userId)) {
    await prisma.document.create({
      data: { userId, original, humanized, wordCount: original.split(/\s+/).length, title: title ?? original.slice(0, 60) },
    });
    return;
  }
  const plan = await getUserPlan(userId);
  const maxDocs = plan === "free" ? 3 : 999999;

  if (plan === "free") {
    const count = await prisma.document.count({ where: { userId } });
    if (count >= maxDocs) {
      await prisma.document.deleteMany({
        where: {
          userId,
          id: {
            in: (
              await prisma.document.findMany({
                where: { userId },
                orderBy: { createdAt: "asc" },
                take: 1,
                select: { id: true },
              })
            ).map((d) => d.id),
          },
        },
      });
    }
  }

  await prisma.document.create({
    data: {
      userId,
      original,
      humanized,
      wordCount: original.split(/\s+/).length,
      title: title ?? original.slice(0, 60),
    },
  });
}
