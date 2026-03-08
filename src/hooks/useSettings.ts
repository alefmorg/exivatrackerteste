import { useState, useEffect, useCallback } from 'react';

const SETTINGS_KEY = 'exiva_settings';

export interface AppSettings {
  refreshInterval: number;
  maxDeaths: number;
  defaultWorld: string;
  showOfflineBonecos: boolean;
  compactMode: boolean;
  autoFetchDeaths: boolean;
  cardLayout: 'grid' | 'list';
  exivaColumns: 2 | 3 | 4;
  soundNotifications: boolean;
  toastNotifications: boolean;
  autoClaimReturn: boolean;
  showCredentials: boolean;
  showSkills: boolean;
  showQuests: boolean;
  showAcessos: boolean;
  dashboardRefresh: number;
  logLimit: number;
  animationsEnabled: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  refreshInterval: 60,
  maxDeaths: 30,
  defaultWorld: '',
  showOfflineBonecos: true,
  compactMode: false,
  autoFetchDeaths: true,
  cardLayout: 'grid',
  exivaColumns: 4,
  soundNotifications: true,
  toastNotifications: true,
  autoClaimReturn: false,
  showCredentials: true,
  showSkills: true,
  showQuests: true,
  showAcessos: true,
  dashboardRefresh: 30,
  logLimit: 50,
  animationsEnabled: true,
};

export function loadSettings(): AppSettings {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(s: AppSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  window.dispatchEvent(new Event('settings-changed'));
}

export function useSettings(): AppSettings {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  useEffect(() => {
    const handler = () => setSettings(loadSettings());
    window.addEventListener('settings-changed', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('settings-changed', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  return settings;
}
