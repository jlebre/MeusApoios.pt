"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getBrowserClient } from "@/lib/supabase-browser";
import NavBar from "@/components/NavBar";
import { calculateAge, EMPLOYMENT_STATUS_OPTIONS } from "@/lib/utils";

type FieldDef =
  | { field: string; label: string; type: "text" | "number" | "date" }
  | { field: string; label: string; type: "select"; options: string[] }
  | { field: string; label: string; type: "yesno" };

const TRANSVERSAIS: FieldDef[] = [
  { field: "full_name", label: "Nome", type: "text" },
  { field: "phone", label: "Telefone", type: "text" },
  { field: "birth_date", label: "Data de nascimento", type: "date" },
  {
    field: "employment_status",
    label: "Situação profissional",
    type: "select",
    options: EMPLOYMENT_STATUS_OPTIONS,
  },
  { field: "location_district", label: "Distrito", type: "text" },
  { field: "location_municipality", label: "Concelho", type: "text" },
  { field: "annual_income_eur", label: "Rendimento anual (€)", type: "number" },
];

export default function Perfil() {
  const supabase = getBrowserClient();
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<any>({});
  const [projects, setProjects] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState("");

  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }
      setAuthed(true);
      setEmail(session.user.email || "");

      // perfil (cria se não existir)
      let { data: prof } = await supabase
        .from("shared_profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();
      if (!prof) {
        const { data: created } = await supabase
          .from("shared_profiles")
          .insert({ user_id: session.user.id, email: session.user.email })
          .select()
          .single();
        prof = created;
      }
      setProfile(prof || {});

      // histórico de diagnósticos
      const { data: projs } = await supabase
        .from("projects")
        .select("*, domains(label, slug)")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });
      setProjects(projs || []);
      setLoading(false);
    })();
  }, [supabase]);

  async function save() {
    setSaving(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const patch: any = { updated_at: new Date().toISOString() };

    for (const f of TRANSVERSAIS) {
      const v = profile[f.field];
      if (f.type === "number") {
        patch[f.field] = v === "" || v == null ? null : Number(v);
      } else {
        patch[f.field] = v || null;
      }
    }

    // Calcular e guardar promoter_age a partir de birth_date
    if (patch.birth_date) {
      const age = calculateAge(patch.birth_date);
      if (age !== null) patch.promoter_age = age;
    }

    patch.tax_situation_ok = profile.tax_situation_ok ?? null;

    await supabase
      .from("shared_profiles")
      .update(patch)
      .eq("user_id", session.user.id);
    setSaving(false);
    setSavedAt(new Date().toLocaleTimeString("pt-PT"));
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading)
    return <main className="px-6 py-20 text-center text-ink/50">A carregar…</main>;

  if (!authed)
    return (
      <main className="mx-auto max-w-md px-6 py-20 text-center">
        <p className="text-ink/70">Entra para veres e editares o teu perfil.</p>
        <Link href="/entrar" className="btn-primary mt-6">
          Entrar
        </Link>
      </main>
    );

  const ageDisplay = profile.birth_date ? calculateAge(profile.birth_date) : null;

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <NavBar />

      <div className="mt-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-soil">
            O meu perfil
          </h1>
          <p className="text-ink/60">{email}</p>
        </div>
        <button onClick={signOut} className="shrink-0 text-sm text-clay underline">
          Sair
        </button>
      </div>

      {/* Explicação do valor do perfil */}
      <div className="mt-4 rounded-xl border border-mint/40 bg-mint/5 p-4 text-sm text-ink/70">
        <strong className="text-soil">Para que serve preencher o perfil?</strong>{" "}
        Os dados que guardas aqui são reutilizados em todos os diagnósticos — as
        perguntas já respondidas são <strong>saltadas automaticamente</strong>.
        Preenchas uma vez, todas as áreas ficam mais rápidas.
      </div>

      {/* Dados transversais */}
      <section className="mt-6 rounded-2xl border border-clay/20 bg-white/60 p-6">
        <h2 className="font-display text-xl font-bold text-soil">
          Os meus dados
        </h2>
        <p className="mt-1 text-sm text-ink/60">
          Estes dados são reutilizados em todas as áreas. Preenche uma vez,
          edita quando precisares.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {TRANSVERSAIS.map((f) => (
            <label key={f.field} className="block">
              <span className="field-label">{f.label}</span>
              {f.type === "select" ? (
                <select
                  className="field-input"
                  value={profile[f.field] ?? ""}
                  onChange={(e) =>
                    setProfile({ ...profile, [f.field]: e.target.value })
                  }
                >
                  <option value="">Seleciona…</option>
                  {f.options.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="field-input"
                  type={f.type}
                  max={f.type === "date" ? new Date().toISOString().split("T")[0] : undefined}
                  value={profile[f.field] ?? ""}
                  onChange={(e) =>
                    setProfile({ ...profile, [f.field]: e.target.value })
                  }
                />
              )}
              {f.field === "birth_date" && ageDisplay !== null && (
                <span className="mt-1 block text-xs text-ink/50">
                  {ageDisplay} anos
                </span>
              )}
            </label>
          ))}

          <label className="block sm:col-span-2">
            <span className="field-label">Situação fiscal regularizada?</span>
            <div className="flex gap-2">
              {[
                [true, "Sim"],
                [false, "Não"],
              ].map(([v, label]) => (
                <button
                  key={String(v)}
                  type="button"
                  onClick={() => setProfile({ ...profile, tax_situation_ok: v })}
                  className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium ${
                    profile.tax_situation_ok === v
                      ? "border-soil bg-soil text-cream"
                      : "border-clay/30 bg-white/70 text-soil"
                  }`}
                >
                  {label as string}
                </button>
              ))}
            </div>
          </label>
        </div>
        <div className="mt-5 flex items-center gap-3">
          <button className="btn-primary" disabled={saving} onClick={save}>
            {saving ? "A guardar…" : "Guardar dados"}
          </button>
          {savedAt && (
            <span className="text-sm text-ink/50">Guardado às {savedAt}</span>
          )}
        </div>
      </section>

      {/* Histórico de diagnósticos */}
      <section className="mt-8">
        <h2 className="font-display text-xl font-bold text-soil">
          Os meus diagnósticos
        </h2>
        <div className="mt-3 space-y-3">
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/resultado/${p.id}`}
              className="block rounded-xl border border-clay/20 bg-white/60 p-4 transition hover:border-clay/50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-display font-bold text-soil">
                    {p.domains?.label || "Diagnóstico"}
                  </span>
                  <div className="text-sm text-ink/60">
                    {p.goal?.slice(0, 60) || "—"}
                  </div>
                </div>
                <span className="text-xs text-ink/40">
                  {new Date(p.created_at).toLocaleDateString("pt-PT")}
                </span>
              </div>
            </Link>
          ))}
          {projects.length === 0 && (
            <div className="rounded-xl border border-dashed border-clay/30 p-8 text-center text-ink/50">
              Ainda não tens diagnósticos.{" "}
              <Link href="/areas" className="text-clay underline">
                Fazer o primeiro
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
