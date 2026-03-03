import { Boneco, MonitoredGuild, UsageLog, GuildMember } from '@/types/tibia';

const STORAGE_KEYS = {
  BONECOS: 'exiva_bonecos',
  GUILDS: 'exiva_guilds',
  LOGS: 'exiva_logs',
  ANNOTATIONS: 'exiva_annotations',
  CATEGORIES: 'exiva_categories',
  LOGIN_HISTORY: 'exiva_login_history',
} as const;

export type MemberCategory = 'maker' | 'bomba' | 'main' | 'outros';

function load<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, data: unknown) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Bonecos
export function getBonecos(): Boneco[] {
  return load(STORAGE_KEYS.BONECOS, []);
}

export function saveBonecos(bonecos: Boneco[]) {
  save(STORAGE_KEYS.BONECOS, bonecos);
}

export function addBoneco(boneco: Boneco) {
  const list = getBonecos();
  list.push(boneco);
  saveBonecos(list);
}

export function updateBoneco(boneco: Boneco) {
  const list = getBonecos().map(b => b.id === boneco.id ? boneco : b);
  saveBonecos(list);
}

export function deleteBoneco(id: string) {
  saveBonecos(getBonecos().filter(b => b.id !== id));
}

// Guilds
export function getMonitoredGuilds(): MonitoredGuild[] {
  return load(STORAGE_KEYS.GUILDS, []);
}

export function saveMonitoredGuilds(guilds: MonitoredGuild[]) {
  save(STORAGE_KEYS.GUILDS, guilds);
}

export function addMonitoredGuild(guild: MonitoredGuild) {
  const list = getMonitoredGuilds();
  list.push(guild);
  saveMonitoredGuilds(list);
}

export function removeMonitoredGuild(id: string) {
  saveMonitoredGuilds(getMonitoredGuilds().filter(g => g.id !== id));
}

// Annotations (guild member annotations)
export function getAnnotations(): Record<string, string> {
  return load(STORAGE_KEYS.ANNOTATIONS, {});
}

export function saveAnnotation(charName: string, annotation: string) {
  const annotations = getAnnotations();
  annotations[charName] = annotation;
  save(STORAGE_KEYS.ANNOTATIONS, annotations);
}

// Logs
export function getLogs(): UsageLog[] {
  return load(STORAGE_KEYS.LOGS, []);
}

export function addLog(log: UsageLog) {
  const logs = getLogs();
  logs.unshift(log);
  if (logs.length > 500) logs.length = 500;
  save(STORAGE_KEYS.LOGS, logs);
}

// Categories (Maker, Bomba, Main, Outros)
export function getCategories(): Record<string, MemberCategory> {
  return load(STORAGE_KEYS.CATEGORIES, {});
}

export function saveCategory(charName: string, category: MemberCategory) {
  const cats = getCategories();
  cats[charName] = category;
  save(STORAGE_KEYS.CATEGORIES, cats);
}

// Login History
export interface LoginEntry {
  timestamp: string;
  status: 'online' | 'offline';
}

export function getLoginHistory(): Record<string, LoginEntry[]> {
  return load(STORAGE_KEYS.LOGIN_HISTORY, {});
}

export function recordLoginChange(charName: string, status: 'online' | 'offline') {
  const history = getLoginHistory();
  if (!history[charName]) history[charName] = [];
  const last = history[charName][history[charName].length - 1];
  // Only record if status changed
  if (!last || last.status !== status) {
    history[charName].push({ timestamp: new Date().toISOString(), status });
    // Keep last 100 entries per char
    if (history[charName].length > 100) history[charName] = history[charName].slice(-100);
    save(STORAGE_KEYS.LOGIN_HISTORY, history);
  }
}

export function getTodayLogins(charName: string): LoginEntry[] {
  const history = getLoginHistory();
  const entries = history[charName] || [];
  const today = new Date().toDateString();
  return entries.filter(e => new Date(e.timestamp).toDateString() === today);
}
