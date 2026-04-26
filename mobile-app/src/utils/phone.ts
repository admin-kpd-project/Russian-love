/** Как на бэкенде: +7XXXXXXXXXX или null ([web/app/utils/phone.ts](web/app/utils/phone.ts)) */
export function normalizeRuPhone(s: string): string | null {
  if (!s?.trim()) return null;
  const d = s.replace(/\D/g, "");
  let n = d;
  if (n.length === 11 && n[0] === "8") n = "7" + n.slice(1);
  if (n.length === 10) n = "7" + n;
  if (n.length === 11 && n[0] === "7") return `+${n}`;
  return null;
}
