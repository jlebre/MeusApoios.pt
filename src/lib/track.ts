// Helper de tracking do funil. Fire-and-forget: nunca bloqueia nem
// rebenta a experiência. Usado para medir validação com utilizadores reais.
export function track(
  name: string,
  project_id?: string,
  meta?: Record<string, any>
) {
  try {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, project_id, meta }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // silêncio: tracking nunca deve falhar visível
  }
}
