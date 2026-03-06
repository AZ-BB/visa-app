import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseServerClient } from "@/lib/supabase/supabase-server";
import { getUser } from "@/lib/get-user";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key);
}

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user?.profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const applicationId = body.applicationId as string | undefined;

    if (!applicationId) {
      return NextResponse.json(
        { error: "Missing applicationId" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    const { data: application, error: appError } = await supabase
      .from("applications")
      .select("id, profile_id, total_fee, is_paid")
      .eq("id", applicationId)
      .single();

    if (appError || !application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    if (application.profile_id !== user.profile.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (application.is_paid) {
      return NextResponse.json(
        { error: "Application already paid" },
        { status: 400 }
      );
    }

    const amountCents = Math.round((application.total_fee as number) * 100);
    if (amountCents < 50) {
      return NextResponse.json(
        { error: "Amount too small for Stripe (minimum $0.50)" },
        { status: 400 }
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (request.headers.get("origin") ?? "http://localhost:3000");

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Visa Application",
              description: "Visa application processing fee",
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      client_reference_id: applicationId,
      customer_email: user.authUser?.email ?? undefined,
      success_url: `${baseUrl}/applications/${applicationId}?payment=success`,
      cancel_url: `${baseUrl}/applications/${applicationId}?payment=cancelled`,
    });

    await supabase
      .from("applications")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", applicationId);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe create-checkout-session error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
