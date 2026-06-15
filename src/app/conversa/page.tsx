"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function ConversaInner() {
  const params = useSearchParams();
  const projectId = params.get("project");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    preferred_time: "",
    topic: "",
  });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    const res = await fetch("/api/conversation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, project_id: projectId }),
    });
    setLoading(false);
    if (res.ok) setSent(true);
  }

  if (sent)
    return (
      <main className="mx-auto max-w-md px-6 py-20 text-center">
        <h1 className="font-display text-3xl font-black text-soil">
          Pedido recebido!
        </h1>
        <p className="mt-3 text-ink/70">
          Entramos em contacto para combinar uma conversa sobre o teu caso.
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
        Falar com alguém
      </h1>
      <p className="mt-2 text-ink/70">
        Queres ajuda a perceber o teu caso? Deixa o contacto e a tua
        disponibilidade — combinamos uma conversa sem compromisso.
      </p>

      <div className="mt-8 space-y-4">
        <Field label="Nome">
          <input
            className="field-input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </Field>
        <Field label="Email">
          <input
            className="field-input"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </Field>
        <Field label="Telefone">
          <input
            className="field-input"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </Field>
        <Field label="Melhor altura para falar">
          <select
            className="field-input"
            value={form.preferred_time}
            onChange={(e) =>
              setForm({ ...form, preferred_time: e.target.value })
            }
          >
            <option value="">Seleciona…</option>
            <option>Manhã (9h-12h)</option>
            <option>Tarde (14h-18h)</option>
            <option>Fim do dia (18h-20h)</option>
            <option>Fim de semana</option>
          </select>
        </Field>
        <Field label="Sobre o que queres falar? (opcional)">
          <textarea
            className="field-input min-h-[90px]"
            value={form.topic}
            onChange={(e) => setForm({ ...form, topic: e.target.value })}
          />
        </Field>
        <button
          className="btn-primary w-full"
          disabled={loading || !form.email}
          onClick={submit}
        >
          {loading ? "A enviar…" : "Pedir contacto"}
        </button>
      </div>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      {children}
    </label>
  );
}

export default function Conversa() {
  return (
    <Suspense
      fallback={
        <main className="px-6 py-20 text-center text-ink/50">A carregar…</main>
      }
    >
      <ConversaInner />
    </Suspense>
  );
}
