import { UserProfile } from "./compatibilityAI";

export interface ScanEvent {
  id: string;
  scannedUserId: number; // ID пользователя, чей QR был сканирован
  scannerUserId: number; // ID пользователя, который сканировал
  scannerProfile: UserProfile; // Полный профиль сканирующего
  timestamp: number;
  compatibility: number;
  viewed: boolean; // Просмотрено ли уведомление сканируемым
}

const SCAN_EVENTS_KEY = "scan_events";

/**
 * Сохранить событие сканирования
 */
export function saveScanEvent(event: Omit<ScanEvent, "id" | "timestamp">): ScanEvent {
  const scanEvent: ScanEvent = {
    ...event,
    id: `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
  };

  const events = getScanEvents();
  events.push(scanEvent);
  
  try {
    localStorage.setItem(SCAN_EVENTS_KEY, JSON.stringify(events));
  } catch (error) {
    console.error("Error saving scan event:", error);
  }

  return scanEvent;
}

/**
 * Получить все события сканирования
 */
export function getScanEvents(): ScanEvent[] {
  try {
    const data = localStorage.getItem(SCAN_EVENTS_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading scan events:", error);
    return [];
  }
}

/**
 * Получить события для конкретного пользователя (кто сканировал его профиль)
 */
export function getScanEventsForUser(userId: number): ScanEvent[] {
  const events = getScanEvents();
  return events
    .filter(event => event.scannedUserId === userId)
    .sort((a, b) => b.timestamp - a.timestamp); // Новые сверху
}

/**
 * Получить непросмотренные события для пользователя
 */
export function getUnviewedScanEvents(userId: number): ScanEvent[] {
  const events = getScanEventsForUser(userId);
  return events.filter(event => !event.viewed);
}

/**
 * Отметить событие как просмотренное
 */
export function markScanEventAsViewed(eventId: string): void {
  const events = getScanEvents();
  const eventIndex = events.findIndex(e => e.id === eventId);
  
  if (eventIndex !== -1) {
    events[eventIndex].viewed = true;
    
    try {
      localStorage.setItem(SCAN_EVENTS_KEY, JSON.stringify(events));
    } catch (error) {
      console.error("Error updating scan event:", error);
    }
  }
}

/**
 * Отметить все события пользователя как просмотренные
 */
export function markAllScanEventsAsViewed(userId: number): void {
  const events = getScanEvents();
  let updated = false;
  
  events.forEach(event => {
    if (event.scannedUserId === userId && !event.viewed) {
      event.viewed = true;
      updated = true;
    }
  });
  
  if (updated) {
    try {
      localStorage.setItem(SCAN_EVENTS_KEY, JSON.stringify(events));
    } catch (error) {
      console.error("Error updating scan events:", error);
    }
  }
}

/**
 * Очистить старые события (старше 30 дней)
 */
export function cleanupOldScanEvents(): void {
  const events = getScanEvents();
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  
  const recentEvents = events.filter(event => event.timestamp > thirtyDaysAgo);
  
  try {
    localStorage.setItem(SCAN_EVENTS_KEY, JSON.stringify(recentEvents));
  } catch (error) {
    console.error("Error cleaning up scan events:", error);
  }
}
