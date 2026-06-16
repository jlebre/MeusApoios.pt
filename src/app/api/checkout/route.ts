import { NextResponse } from "next/server";
import Stripe from "stripe";
import { BRAND } from "@/lib/brand";

// Cria uma sessão de checkout Stripe para desbloquear um diagnóstico.
// Precisa de STRIPE_SECRET_KEY e NEXT_PUBLIC_BASE_URL no .env.local.
export async function POST(req: Request) {
  try {
    const { project_id } = await req.json();
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      return NextResponse.json({ error: "stripe_not_configured" }, { status: 503 });
    }
    const stripe = new Stripe(key);
    const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: `${BRAND.name} — Relatório completo` },
            unit_amount: 1900, // 19,00 €
          },
          quantity: 1,
        },
      ],
      metadata: { project_id },
      success_url: `${base}/resultado/${project_id}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/resultado/${project_id}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: "checkout_failed" }, { status: 500 });
  }
}
