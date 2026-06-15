import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("domains").select("id, slug, label").order("sort_order");
    return NextResponse.json({ domains: data ?? [] });
  } catch {
    return NextResponse.json({ domains: [] });
  }
}
