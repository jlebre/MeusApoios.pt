"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Ingestao() {
  const [text, setText] = useState("");
  const [dominio, setDominio] = useState("");
  const [domains, setDomains] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/domains").then((r) => r.json()).then((d) => setDomains(d.domains || []));
  }, []);

  async function processar() {
    setLoading(true);
    setError("");
    setResult(null);
    const res = await fetch("/api/ingest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source_text: text, dominio }),
    });
    setLoading(false);
    const data = await res.json();
    if (res.ok) {
      setResult(data);
    } else {
      setError(
        data.error === "ia_nao_configurada"
          ? "A IA não está configurada. Define ANTHROPIC_API_KEY no .env.local."
          : data.error === "json_invalido"
          ? "A IA não devolveu dados válidos. Tenta colar menos texto ou mais estruturado."
          : "Erro a processar: " + (data.error || "desconhecido")
      );
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link href="/admin" className="text-sm text-clay underline">← Voltar</Link>
      <h1 className="mt-3 font-display text-3xl font-black text-soil">
        Ingestão de aviso por IA
      </h1>
      <p className="mt-2 text-ink/70">
        Cola o texto de um aviso oficial. A IA estrutura tudo e cria um fundo em
        <strong> rascunho</strong>. Revês e publicas em "Gerir fundos".
      </p>

      <div className="mt-6 space-y-4">
        <label className="block">
          <span className="field-label">Área</span>
          <select className="field-input" value={dominio} onChange={(e) => setDominio(e.target.value)}>
            <option value="">Sem área específica</option>
            {domains.map((d) => <option key={d.id} value={d.slug}>{d.label}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="field-label">Texto do aviso</span>
          <textarea
            className="field-input min-h-[260px] font-mono text-sm"
            placeholder="Cola aqui o texto do aviso oficial (do PDF ou da página)…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </label>
        {error && <p className="text-sm font-medium text-red-700">{error}</p>}
        <button className="btn-primary" disabled={loading || text.length < 50} onClick={processar}>
          {loading ? "A IA está a ler o aviso…" : "Processar com IA"}
        </button>
      </div>

      {result && (
        <div className="mt-8 rounded-2xl border border-olive/40 bg-olive/10 p-6">
          <h2 className="font-display text-xl font-bold text-soil">
            ✓ Fundo criado em rascunho
          </h2>
          <p className="mt-1 text-sm text-ink/70">
            {result.parsed?.name} — {result.parsed?.rules?.length || 0} regras,{" "}
            {result.parsed?.amounts?.length || 0} montantes,{" "}
            {result.parsed?.documents?.length || 0} documentos.
          </p>
          <p className="mt-3 text-sm">
            <strong>Próximo passo:</strong> vai a{" "}
            <Link href="/admin/fundos" className="text-clay underline">Gerir fundos</Link>,
            revê os campos e os valores (a IA pode enganar-se), e <strong>publica</strong>.
          </p>
        </div>
      )}
    </main>
  );
}
