import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseAdminServerClient } from "@/lib/supabase/supabase-server";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key);
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const applicationId = session.client_reference_id;

    if (!applicationId) {
      console.error("checkout.session.completed: missing client_reference_id");
      return NextResponse.json({ received: true });
    }

    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id ?? null;

    const supabase = await createSupabaseAdminServerClient();
    const { data: app } = await supabase
      .from("applications")
      .select("total_fee")
      .eq("id", applicationId)
      .single();

    const amountPaidCents =
      app?.total_fee != null ? Math.round((app.total_fee as number) * 100) : null;

    const { error } = await supabase
      .from("applications")
      .update({
        is_paid: true,
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id: paymentIntentId,
        amount_paid_cents: amountPaidCents,
      })
      .eq("id", applicationId);

    if (error) {
      console.error("Failed to update application after payment:", error);
      return NextResponse.json(
        { error: "Failed to update application" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
