"use client";

import { useState } from "react";
import { track } from "@/lib/track";

// Botão de desbloqueio do detalhe dos apoios.
//
// NOTA DE PRODUTO: por agora o desbloqueio é imediato (para validares o fluxo
// e mostrares o produto completo aos primeiros testes). O preço já está
// visível, o que te permite medir intenção real de compra.
//
// Quando quiseres cobrar a sério, troca a chamada a /api/unlock por uma
// sessão de checkout Stripe: o utilizador paga, o webhook marca unlocked=true,
// e esta página passa a mostrar o detalhe. O resto do fluxo não muda.
export default function UnlockButton({ projectId }: { projectId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function unlock() {
    setLoading(true);
    setError("");
    track("unlock_clicado", projectId);
    try {
      // 1. Tentar checkout Stripe (se configurado)
      const checkout = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: projectId }),
      });
      if (checkout.ok) {
        const j = await checkout.json();
        if (j.url) {
          window.location.href = j.url; // vai para o Stripe
          return;
        }
      }
      // 2. Fallback (Stripe não configurado): desbloqueio direto para testes
      const res = await fetch("/api/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: projectId }),
      });
      if (res.ok) {
        window.location.reload();
      } else {
        setError("Não foi possível desbloquear. Tenta de novo.");
        setLoading(false);
      }
    } catch {
      setError("Erro de ligação. Tenta de novo.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button className="btn-primary text-base" disabled={loading} onClick={unlock}>
        {loading ? "A desbloquear…" : "Desbloquear relatório · 19 €"}
      </button>
      {error && (
        <p className="mt-2 text-sm font-medium text-red-700">{error}</p>
      )}
      <p className="mt-2 text-xs text-ink/45">
        Pagamento único por este diagnóstico. (Em fase de testes, o desbloqueio
        é imediato.)
      </p>
    </div>
  );
}
