import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Devolve as perguntas para um domínio: transversais (shared) + do domínio,
// ordenadas por secção e ordem. O questionário monta-se a partir disto.
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("dominio");
    const supabase = createServiceClient();

    let domainId: string | null = null;
    if (slug) {
      const { data: dom } = await supabase
        .from("domains")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      domainId = dom?.id ?? null;
    }

    // perguntas transversais + as do domínio
    const { data: questions } = await supabase
      .from("questions")
      .select("*")
      .or(`shared.eq.true,domain_id.eq.${domainId ?? "00000000-0000-0000-0000-000000000000"}`)
      .order("section_order")
      .order("sort_order");

    return NextResponse.json({ questions: questions ?? [] });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ questions: [] });
  }
}
