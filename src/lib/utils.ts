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
