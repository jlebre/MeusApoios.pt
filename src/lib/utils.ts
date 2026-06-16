// Calcula a idade em anos completos a partir de uma data de nascimento (YYYY-MM-DD).
export function calculateAge(birthDate: string): number | null {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

// Opções de situação profissional — centralizadas aqui para reutilizar
// no questionário (questions table seed) e no formulário de perfil.
export const EMPLOYMENT_STATUS_OPTIONS = [
  "Empregado por conta de outrem",
  "Trabalhador independente",
  "Desempregado",
  "Estudante",
  "À procura do primeiro emprego",
  "Reformado / Pensionista",
];

type FundDateFields = {
  status?: string | null;
  opens_at?: string | null;
  closes_at?: string | null;
};

export type FundStatus =
  | "aberto"
  | "fechado"
  | "previsto"
  | "recorrente"
  | "desconhecido";

// Calcula o estado real de um apoio a partir das datas; usa o campo
// manual apenas como fallback quando não há datas disponíveis.
export function getFundStatus(fund: FundDateFields, now: Date = new Date()): FundStatus {
  const { opens_at, closes_at, status } = fund;

  if (status === "recorrente") return "recorrente";

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (opens_at && closes_at) {
    const open = new Date(opens_at);
    const close = new Date(closes_at);
    if (today < open) return "previsto";
    if (today <= close) return "aberto";
    return "fechado";
  }

  if (closes_at) {
    const close = new Date(closes_at);
    return today <= close ? "aberto" : "fechado";
  }

  if (opens_at) {
    const open = new Date(opens_at);
    if (today < open) return "previsto";
    return "desconhecido";
  }

  if (status === "aberto" || status === "fechado" || status === "previsto") {
    return status as FundStatus;
  }

  return "desconhecido";
}

export const FUND_STATUS_LABEL: Record<FundStatus, string> = {
  aberto: "Aberto",
  fechado: "Fechado",
  previsto: "Previsto",
  recorrente: "Recorrente",
  desconhecido: "Datas por confirmar",
};

export const FUND_STATUS_COLOR: Record<FundStatus, string> = {
  aberto: "bg-olive/15 text-olive",
  fechado: "bg-clay/15 text-clay",
  previsto: "bg-sky/15 text-sky",
  recorrente: "bg-mint/20 text-olive",
  desconhecido: "bg-cream text-ink/50",
};

// Formata uma mensagem de prazo legível.
export function getFundDeadlineMessage(
  fund: FundDateFields,
  computedStatus: FundStatus
): string | null {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("pt-PT", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  if (computedStatus === "recorrente") return "Candidatura recorrente";
  if (computedStatus === "aberto" && fund.closes_at)
    return `Aberto até ${fmt(fund.closes_at)}`;
  if (computedStatus === "fechado" && fund.closes_at)
    return `Fechou em ${fmt(fund.closes_at)}`;
  if (computedStatus === "previsto" && fund.opens_at)
    return `Previsto para ${new Date(fund.opens_at).toLocaleDateString("pt-PT", {
      month: "long",
      year: "numeric",
    })}`;
  return null;
}

// Número de dias até uma data (negativo = já passou).
export function daysUntil(dateStr: string, now: Date = new Date()): number {
  const d = new Date(dateStr);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.ceil((d.getTime() - today.getTime()) / 86_400_000);
}
