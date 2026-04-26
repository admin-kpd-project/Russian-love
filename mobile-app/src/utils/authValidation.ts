import { normalizeRuPhone } from "./phone";

export function validateLoginIdentifier(raw: string): string | null {
  const t = raw.trim();
  if (!t) return "Введите email или телефон";
  if (t.includes("@")) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) return "Неверный формат email";
    return null;
  }
  if (!normalizeRuPhone(t)) return "Введите корректный номер (российский мобильный)";
  return null;
}

export function validateEmail(email: string): string | null {
  const t = email.trim();
  if (!t) return "Введите email";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) return "Неверный формат email";
  return null;
}
