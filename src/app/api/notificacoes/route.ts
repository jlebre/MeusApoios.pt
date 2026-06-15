import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

// Regista uma subscrição de notificação (avisar quando abre um aviso).
export async function POST(req: Request) {
  try {
    const b = await req.json();
    if (!b.email) {
      return NextResponse.json({ error: "email_required" }, { status: 400 });
    }
    const supabase = createServiceClient();

    let domainId: string | null = null;
    if (b.dominio) {
      const { data: dom } = await supabase
        .from("domains").select("id").eq("slug", b.dominio).maybeSingle();
      domainId = dom?.id ?? null;
    }

    const { error } = await supabase.from("notification_subscriptions").insert({
      email: b.email,
      domain_id: domainId,
      location_district: b.location_district || null,
      active: true,
    });
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
}
