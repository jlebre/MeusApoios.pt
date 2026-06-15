"use client";

export const dynamic = "force-dynamic";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase-browser";

function EntrarInner() {
  const params = useSearchParams();
  const next = params.get("next") || "/perfil";
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function submit() {
    setLoading(true);
    setError("");
    setInfo("");
    const supabase = getBrowserClient();
    try {
      if (mode === "register") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setInfo(
          "Conta criada! Se for pedida confirmação de email, confirma e depois entra."
        );
        // tentar entrar logo (se confirmação não for exigida)
        const { error: e2 } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (!e2) window.location.href = next;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        window.location.href = next;
      }
    } catch (e: any) {
      setError(traduzErro(e.message));
    }
    setLoading(false);
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <Link
        href="/"
        className="font-display text-xl font-black tracking-tight text-soil"
      >
        Meus<span className="text-wheat">Apoios</span>
      </Link>

      <h1 className="mt-10 font-display text-3xl font-black text-soil">
        {mode === "login" ? "Entrar" : "Criar conta"}
      </h1>
      <p className="mt-2 text-ink/70">
        {mode === "login"
          ? "Entra para teres o teu perfil e histórico guardados."
          : "Cria conta para não teres de repetir os teus dados em cada área."}
      </p>

      <div className="mt-8 space-y-4">
        <label className="block">
          <span className="field-label">Email</span>
          <input
            className="field-input"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="o-teu@email.pt"
          />
        </label>
        <label className="block">
          <span className="field-label">Password</span>
          <input
            className="field-input"
            type="password"
            autoComplete={mode === "register" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
          />
        </label>
        {error && <p className="text-sm font-medium text-red-700">{error}</p>}
        {info && <p className="text-sm font-medium text-olive">{info}</p>}
        <button
          className="btn-primary w-full"
          disabled={loading || !email || password.length < 6}
          onClick={submit}
        >
          {loading
            ? "Aguarda…"
            : mode === "login"
            ? "Entrar"
            : "Criar conta"}
        </button>
      </div>

      <p className="mt-6 text-sm text-ink/60">
        {mode === "login" ? (
          <>
            Ainda não tens conta?{" "}
            <button
              className="text-clay underline"
              onClick={() => {
                setMode("register");
                setError("");
              }}
            >
              Criar conta
            </button>
          </>
        ) : (
          <>
            Já tens conta?{" "}
            <button
              className="text-clay underline"
              onClick={() => {
                setMode("login");
                setError("");
              }}
            >
              Entrar
            </button>
          </>
        )}
      </p>

      <p className="mt-8 text-xs text-ink/45">
        Podes também{" "}
        <Link href="/areas" className="text-clay underline">
          fazer um diagnóstico sem conta
        </Link>
        . Sem conta, os teus dados não ficam guardados para reutilizar.
      </p>
    </main>
  );
}

function traduzErro(msg: string) {
  if (!msg) return "Algo correu mal. Tenta de novo.";
  if (msg.includes("Invalid login")) return "Email ou password incorretos.";
  if (msg.includes("already registered"))
    return "Este email já tem conta. Tenta entrar.";
  if (msg.includes("Password")) return "A password é demasiado fraca (mín. 6).";
  return msg;
}

export default function Entrar() {
  return (
    <Suspense
      fallback={
        <main className="px-6 py-20 text-center text-ink/50">A carregar…</main>
      }
    >
      <EntrarInner />
    </Suspense>
  );
}
