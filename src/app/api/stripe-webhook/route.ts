import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase";

// Webhook do Stripe: quando um pagamento é confirmado, desbloqueia o projeto.
// Configura no painel Stripe (Developers > Webhooks) a apontar para
// https://o-teu-dominio/api/stripe-webhook e mete STRIPE_WEBHOOK_SECRET.
export async function POST(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY;
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!key || !whSecret) {
    return NextResponse.json({ error: "stripe_not_configured" }, { status: 503 });
  }
  const stripe = new Stripe(key);

  let event: Stripe.Event;
  try {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature")!;
    event = stripe.webhooks.constructEvent(body, sig, whSecret);
  } catch (err) {
    console.error("Webhook signature failed", err);
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const projectId = session.metadata?.project_id;
    if (projectId) {
      const supabase = createServiceClient();
      await supabase
        .from("projects")
        .update({ unlocked: true, unlocked_at: new Date().toISOString() })
        .eq("id", projectId);
    }
  }

  return NextResponse.json({ received: true });
}
