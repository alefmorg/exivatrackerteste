import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  customIcons: Record<string, string>;
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
  customIcons: {},
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

// ============================================================
// Local cache (fast reads) + Supabase sync (persistence)
// ============================================================

function loadLocalSettings(): AppSettings {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveLocalSettings(s: AppSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  window.dispatchEvent(new Event('settings-changed'));
}

/** Load settings from Supabase for the current user, merging with defaults */
async function loadRemoteSettings(userId: string): Promise<AppSettings | null> {
  const { data } = await supabase
    .from('user_settings')
    .select('settings')
    .eq('user_id', userId)
    .single();
  if (data?.settings && typeof data.settings === 'object') {
    return { ...DEFAULT_SETTINGS, ...(data.settings as Record<string, unknown>) } as AppSettings;
  }
  return null;
}

/** Save settings to Supabase for the current user */
async function saveRemoteSettings(userId: string, s: AppSettings) {
  await supabase
    .from('user_settings')
    .upsert(
      [{ user_id: userId, settings: s as unknown as Record<string, unknown>, updated_at: new Date().toISOString() }],
      { onConflict: 'user_id' }
    );
}

// ============================================================
// Public API — backward compatible
// ============================================================

/** @deprecated Use saveSettingsAsync instead */
export function loadSettings(): AppSettings {
  return loadLocalSettings();
}

/** Save settings locally + remotely (fire and forget for remote) */
export function saveSettings(s: AppSettings) {
  saveLocalSettings(s);
  // Async sync to remote — get user id from current session
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user?.id) {
      saveRemoteSettings(session.user.id, s).catch(console.error);
    }
  });
}

// ============================================================
// Hook
// ============================================================

export function useSettings(): AppSettings {
  const [settings, setSettings] = useState<AppSettings>(loadLocalSettings);
  const syncedRef = useRef(false);

  // On mount, try to load from remote and merge
  useEffect(() => {
    let cancelled = false;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled || !session?.user?.id) return;
      const userId = session.user.id;

      loadRemoteSettings(userId).then(remote => {
        if (cancelled) return;
        if (remote) {
          // Remote wins — update local cache
          saveLocalSettings(remote);
          setSettings(remote);
          applyTheme(remote.theme);
        } else {
          // No remote yet — push local to remote
          const local = loadLocalSettings();
          saveRemoteSettings(userId, local).catch(console.error);
        }
        syncedRef.current = true;
      });
    });

    return () => { cancelled = true; };
  }, []);

  // Listen for local changes (from saveSettings calls)
  useEffect(() => {
    const handler = () => setSettings(loadLocalSettings());
    window.addEventListener('settings-changed', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('settings-changed', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  return settings;
}
