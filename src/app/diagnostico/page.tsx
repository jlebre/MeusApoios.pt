"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import dynamicImport from "next/dynamic";
import { track } from "@/lib/track";
import { getBrowserClient } from "@/lib/supabase-browser";
import NavBar from "@/components/NavBar";
import { calculateAge } from "@/lib/utils";

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
  // campos cujo valor veio do perfil (para mostrar badge e skip de secções)
  const [profileFields, setProfileFields] = useState<Set<string>>(new Set());
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
      if (!prof) return;

      const filled = new Set<string>();
      const patch: Record<string, any> = {};

      const set = (field: string, val: any) => {
        if (val !== null && val !== undefined && val !== "") {
          patch[field] = val;
          filled.add(field);
        }
      };

      set("contact_name", prof.full_name);
      set("contact_email", prof.email);
      set("contact_phone", prof.phone);
      // data de nascimento — nova forma preferencial
      if (prof.birth_date) {
        set("birth_date", prof.birth_date);
        // também pré-calcula a idade para compatibilidade
        const age = calculateAge(prof.birth_date);
        if (age !== null) {
          patch.promoter_age = age;
          patch.birth_year_age = age;
        }
      } else if (prof.promoter_age) {
        // fallback: se só tiver idade guardada (sem data)
        set("promoter_age", prof.promoter_age);
        set("birth_year_age", prof.promoter_age);
      }
      set("employment_status", prof.employment_status);
      set("location_district", prof.location_district);
      set("location_municipality", prof.location_municipality);
      set("annual_income_eur", prof.annual_income_eur);
      if (prof.tax_situation_ok === true) {
        patch.tax_situation_ok = "sim";
        filled.add("tax_situation_ok");
      } else if (prof.tax_situation_ok === false) {
        patch.tax_situation_ok = "nao";
        filled.add("tax_situation_ok");
      }

      setProfileFields(filled);
      setAnswers((a) => ({ ...a, ...patch }));
    })();
  }, []);

  // Agrupar perguntas em secções
  const allSections: { name: string; questions: Question[] }[] = [];
  for (const q of questions) {
    let s = allSections.find((x) => x.name === q.section);
    if (!s) {
      s = { name: q.section || "Perguntas", questions: [] };
      allSections.push(s);
    }
    s.questions.push(q);
  }

  // Filtrar secções onde TODAS as perguntas têm resposta do perfil
  // (essas secções são saltadas automaticamente)
  const sections = allSections.filter((s) =>
    s.questions.some((q) => !profileFields.has(q.field))
  );

  // Número de campos pré-preenchidos (para mostrar ao utilizador)
  const prefilledCount = allSections.reduce((acc, s) => {
    return acc + s.questions.filter((q) => profileFields.has(q.field)).length;
  }, 0);
  const skippedSections = allSections.length - sections.length;

  const totalSteps = sections.length;

  function setAnswer(q: Question, value: any) {
    setAnswers((a) => {
      const next = { ...a, [q.field]: value };
      if (q.also_writes) next[q.also_writes] = value;
      // Se for birth_date, calcula e guarda promoter_age automaticamente
      if (q.field === "birth_date") {
        const age = calculateAge(value);
        if (age !== null) {
          next.promoter_age = age;
          next.birth_year_age = age;
        }
      }
      return next;
    });
  }

  async function submit() {
    setSending(true);
    setError("");
    try {
      // Garantir que promoter_age está calculado a partir de birth_date antes de enviar
      const payload = { ...answers };
      if (payload.birth_date && !payload.promoter_age) {
        const age = calculateAge(payload.birth_date);
        if (age !== null) {
          payload.promoter_age = age;
          payload.birth_year_age = age;
        }
      }

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
        body: JSON.stringify({ ...payload, dominio }),
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

  if (sections.length === 0 && allSections.length === 0)
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

  // Todos os passos saltados (perfil completo) — confirmar e submeter
  if (sections.length === 0 && allSections.length > 0) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-10">
        <NavBar />
        <div className="mt-10 rounded-2xl border border-mint/40 bg-mint/5 p-7 text-center">
          <div className="text-3xl">✓</div>
          <h2 className="mt-3 font-display text-2xl font-black text-soil">
            Perfil completo — já tens tudo respondido
          </h2>
          <p className="mt-2 text-ink/70">
            Encontrámos {prefilledCount} resposta{prefilledCount !== 1 ? "s" : ""} guardada{prefilledCount !== 1 ? "s" : ""} no teu perfil.
            Podemos calcular os resultados diretamente.
          </p>
          {error && <p className="mt-3 text-sm font-medium text-red-700">{error}</p>}
          <label className="mt-5 flex items-start gap-2 text-left text-sm text-ink/70">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 h-5 w-5 accent-olive"
            />
            <span>
              Compreendo que é uma ferramenta de apoio à decisão, sem garantias, e que a uso por minha conta e risco. Li os{" "}
              <Link href="/termos" target="_blank" className="text-clay underline">termos e tratamento de dados</Link>.
            </span>
          </label>
          <button
            className="btn-primary mt-5"
            disabled={sending || !consent}
            onClick={submit}
          >
            {sending ? "A analisar…" : "Ver os meus resultados →"}
          </button>
          <p className="mt-3 text-sm text-ink/50">
            Os dados usados são os que estão no teu{" "}
            <Link href="/perfil" className="text-clay underline">perfil</Link>.
            Podes editá-los a qualquer momento.
          </p>
        </div>
      </main>
    );
  }

  const isLastStep = step === totalSteps - 1;
  const currentSection = sections[step];

  // validação mínima do passo: campos obrigatórios preenchidos
  // (inclui campos cujo valor veio do perfil)
  const stepValid = currentSection.questions
    .filter((q) => q.required && !profileFields.has(q.field))
    .every((q) => {
      const v = answers[q.field];
      return v !== undefined && v !== "" && v !== null;
    });

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <NavBar />

      {/* Banner de perfil pré-preenchido */}
      {prefilledCount > 0 && (
        <div className="mt-4 rounded-xl border border-mint/40 bg-mint/5 px-4 py-3 text-sm text-ink/70">
          ✓ {prefilledCount} campo{prefilledCount !== 1 ? "s foram" : " foi"} pré-preenchido{prefilledCount !== 1 ? "s" : ""} do teu perfil
          {skippedSections > 0 && ` e ${skippedSections} passo${skippedSections !== 1 ? "s foram" : " foi"} saltado${skippedSections !== 1 ? "s" : ""} automaticamente`}.
        </div>
      )}

      {/* Progresso */}
      <div className="mt-6 flex gap-2">
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

      <div className="mt-6 rounded-2xl border border-clay/20 bg-white/60 p-7">
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
              fromProfile={profileFields.has(q.field)}
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
  fromProfile,
}: {
  q: Question;
  value: any;
  onChange: (v: any) => void;
  fromProfile?: boolean;
}) {
  return (
    <label className="block">
      <span className="field-label">
        {q.label}
        {q.required && !fromProfile && <span className="text-clay"> *</span>}
        {fromProfile && (
          <span className="ml-2 rounded-full bg-mint/20 px-2 py-0.5 text-xs font-medium text-olive">
            do perfil
          </span>
        )}
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

      {q.input_type === "date" && (
        <input
          className="field-input"
          type="date"
          max={new Date().toISOString().split("T")[0]}
          value={value || ""}
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
