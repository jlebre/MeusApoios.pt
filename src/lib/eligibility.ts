// Motor de elegibilidade.
// Avalia as regras de um fundo contra as respostas de um projeto.
// Determinístico e auditável — sem IA. Cada veredito traz o porquê.

export type Rule = {
  id: string;
  label: string;
  field: string;
  operator: string;
  value: string | null;
  value2: string | null;
  severity: "eliminatoria" | "aviso";
  explain_pass: string | null;
  explain_fail: string | null;
};

export type RuleResult = {
  label: string;
  outcome: "cumpre" | "falha" | "confirmar";
  severity: "eliminatoria" | "aviso";
  explanation: string;
};

export type FundVerdict =
  | "elegivel"
  | "em_risco"
  | "inelegivel"
  | "confirmar";

export type Amount = {
  label: string;
  kind: "fixo" | "percentagem";
  rate: number | null;
  fixed_amount: number | null;
  cap: number | null;
  base_field: string;
  notes: string | null;
};

// Avalia uma regra. Devolve cumpre / falha / confirmar.
function evalRule(rule: Rule, project: Record<string, any>): RuleResult {
  const raw = project[rule.field];
  const sev = rule.severity;

  // valor em falta → não dá para decidir
  const missing =
    raw === null || raw === undefined || raw === "" ;

  const passResult = (): RuleResult => ({
    label: rule.label,
    outcome: "cumpre",
    severity: sev,
    explanation: rule.explain_pass || "Condição cumprida.",
  });
  const failResult = (): RuleResult => ({
    label: rule.label,
    outcome: "falha",
    severity: sev,
    explanation: rule.explain_fail || "Condição não cumprida.",
  });
  const confirmResult = (): RuleResult => ({
    label: rule.label,
    outcome: "confirmar",
    severity: sev,
    explanation:
      rule.explain_fail ||
      "Falta informação para avaliar esta condição.",
  });

  // booleanos: "não sei" (null) → confirmar
  if (rule.operator === "is_true") {
    if (raw === true) return passResult();
    if (raw === false) return failResult();
    return confirmResult();
  }
  if (rule.operator === "is_false") {
    if (raw === false) return passResult();
    if (raw === true) return failResult();
    return confirmResult();
  }

  if (missing) return confirmResult();

  const num = Number(raw);
  const v = rule.value !== null ? Number(rule.value) : NaN;
  const v2 = rule.value2 !== null ? Number(rule.value2) : NaN;

  switch (rule.operator) {
    case "eq":
      return String(raw) === String(rule.value) ? passResult() : failResult();
    case "neq":
      return String(raw) !== String(rule.value) ? passResult() : failResult();
    case "gte":
      return num >= v ? passResult() : failResult();
    case "lte":
      return num <= v ? passResult() : failResult();
    case "between":
      return num >= v && num <= v2 ? passResult() : failResult();
    case "in": {
      const opts = (rule.value || "")
        .split(",")
        .map((s) => s.trim().toLowerCase());
      return opts.includes(String(raw).trim().toLowerCase())
        ? passResult()
        : failResult();
    }
    default:
      return confirmResult();
  }
}

// Veredito global de um fundo a partir das suas regras.
export function evaluateFund(
  rules: Rule[],
  project: Record<string, any>
): { verdict: FundVerdict; results: RuleResult[] } {
  const results = rules.map((r) => evalRule(r, project));

  // Sem regras definidas, não podemos afirmar elegibilidade — é honesto
  // dizer que falta confirmar, em vez de dar um falso "elegível".
  if (results.length === 0) {
    return { verdict: "confirmar", results: [] };
  }

  const hasEliminatoryFail = results.some(
    (r) => r.outcome === "falha" && r.severity === "eliminatoria"
  );
  const hasWarningFail = results.some(
    (r) => r.outcome === "falha" && r.severity === "aviso"
  );
  const hasConfirm = results.some((r) => r.outcome === "confirmar");

  let verdict: FundVerdict;
  if (hasEliminatoryFail) verdict = "inelegivel";
  else if (hasWarningFail) verdict = "em_risco";
  else if (hasConfirm) verdict = "confirmar";
  else verdict = "elegivel";

  return { verdict, results };
}

// Simulação de valor estimado para um fundo.
export function simulateAmount(
  amounts: Amount[],
  project: Record<string, any>
): { total: number; lines: { label: string; value: number; note: string }[] } {
  const lines = amounts.map((a) => {
    let value = 0;
    let note = a.notes || "";
    if (a.kind === "fixo") {
      value = a.fixed_amount || 0;
    } else if (a.kind === "percentagem") {
      const base = Number(project[a.base_field] || 0);
      value = (base * (a.rate || 0)) / 100;
      if (a.cap && value > a.cap) {
        value = a.cap;
        note = (note ? note + " " : "") + "(limitado ao teto)";
      }
    }
    return { label: a.label, value: Math.round(value), note };
  });
  const total = lines.reduce((s, l) => s + l.value, 0);
  return { total, lines };
}

export const VERDICT_LABEL: Record<FundVerdict, string> = {
  elegivel: "Provavelmente elegível",
  em_risco: "Elegível com ressalvas",
  confirmar: "Falta confirmar",
  inelegivel: "Provavelmente não elegível",
};

export type Zone = {
  zone_type: string;
  match_values: string[];
  label: string | null;
};

// Valida se a localização do projeto está numa zona elegível do fundo.
// Devolve: 'ok' | 'fora' | 'nacional' | 'sem_info'
export function checkZone(
  zones: Zone[],
  project: Record<string, any>
): { status: "ok" | "fora" | "nacional" | "sem_info"; label: string | null } {
  if (!zones || zones.length === 0) return { status: "sem_info", label: null };

  // se algum for nacional, é elegível em todo o continente
  const nacional = zones.find((z) => z.zone_type === "nacional");
  if (nacional) return { status: "nacional", label: nacional.label };

  const district = (project.location_district || "").trim().toLowerCase();
  if (!district) return { status: "sem_info", label: zones[0]?.label ?? null };

  for (const z of zones) {
    const values = (z.match_values || []).map((v) => v.toLowerCase());
    if (values.includes(district)) return { status: "ok", label: z.label };
  }
  return { status: "fora", label: zones[0]?.label ?? null };
}

export const VERDICT_COLOR: Record<FundVerdict, string> = {
  elegivel: "#5c6b3a",
  em_risco: "#d9a441",
  confirmar: "#7a4a2b",
  inelegivel: "#9b3b2f",
};
