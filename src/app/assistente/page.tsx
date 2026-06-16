"use client";

export const dynamic = "force-dynamic";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";

type Msg = { role: "user" | "assistant"; content: string };

function AssistenteInner() {
  const params = useSearchParams();
  const projectId = params.get("project") || "";
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Olá! Conta-me a tua ideia ou o teu sonho para a tua terra ou projeto — por palavras tuas, sem te preocupares com termos técnicos. Eu ajudo-te a perceber que apoios podem encaixar e que passos fazem sentido.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(false);

  async function send() {
    if (!input.trim()) return;
    const userMsg: Msg = { role: "user", content: input };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, project_id: projectId }),
      });
      if (res.status === 402) {
        setLocked(true);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setMessages([
        ...next,
        {
          role: "assistant",
          content: data.reply || "Desculpa, não consegui responder agora.",
        },
      ]);
    } catch {
      setMessages([
        ...next,
        {
          role: "assistant",
          content: "Houve um erro de ligação. Tenta de novo daqui a pouco.",
        },
      ]);
    }
    setLoading(false);
  }

  if (locked) {
    return (
      <main className="mx-auto max-w-md px-6 py-20 text-center">
        <h1 className="font-display text-3xl font-black text-soil">
          Assistente Premium
        </h1>
        <p className="mt-3 text-ink/70">
          O assistente que liga tudo — descreve o teu objetivo e recebe um
          caminho — faz parte da versão completa. Desbloqueia o teu diagnóstico
          para o usar.
        </p>
        <Link
          href={projectId ? `/resultado/${projectId}` : "/diagnostico"}
          className="btn-primary mt-6"
        >
          Ver como desbloquear
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-8">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="font-display text-xl font-black tracking-tight text-soil"
        >
          <BrandLogo />
        </Link>
        <span className="rounded-full bg-wheat/20 px-3 py-1 text-xs font-semibold text-clay">
          Assistente · Premium
        </span>
      </div>

      <div className="mt-6 flex-1 space-y-4 overflow-y-auto">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                m.role === "user"
                  ? "bg-soil text-cream"
                  : "border border-clay/20 bg-white/70 text-ink/85"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-clay/20 bg-white/70 px-4 py-3 text-sm text-ink/50">
              a pensar…
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2 border-t border-clay/20 pt-4">
        <textarea
          className="field-input min-h-[52px] flex-1 resize-none"
          placeholder="Descreve a tua ideia…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <button className="btn-primary shrink-0" disabled={loading || !input.trim()} onClick={send}>
          Enviar
        </button>
      </div>
      <p className="mt-2 text-xs text-ink/40">
        O assistente ajuda a orientar. Confirma sempre as condições no aviso
        oficial — ele pode enganar-se.
      </p>
    </main>
  );
}

export default function Assistente() {
  return (
    <Suspense
      fallback={
        <main className="px-6 py-20 text-center text-ink/50">A carregar…</main>
      }
    >
      <AssistenteInner />
    </Suspense>
  );
}
