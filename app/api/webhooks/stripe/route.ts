import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-04-22.dahlia" });

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan ?? "pro";
    if (userId) {
      await prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          stripeCustomerId: session.customer as string,
          stripeSubId: session.subscription as string,
          plan,
          status: "active",
        },
        update: {
          stripeCustomerId: session.customer as string,
          stripeSubId: session.subscription as string,
          plan,
          status: "active",
        },
      });
    }
  }

  if (
    event.type === "customer.subscription.deleted" ||
    event.type === "customer.subscription.updated"
  ) {
    const sub = event.data.object as Stripe.Subscription;
    const userId = sub.metadata?.userId;
    if (userId) {
      const plan =
        event.type === "customer.subscription.deleted"
          ? "free"
          : (sub.metadata?.plan ?? "pro");
      await prisma.subscription.updateMany({
        where: { userId },
        data: {
          plan,
          status: sub.status,
          currentPeriodEnd: null,
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
