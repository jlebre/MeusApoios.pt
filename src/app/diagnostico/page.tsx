"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import dynamicImport from "next/dynamic";
import { track } from "@/lib/track";
import { getBrowserClient } from "@/lib/supabase-browser";

const LocationMap = dynamicImport(() => import("@/components/LocationMap"), {
  ssr: false,
});

type Question = {
  id: string;
  field: string;
  label: string;
  hint: string | null;
  input_type: string;
  options: string[] | null;
  required: boolean;
  placeholder: string | null;
  also_writes: string | null;
  section: string;
  section_order: number;
};

function DiagnosticoInner() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQ, setLoadingQ] = useState(true);
  const [dominio, setDominio] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [consent, setConsent] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    track("diagnostico_iniciado");
    const params = new URLSearchParams(window.location.search);
    const dom = params.get("dominio");
    setDominio(dom);
    fetch(`/api/questions?dominio=${dom || ""}`)
      .then((r) => r.json())
      .then((d) => {
        setQuestions(d.questions || []);
        setLoadingQ(false);
      })
      .catch(() => setLoadingQ(false));

    // Se houver sessão, pré-preenche as transversais a partir do perfil
    (async () => {
      const supabase = getBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      setUserId(session.user.id);
      const { data: prof } = await supabase
        .from("shared_profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();
      if (prof) {
        setAnswers((a) => ({
          ...a,
          contact_name: prof.full_name ?? a.contact_name,
          contact_email: prof.email ?? a.contact_email,
          contact_phone: prof.phone ?? a.contact_phone,
          promoter_age: prof.promoter_age ?? a.promoter_age,
          birth_year_age: prof.promoter_age ?? a.birth_year_age,
          employment_status: prof.employment_status ?? a.employment_status,
          location_district: prof.location_district ?? a.location_district,
          location_municipality:
            prof.location_municipality ?? a.location_municipality,
          annual_income_eur: prof.annual_income_eur ?? a.annual_income_eur,
          tax_situation_ok:
            prof.tax_situation_ok === true
              ? "sim"
              : prof.tax_situation_ok === false
              ? "nao"
              : a.tax_situation_ok,
        }));
      }
    })();
  }, []);

  // Agrupar perguntas em secções (cada secção = um passo)
  const sections: { name: string; questions: Question[] }[] = [];
  for (const q of questions) {
    let s = sections.find((x) => x.name === q.section);
    if (!s) {
      s = { name: q.section || "Perguntas", questions: [] };
      sections.push(s);
    }
    s.questions.push(q);
  }
  // passo final = contacto + consentimento (sempre)
  const totalSteps = sections.length;

  function setAnswer(q: Question, value: any) {
    setAnswers((a) => {
      const next = { ...a, [q.field]: value };
      if (q.also_writes) next[q.also_writes] = value;
      return next;
    });
  }

  async function submit() {
    setSending(true);
    setError("");
    try {
      const supabase = getBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session
            ? { Authorization: `Bearer ${session.access_token}` }
            : {}),
        },
        body: JSON.stringify({ ...answers, dominio }),
      });
      if (!res.ok) throw new Error("Falha");
      const json = await res.json();
      if (json.id) {
        track("diagnostico_concluido", json.id);
        window.location.href = `/resultado/${json.id}`;
        return;
      }
    } catch {
      setError("Algo correu mal a enviar. Tenta de novo daqui a pouco.");
    } finally {
      setSending(false);
    }
  }

  if (loadingQ)
    return (
      <main className="px-6 py-20 text-center text-ink/50">
        A preparar o teu questionário…
      </main>
    );

  if (sections.length === 0)
    return (
      <main className="mx-auto max-w-md px-6 py-20 text-center">
        <p className="text-ink/70">
          Esta área ainda não tem questionário disponível.
        </p>
        <Link href="/areas" className="btn-primary mt-6">
          Escolher outra área
        </Link>
      </main>
    );

  const isLastStep = step === totalSteps - 1;
  const currentSection = sections[step];

  // validação mínima do passo: campos obrigatórios preenchidos
  const stepValid = currentSection.questions
    .filter((q) => q.required)
    .every((q) => {
      const v = answers[q.field];
      return v !== undefined && v !== "" && v !== null;
    });

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <Link
        href="/areas"
        className="font-display text-xl font-black tracking-tight text-soil"
      >
        Meus<span className="text-wheat">Apoios</span>
      </Link>

      {/* Progresso */}
      <div className="mt-8 flex gap-2">
        {sections.map((s, i) => (
          <div key={s.name} className="flex-1">
            <div
              className={`h-1.5 rounded-full ${
                i <= step ? "bg-wheat" : "bg-clay/20"
              }`}
            />
            <span
              className={`mt-1 block truncate text-xs ${
                i === step ? "font-semibold text-soil" : "text-ink/40"
              }`}
            >
              {s.name}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-clay/20 bg-white/60 p-7">
        <h2 className="font-display text-2xl font-bold text-soil">
          {currentSection.name}
        </h2>
        <div className="mt-5 space-y-4">
          {currentSection.questions.map((q) => (
            <QuestionField
              key={q.id}
              q={q}
              value={answers[q.field]}
              onChange={(v) => setAnswer(q, v)}
            />
          ))}

          {/* Mapa na secção de localização */}
          {currentSection.name === "Localização" && (
            <div>
              <span className="field-label">Marca no mapa (opcional)</span>
              <LocationMap
                onPick={(lat, lng) =>
                  setAnswers((a) => ({ ...a, latitude: lat, longitude: lng }))
                }
              />
            </div>
          )}

          {/* Consentimento no último passo */}
          {isLastStep && (
            <>
              {error && (
                <p className="text-sm font-medium text-red-700">{error}</p>
              )}
              <label className="flex items-start gap-2 text-sm text-ink/70">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 h-5 w-5 accent-olive"
                />
                <span>
                  Compreendo que é uma ferramenta de apoio à decisão, sem
                  garantias, e que a uso por minha conta e risco. Li os{" "}
                  <Link href="/termos" target="_blank" className="text-clay underline">
                    termos e tratamento de dados
                  </Link>
                  .
                </span>
              </label>
            </>
          )}
        </div>

        {/* Navegação */}
        <div className="mt-8 flex items-center justify-between">
          <button
            className="btn-ghost disabled:opacity-40"
            disabled={step === 0}
            onClick={() => setStep((s) => s - 1)}
          >
            Anterior
          </button>
          {!isLastStep ? (
            <button
              className="btn-primary disabled:opacity-50"
              disabled={!stepValid}
              onClick={() => setStep((s) => s + 1)}
            >
              Seguinte
            </button>
          ) : (
            <button
              className="btn-primary"
              disabled={sending || !stepValid || !consent}
              onClick={submit}
            >
              {sending ? "A analisar…" : "Ver os meus resultados →"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

function QuestionField({
  q,
  value,
  onChange,
}: {
  q: Question;
  value: any;
  onChange: (v: any) => void;
}) {
  return (
    <label className="block">
      <span className="field-label">
        {q.label}
        {q.required && <span className="text-clay"> *</span>}
      </span>
      {q.hint && (
        <span className="-mt-1 mb-2 block text-xs text-ink/55">{q.hint}</span>
      )}

      {q.input_type === "textarea" && (
        <textarea
          className="field-input min-h-[100px]"
          placeholder={q.placeholder || ""}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {q.input_type === "text" && (
        <input
          className="field-input"
          type={q.field === "contact_email" ? "email" : "text"}
          inputMode={
            q.field === "contact_email"
              ? "email"
              : q.field === "contact_phone"
              ? "tel"
              : "text"
          }
          autoComplete={
            q.field === "contact_email"
              ? "email"
              : q.field === "contact_phone"
              ? "tel"
              : q.field === "contact_name"
              ? "name"
              : "off"
          }
          placeholder={q.placeholder || ""}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {q.input_type === "number" && (
        <input
          className="field-input"
          type="number"
          inputMode="numeric"
          placeholder={q.placeholder || ""}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {q.input_type === "select" && (
        <select
          className="field-input"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Seleciona…</option>
          {(q.options || []).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      )}

      {q.input_type === "yesno" && (
        <div className="flex gap-2">
          {[
            ["sim", "Sim"],
            ["nao", "Não"],
            ["nao_sei", "Não sei"],
          ].map(([v, label]) => (
            <button
              key={v}
              type="button"
              onClick={() => onChange(v)}
              className={`flex-1 rounded-md border px-3 py-3 text-sm font-medium transition ${
                value === v
                  ? "border-soil bg-soil text-cream"
                  : "border-clay/30 bg-white/70 text-soil hover:bg-clay/10"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </label>
  );
}

export default function Diagnostico() {
  return (
    <Suspense
      fallback={
        <main className="px-6 py-20 text-center text-ink/50">A carregar…</main>
      }
    >
      <DiagnosticoInner />
    </Suspense>
  );
}
