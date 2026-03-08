import { useState, useEffect, useCallback } from 'react';

const SETTINGS_KEY = 'exiva_settings';

export type ThemePreset = 'ember' | 'blood' | 'frost' | 'void' | 'poison';
export type IconPack = 'lucide' | 'tibia';

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
  theme: ThemePreset;
  iconPack: IconPack;
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
  theme: 'ember',
  iconPack: 'lucide',
};

export const THEME_PRESETS: Record<ThemePreset, { label: string; primary: string; accent: string; preview: string; vars: Record<string, string> }> = {
  ember: {
    label: '🔥 Ember',
    primary: '25 95% 50%',
    accent: '350 72% 45%',
    preview: '#f97316',
    vars: {
      '--primary': '25 95% 50%',
      '--accent': '350 72% 45%',
      '--ring': '25 95% 50%',
      '--sidebar-primary': '25 95% 50%',
      '--sidebar-ring': '25 95% 50%',
      '--neon-glow': '0 0 20px hsl(25 95% 50% / 0.3), 0 0 40px hsl(25 95% 50% / 0.1)',
      '--neon-glow-sm': '0 0 10px hsl(25 95% 50% / 0.2)',
      '--neon-text': '0 0 10px hsl(25 95% 50% / 0.5), 0 0 20px hsl(25 95% 50% / 0.3)',
    },
  },
  blood: {
    label: '🩸 Blood',
    primary: '0 72% 45%',
    accent: '340 65% 40%',
    preview: '#b91c1c',
    vars: {
      '--primary': '0 72% 45%',
      '--accent': '340 65% 40%',
      '--ring': '0 72% 45%',
      '--sidebar-primary': '0 72% 45%',
      '--sidebar-ring': '0 72% 45%',
      '--neon-glow': '0 0 20px hsl(0 72% 45% / 0.3), 0 0 40px hsl(0 72% 45% / 0.1)',
      '--neon-glow-sm': '0 0 10px hsl(0 72% 45% / 0.2)',
      '--neon-text': '0 0 10px hsl(0 72% 45% / 0.5), 0 0 20px hsl(0 72% 45% / 0.3)',
    },
  },
  frost: {
    label: '❄️ Frost',
    primary: '210 80% 55%',
    accent: '240 60% 50%',
    preview: '#3b82f6',
    vars: {
      '--primary': '210 80% 55%',
      '--accent': '240 60% 50%',
      '--ring': '210 80% 55%',
      '--sidebar-primary': '210 80% 55%',
      '--sidebar-ring': '210 80% 55%',
      '--neon-glow': '0 0 20px hsl(210 80% 55% / 0.3), 0 0 40px hsl(210 80% 55% / 0.1)',
      '--neon-glow-sm': '0 0 10px hsl(210 80% 55% / 0.2)',
      '--neon-text': '0 0 10px hsl(210 80% 55% / 0.5), 0 0 20px hsl(210 80% 55% / 0.3)',
    },
  },
  void: {
    label: '🌑 Void',
    primary: '272 72% 50%',
    accent: '290 60% 40%',
    preview: '#8b5cf6',
    vars: {
      '--primary': '272 72% 50%',
      '--accent': '290 60% 40%',
      '--ring': '272 72% 50%',
      '--sidebar-primary': '272 72% 50%',
      '--sidebar-ring': '272 72% 50%',
      '--neon-glow': '0 0 20px hsl(272 72% 50% / 0.3), 0 0 40px hsl(272 72% 50% / 0.1)',
      '--neon-glow-sm': '0 0 10px hsl(272 72% 50% / 0.2)',
      '--neon-text': '0 0 10px hsl(272 72% 50% / 0.5), 0 0 20px hsl(272 72% 50% / 0.3)',
    },
  },
  poison: {
    label: '☠️ Poison',
    primary: '142 70% 45%',
    accent: '160 60% 40%',
    preview: '#22c55e',
    vars: {
      '--primary': '142 70% 45%',
      '--accent': '160 60% 40%',
      '--ring': '142 70% 45%',
      '--sidebar-primary': '142 70% 45%',
      '--sidebar-ring': '142 70% 45%',
      '--neon-glow': '0 0 20px hsl(142 70% 45% / 0.3), 0 0 40px hsl(142 70% 45% / 0.1)',
      '--neon-glow-sm': '0 0 10px hsl(142 70% 45% / 0.2)',
      '--neon-text': '0 0 10px hsl(142 70% 45% / 0.5), 0 0 20px hsl(142 70% 45% / 0.3)',
    },
  },
};

export function applyTheme(theme: ThemePreset) {
  const preset = THEME_PRESETS[theme];
  if (!preset) return;
  const root = document.documentElement;
  Object.entries(preset.vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

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
