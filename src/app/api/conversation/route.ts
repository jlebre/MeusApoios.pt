import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const b = await req.json();
    const supabase = createServiceClient();
    const { error } = await supabase.from("conversation_requests").insert({
      name: b.name || null,
      email: b.email || null,
      phone: b.phone || null,
      preferred_time: b.preferred_time || null,
      topic: b.topic || null,
      project_id: b.project_id || null,
      status: "novo",
    });
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
}
