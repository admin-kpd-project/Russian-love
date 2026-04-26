export function getAdultMaxDate(): string {
  const today = new Date();
  const d = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  return d.toISOString().split("T")[0];
}

export function ageFromBirthDate(iso: string | undefined, fallback: number): number {
  if (!iso) return fallback;
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return fallback;
  const today = new Date();
  let a = today.getFullYear() - d.getFullYear();
  const md = today.getMonth() - d.getMonth();
  if (md < 0 || (md === 0 && today.getDate() < d.getDate())) a -= 1;
  return a >= 0 ? a : fallback;
}
