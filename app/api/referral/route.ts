import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function makeCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "QLFY-";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get or create referral code on the Subscription
  let sub = await prisma.subscription.findUnique({ where: { userId } });
  if (!sub) {
    sub = await prisma.subscription.create({ data: { userId, plan: "free", status: "active" } });
  }
  if (!sub.referralCode) {
    let code = makeCode();
    // Ensure uniqueness
    while (await prisma.subscription.findUnique({ where: { referralCode: code } })) {
      code = makeCode();
    }
    sub = await prisma.subscription.update({ where: { userId }, data: { referralCode: code } });
  }

  const referrals = await prisma.referral.findMany({ where: { referrerId: userId } });
  return NextResponse.json({
    code: sub.referralCode,
    bonusWords: sub.bonusWords ?? 0,
    referralCount: referrals.length,
  });
}
