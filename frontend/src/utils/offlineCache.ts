const OFFLINE_CACHE_KEYS = {
  recentlyViewed: 'janshayak_recently_viewed_offline_v1',
  documentChecklists: 'janshayak_document_checklists_v1',
};

export function readJsonSafe<T>(key: string, fallback: T): T {
  try {
    const stored = window.localStorage.getItem(key);
    if (!stored) return fallback;
    return JSON.parse(stored) as T;
  } catch {
    return fallback;
  }
}

export function writeJsonSafe<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage quota issues in restricted browser contexts
  }
}

export function getOfflineRecentlyViewed(): string[] {
  return readJsonSafe<string[]>(OFFLINE_CACHE_KEYS.recentlyViewed, []);
}

export function setOfflineRecentlyViewed(ids: string[]): void {
  writeJsonSafe(OFFLINE_CACHE_KEYS.recentlyViewed, ids.slice(0, 12));
}

export function getOfflineDocumentChecklist(schemeId: string): Record<number, boolean> {
  const parsed = readJsonSafe<Record<string, Record<number, boolean>>>(OFFLINE_CACHE_KEYS.documentChecklists, {});
  return parsed[schemeId] ?? {};
}

export function setOfflineDocumentChecklist(schemeId: string, checklist: Record<number, boolean>): void {
  const all = readJsonSafe<Record<string, Record<number, boolean>>>(OFFLINE_CACHE_KEYS.documentChecklists, {});
  all[schemeId] = checklist;
  writeJsonSafe(OFFLINE_CACHE_KEYS.documentChecklists, all);
}

export function clearOfflineCache(): void {
  Object.values(OFFLINE_CACHE_KEYS).forEach((key) => window.localStorage.removeItem(key));
}
