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
      .select("id, profile_id, stripe_checkout_session_id, is_paid")
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

    const sessionId = application.stripe_checkout_session_id as string | null;
    if (!sessionId || !application.is_paid) {
      return NextResponse.json(
        { error: "No payment session available for this application" },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["customer"],
    });

    const customerId =
      typeof session.customer === "string"
        ? session.customer
        : session.customer?.id;

    if (!customerId) {
      return NextResponse.json(
        { error: "No customer linked to this payment" },
        { status: 400 }
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (request.headers.get("origin") ?? "http://localhost:3000");

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${baseUrl}/applications/${applicationId}`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err) {
    console.error("Stripe customer-portal error:", err);
    return NextResponse.json(
      { error: "Failed to open customer portal" },
      { status: 500 }
    );
  }
}
