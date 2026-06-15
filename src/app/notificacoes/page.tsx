"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Notificacoes() {
  const [email, setEmail] = useState("");
  const [dominio, setDominio] = useState("");
  const [district, setDistrict] = useState("");
  const [domains, setDomains] = useState<any[]>([]);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/domains")
      .then((r) => r.json())
      .then((d) => setDomains(d.domains || []))
      .catch(() => {});
  }, []);

  async function submit() {
    setLoading(true);
    const res = await fetch("/api/notificacoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        dominio,
        location_district: district,
      }),
    });
    setLoading(false);
    if (res.ok) setSent(true);
  }

  if (sent)
    return (
      <main className="mx-auto max-w-md px-6 py-20 text-center">
        <h1 className="font-display text-3xl font-black text-soil">
          Subscrição registada!
        </h1>
        <p className="mt-3 text-ink/70">
          Avisamos-te por email quando abrir um aviso relevante na área que
          escolheste.
        </p>
        <Link href="/" className="btn-primary mt-8">
          Voltar ao início
        </Link>
      </main>
    );

  return (
    <main className="mx-auto max-w-md px-6 py-12">
      <Link
        href="/"
        className="font-display text-xl font-black tracking-tight text-soil"
      >
        Meus<span className="text-wheat">Apoios</span>
      </Link>

      <h1 className="mt-8 font-display text-3xl font-black text-soil">
        Avisa-me de novos apoios
      </h1>
      <p className="mt-2 text-ink/70">
        Deixa o email e a área que te interessa. Avisamos-te quando abrir um
        aviso relevante.
      </p>

      <div className="mt-8 space-y-4">
        <label className="block">
          <span className="field-label">Email</span>
          <input
            className="field-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="o-teu@email.pt"
          />
        </label>
        <label className="block">
          <span className="field-label">Área de interesse</span>
          <select
            className="field-input"
            value={dominio}
            onChange={(e) => setDominio(e.target.value)}
          >
            <option value="">Todas as áreas</option>
            {domains.map((d) => (
              <option key={d.id} value={d.slug}>
                {d.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="field-label">Distrito (opcional)</span>
          <input
            className="field-input"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            placeholder="Ex.: Évora"
          />
        </label>
        <button
          className="btn-primary w-full"
          disabled={loading || !email}
          onClick={submit}
        >
          {loading ? "A registar…" : "Quero ser avisado"}
        </button>
      </div>

      <p className="mt-6 text-xs text-ink/45">
        Usamos o teu email só para te avisar de avisos relevantes. Podes pedir
        para parar a qualquer momento.
      </p>
    </main>
  );
}
