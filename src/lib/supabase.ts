import { createClient } from "@supabase/supabase-js";

// Cliente público (anon) — leitura segura, usado no browser se necessário.
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Cliente de servidor (service role) — NUNCA expor no browser.
// Usado apenas em route handlers / server components do backoffice.
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
