import Link from "next/link";
import { createServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Após pagamento, o Stripe redireciona para aqui. Como fallback (caso o
// webhook demore), desbloqueamos também aqui de forma idempotente.
export default async function Sucesso({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServiceClient();
  await supabase
    .from("projects")
    .update({ unlocked: true, unlocked_at: new Date().toISOString() })
    .eq("id", params.id);

  return (
    <main className="mx-auto max-w-md px-6 py-20 text-center">
      <h1 className="font-display text-3xl font-black text-soil">
        Pagamento confirmado!
      </h1>
      <p className="mt-3 text-ink/70">
        O teu relatório completo está desbloqueado. Obrigado.
      </p>
      <Link href={`/resultado/${params.id}`} className="btn-primary mt-8">
        Ver o relatório completo
      </Link>
    </main>
  );
}
