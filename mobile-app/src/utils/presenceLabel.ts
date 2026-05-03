import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

const ONLINE_WINDOW_MS = 3 * 60 * 1000;

export function formatPeerPresenceLabel(lastSeenAtIso: string | null | undefined): string {
  if (!lastSeenAtIso || typeof lastSeenAtIso !== "string") {
    return "нет данных";
  }
  const t = new Date(lastSeenAtIso).getTime();
  if (Number.isNaN(t)) return "нет данных";
  if (Date.now() - t <= ONLINE_WINDOW_MS) return "онлайн";
  try {
    return `был(а) в сети ${formatDistanceToNow(new Date(lastSeenAtIso), { addSuffix: true, locale: ru })}`;
  } catch {
    return "нет данных";
  }
}
