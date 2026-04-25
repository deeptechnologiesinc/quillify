import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { code } = await req.json();
  if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 });

  // Find the referrer
  const referrerSub = await prisma.subscription.findUnique({ where: { referralCode: code } });
  if (!referrerSub) return NextResponse.json({ error: "Invalid code" }, { status: 404 });

  // Don't let users refer themselves
  if (referrerSub.userId === userId) return NextResponse.json({ error: "Cannot use own code" }, { status: 400 });

  // Check if already claimed
  const existing = await prisma.referral.findUnique({ where: { refereeId: userId } });
  if (existing) return NextResponse.json({ error: "Already claimed" }, { status: 400 });

  // Create referral record + credit referrer 500 bonus words
  await prisma.$transaction([
    prisma.referral.create({ data: { code, referrerId: referrerSub.userId, refereeId: userId } }),
    prisma.subscription.update({ where: { userId: referrerSub.userId }, data: { bonusWords: { increment: 500 } } }),
  ]);

  return NextResponse.json({ ok: true });
}
