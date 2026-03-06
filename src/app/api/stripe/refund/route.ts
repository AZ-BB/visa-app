import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseAdminServerClient } from "@/lib/supabase/supabase-server";
import { getUser } from "@/lib/get-user";
import { logApplicationActivity } from "@/lib/application-activity-log";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key);
}

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user?.admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const applicationId = body.applicationId as string | undefined;
    const amountCents = body.amountCents as number | undefined;

    if (!applicationId) {
      return NextResponse.json(
        { error: "Missing applicationId" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseAdminServerClient();
    const { data: application, error: appError } = await supabase
      .from("applications")
      .select("id, stripe_payment_intent_id, total_fee, amount_refunded_cents, is_paid")
      .eq("id", applicationId)
      .single();

    if (appError || !application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    if (!application.is_paid) {
      return NextResponse.json(
        { error: "Application has not been paid" },
        { status: 400 }
      );
    }

    const paymentIntentId = application.stripe_payment_intent_id as string | null;
    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "No payment intent linked to this application" },
        { status: 400 }
      );
    }

    const currentRefundedCents = (application.amount_refunded_cents as number) ?? 0;
    const totalCents = Math.round((application.total_fee as number) * 100);
    const maxRefundableCents = totalCents - currentRefundedCents;

    if (maxRefundableCents <= 0) {
      return NextResponse.json(
        { error: "Application is already fully refunded" },
        { status: 400 }
      );
    }

    const refundAmountCents = amountCents != null
      ? Math.min(amountCents, maxRefundableCents)
      : maxRefundableCents;

    if (refundAmountCents < 50) {
      return NextResponse.json(
        { error: "Amount too small for Stripe (minimum $0.50)" },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: refundAmountCents,
    });

    const newRefundedCents = currentRefundedCents + refundAmountCents;
    const { error: updateError } = await supabase
      .from("applications")
      .update({ amount_refunded_cents: newRefundedCents })
      .eq("id", applicationId);

    if (updateError) {
      console.error("Failed to update amount_refunded_cents:", updateError);
      return NextResponse.json(
        { error: "Refund processed but failed to update record" },
        { status: 500 }
      );
    }

    await logApplicationActivity({
      applicationId,
      actionType: "REFUNDED",
      actorId: user.admin.id,
      actorType: "admin",
      content: {
        amount_cents: refundAmountCents,
        total_refunded_cents: newRefundedCents,
      },
    });

    return NextResponse.json({
      success: true,
      refundedCents: refundAmountCents,
      totalRefundedCents: newRefundedCents,
    });
  } catch (err) {
    console.error("Stripe refund error:", err);
    return NextResponse.json(
      { error: "Failed to process refund" },
      { status: 500 }
    );
  }
}
