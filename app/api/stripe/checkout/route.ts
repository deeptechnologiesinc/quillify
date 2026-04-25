import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-04-22.dahlia" });

const PRICES: Record<string, string> = {
  "pro_monthly":      process.env.STRIPE_PRO_PRICE_ID!,
  "pro_annual":       process.env.STRIPE_PRO_ANNUAL_PRICE_ID!,
  "scholar_monthly":  process.env.STRIPE_SCHOLAR_PRICE_ID!,
  "scholar_annual":   process.env.STRIPE_SCHOLAR_ANNUAL_PRICE_ID!,
};

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.redirect(new URL("/sign-in", req.url));

  const plan   = req.nextUrl.searchParams.get("plan")   ?? "pro";
  const period = req.nextUrl.searchParams.get("period") ?? "monthly";
  const key    = `${plan}_${period}`;
  const priceId = PRICES[key];
  if (!priceId || priceId === "price_replace_me") {
    return NextResponse.json({ error: "Stripe not configured yet" }, { status: 503 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    currency: "cad",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard?upgraded=1`,
    cancel_url: `${appUrl}/pricing`,
    metadata: { userId, plan },
    subscription_data: { metadata: { userId, plan } },
  });

  return NextResponse.redirect(session.url!);
}
