/**
 * Local storage manager for QR history and user preferences
 */

import { QRType } from '../qr/formats';

export interface HistoryItem {
  id: string;
  type: QRType;
  title: string;
  snippet: string;
  payload: string;
  formData: Record<string, any>;
  createdAt: number;
}

const HISTORY_KEY = 'qr_studio_history';
const SETTINGS_KEY = 'qr_studio_settings';
const THEME_KEY = 'qr_studio_theme';

export interface AppSettings {
  omitSensitive: boolean; // Do not save sensitive details like WiFi passwords
}

const DEFAULT_SETTINGS: AppSettings = {
  omitSensitive: false
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {}
}

export function loadHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveHistoryItem(item: Omit<HistoryItem, 'id' | 'createdAt'>): HistoryItem[] {
  try {
    const settings = loadSettings();
    const history = loadHistory();

    // Sanitize if omitSensitive is on
    const safeFormData = { ...item.formData };
    if (settings.omitSensitive && item.type === 'wifi') {
      safeFormData.password = '';
    }

    const newItem: HistoryItem = {
      ...item,
      formData: safeFormData,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now()
    };

    // Filter duplicates by identical payload, keep newest
    const filtered = history.filter(h => h.payload !== newItem.payload);
    const updated = [newItem, ...filtered].slice(0, 20); // Keep max 20

    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function deleteHistoryItem(id: string): HistoryItem[] {
  try {
    const history = loadHistory().filter(h => h.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    return history;
  } catch {
    return [];
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {}
}

export type ThemeMode = 'light' | 'dark' | 'system';

export function getStoredTheme(): ThemeMode {
  return (localStorage.getItem(THEME_KEY) as ThemeMode) || 'system';
}

export function setStoredTheme(theme: ThemeMode): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {}
}

export function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}
