import Link from "next/link";
import { createServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function Conversas() {
  const supabase = createServiceClient();
  const { data: reqs } = await supabase
    .from("conversation_requests")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link href="/admin" className="text-sm text-clay underline">
        ← Voltar
      </Link>
      <h1 className="mt-3 font-display text-3xl font-black text-soil">
        Pedidos de conversa
      </h1>
      <div className="mt-6 space-y-3">
        {(reqs ?? []).map((r) => (
          <div key={r.id} className="rounded-xl border border-clay/20 bg-white/60 p-5">
            <div className="flex items-center justify-between">
              <div className="font-display text-lg font-bold text-soil">
                {r.name || "Sem nome"}
              </div>
              <span className="rounded-full bg-olive/15 px-3 py-1 text-xs font-semibold text-olive">
                {r.preferred_time || "—"}
              </span>
            </div>
            <div className="mt-1 text-sm text-ink/70">
              {r.email} · {r.phone || "sem telefone"}
            </div>
            {r.topic && <p className="mt-2 text-sm text-ink/80">{r.topic}</p>}
            <div className="mt-2 text-xs text-ink/40">
              {new Date(r.created_at).toLocaleString("pt-PT")}
            </div>
          </div>
        ))}
        {(!reqs || reqs.length === 0) && (
          <div className="rounded-xl border border-dashed border-clay/30 p-8 text-center text-ink/50">
            Ainda não há pedidos de conversa.
          </div>
        )}
      </div>
    </main>
  );
}
