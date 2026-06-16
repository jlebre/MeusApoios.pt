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

// ============================================================
// PRIORIZAÇÃO INTELIGENTE (feature premium)
// ============================================================
// Combina três fatores num score de 0-100 e EXPLICA o porquê:
//  - Valor: quanto mais euros, melhor.
//  - Prazo: quanto mais perto de fechar, mais urgente.
//  - Facilidade: menor complexidade = mais alcançável.
// Só faz sentido para apoios a que a pessoa é candidatável.

export type PriorityInput = {
  fund: any;
  verdict: FundVerdict;
  sim: { total: number };
};

export type PriorityResult = PriorityInput & {
  score: number;
  reasons: string[];
  urgent: boolean;
};

export function prioritize(items: PriorityInput[]): PriorityResult[] {
  // só prioriza candidatáveis (elegível / em risco / confirmar)
  const candidatos = items.filter((i) => i.verdict !== "inelegivel");
  const maxValue = Math.max(1, ...candidatos.map((i) => i.sim.total || 0));
  const today = new Date();

  const scored = candidatos.map((i): PriorityResult => {
    const reasons: string[] = [];

    // --- Valor (0-45 pontos) ---
    const valueScore = ((i.sim.total || 0) / maxValue) * 45;
    if (i.sim.total > 0 && i.sim.total >= maxValue * 0.6) {
      reasons.push(`Valor elevado (~${i.sim.total.toLocaleString("pt-PT")}€)`);
    }

    // --- Prazo (0-35 pontos) + urgência ---
    let deadlineScore = 12; // sem prazo conhecido = neutro-baixo
    let urgent = false;
    const closes = i.fund.closes_at ? new Date(i.fund.closes_at) : null;
    if (closes && !isNaN(closes.getTime())) {
      const days = Math.ceil((closes.getTime() - today.getTime()) / 86400000);
      if (days < 0) {
        deadlineScore = 0;
        reasons.push("Prazo terminado — confirma se reabre");
      } else if (days <= 30) {
        deadlineScore = 35;
        urgent = true;
        reasons.push(`Fecha em ${days} dia(s) — urgente`);
      } else if (days <= 90) {
        deadlineScore = 25;
        reasons.push(`Fecha dentro de ~${Math.round(days / 30)} meses`);
      } else {
        deadlineScore = 18;
      }
    }

    // --- Facilidade (0-20 pontos) ---
    const complexity = (i.fund.complexity || "media").toLowerCase();
    let easeScore = 10;
    if (complexity === "baixa") {
      easeScore = 20;
      reasons.push("Processo simples");
    } else if (complexity === "alta") {
      easeScore = 5;
      reasons.push("Processo exigente — prepara-te com tempo");
    }

    // --- Bónus por elegibilidade clara ---
    let verdictBonus = 0;
    if (i.verdict === "elegivel") {
      verdictBonus = 5;
      reasons.push("Encaixas nos critérios");
    } else if (i.verdict === "confirmar") {
      reasons.push("Falta confirmar alguns dados");
    }

    const score = Math.round(valueScore + deadlineScore + easeScore + verdictBonus);
    return { ...i, score: Math.min(100, score), reasons, urgent };
  });

  return scored.sort((a, b) => b.score - a.score);
}

// ============================================================
// COMPARADOR (feature premium)
// ============================================================
// Prepara apoios para comparação lado a lado nas dimensões-chave.
export type CompareRow = {
  fund: any;
  verdict: FundVerdict;
  value: number;
  complexity: string;
  closesAt: string | null;
  daysLeft: number | null;
};

export function buildComparison(
  items: { fund: any; verdict: FundVerdict; sim: { total: number } }[]
): CompareRow[] {
  const today = new Date();
  return items
    .filter((i) => i.verdict !== "inelegivel")
    .map((i) => {
      const closes = i.fund.closes_at ? new Date(i.fund.closes_at) : null;
      const daysLeft =
        closes && !isNaN(closes.getTime())
          ? Math.ceil((closes.getTime() - today.getTime()) / 86400000)
          : null;
      return {
        fund: i.fund,
        verdict: i.verdict,
        value: i.sim.total || 0,
        complexity: (i.fund.complexity || "media").toLowerCase(),
        closesAt: i.fund.closes_at || null,
        daysLeft,
      };
    });
}
