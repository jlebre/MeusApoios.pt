import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { id, status } = await req.json();
    const supabase = createServiceClient();
    const { error } = await supabase
      .from("projects")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
}
