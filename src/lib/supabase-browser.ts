"use client";

import { createClient } from "@supabase/supabase-js";

// Cliente do browser para autenticação (email+password) e leitura do
// próprio perfil/projetos (protegidos por RLS). Sessão persiste no browser.
let client: any = null;

export function getBrowserClient(): any {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return client;
}
