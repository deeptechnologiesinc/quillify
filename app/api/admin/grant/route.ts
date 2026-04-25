import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId || !isAdmin(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { targetUserId, plan } = await req.json();
  if (!targetUserId || !["free", "pro", "scholar"].includes(plan)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await prisma.subscription.upsert({
    where: { userId: targetUserId },
    create: { userId: targetUserId, plan, status: "active" },
    update: { plan, status: "active" },
  });

  return NextResponse.json({ ok: true });
}
