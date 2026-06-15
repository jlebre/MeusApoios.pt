import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = createServiceClient();
    // remove campos vazios de data para não enviar "" a colunas date
    if (body.closes_at === "" || body.closes_at == null) delete body.closes_at;
    body.updated_at = new Date().toISOString();

    const query = body.id
      ? supabase.from("funding_opportunities").update(body).eq("id", body.id)
      : supabase.from("funding_opportunities").insert(body);

    const { error } = await query;
    if (error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
}
