import { supabase } from '@/integrations/supabase/client';

export type MemberCategory = 'maker' | 'bomba' | 'main' | 'outros';

export interface LoginEntry {
  timestamp: string;
  status: 'online' | 'offline';
}

// ============================================================
// Monitored Guilds — now backed by Supabase
// ============================================================

export interface MonitoredGuild {
  id: string;
  name: string;
  world: string;
  member_count: number;
  last_update: string;
}

export async function getMonitoredGuildsAsync(): Promise<MonitoredGuild[]> {
  const { data } = await supabase.from('monitored_guilds').select('*').order('created_at', { ascending: true });
  return (data || []).map(g => ({
    id: g.id,
    name: g.name,
    world: g.world,
    member_count: g.member_count,
    last_update: g.last_update,
  }));
}

export async function addMonitoredGuildAsync(guild: { name: string; world: string }) {
  const { error } = await supabase.from('monitored_guilds').insert({
    name: guild.name,
    world: guild.world,
  });
  if (error) throw new Error(error.message);
}

export async function removeMonitoredGuildAsync(id: string) {
  const { error } = await supabase.from('monitored_guilds').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// Legacy sync functions — still used by some components as fallback
// These read from a local cache populated by async calls
let _guildsCache: MonitoredGuild[] = [];

export function setGuildsCache(guilds: MonitoredGuild[]) {
  _guildsCache = guilds;
}

export function getMonitoredGuilds(): MonitoredGuild[] {
  return _guildsCache;
}

// ============================================================
// Annotations — now backed by Supabase
// ============================================================

let _annotationsCache: Record<string, string> = {};

export function getAnnotations(): Record<string, string> {
  return _annotationsCache;
}

export function setAnnotationsCache(annotations: Record<string, string>) {
  _annotationsCache = annotations;
}

export async function loadAnnotations(): Promise<Record<string, string>> {
  const { data } = await supabase.from('member_annotations').select('char_name, annotation');
  const result: Record<string, string> = {};
  (data || []).forEach(r => { result[r.char_name] = r.annotation; });
  _annotationsCache = result;
  return result;
}

export async function saveAnnotationAsync(charName: string, annotation: string, userId?: string) {
  const { error } = await supabase.from('member_annotations').upsert(
    { char_name: charName, annotation, updated_by: userId || null, updated_at: new Date().toISOString() },
    { onConflict: 'char_name' }
  );
  if (error) throw new Error(error.message);
  _annotationsCache[charName] = annotation;
}

// Legacy
export function saveAnnotation(charName: string, annotation: string) {
  saveAnnotationAsync(charName, annotation).catch(console.error);
}

// ============================================================
// Categories — now backed by Supabase
// ============================================================

let _categoriesCache: Record<string, MemberCategory> = {};

export function getCategories(): Record<string, MemberCategory> {
  return _categoriesCache;
}

export function setCategoriesCache(cats: Record<string, MemberCategory>) {
  _categoriesCache = cats;
}

export async function loadCategories(): Promise<Record<string, MemberCategory>> {
  const { data } = await supabase.from('member_categories').select('char_name, category');
  const result: Record<string, MemberCategory> = {};
  (data || []).forEach(r => { result[r.char_name] = r.category as MemberCategory; });
  _categoriesCache = result;
  return result;
}

export async function saveCategoryAsync(charName: string, category: MemberCategory, userId?: string) {
  const { error } = await supabase.from('member_categories').upsert(
    { char_name: charName, category, updated_by: userId || null, updated_at: new Date().toISOString() },
    { onConflict: 'char_name' }
  );
  if (error) throw new Error(error.message);
  _categoriesCache[charName] = category;
}

export function saveCategory(charName: string, category: MemberCategory) {
  saveCategoryAsync(charName, category).catch(console.error);
}

// ============================================================
// Login History — now backed by Supabase
// ============================================================

export async function recordLoginChange(charName: string, status: 'online' | 'offline') {
  await supabase.from('login_history').insert({
    char_name: charName,
    status,
  });
}

export async function getTodayLoginsAsync(charName: string): Promise<LoginEntry[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { data } = await supabase
    .from('login_history')
    .select('status, recorded_at')
    .eq('char_name', charName)
    .gte('recorded_at', today.toISOString())
    .order('recorded_at', { ascending: true });
  return (data || []).map(r => ({ timestamp: r.recorded_at, status: r.status as 'online' | 'offline' }));
}

// Legacy sync — returns empty, use async version
export function getTodayLogins(charName: string): LoginEntry[] {
  return [];
}

// ============================================================
// Legacy re-exports for backward compat
// ============================================================

// These were used before but are no longer needed since bonecos are in Supabase
export function addMonitoredGuild(guild: any) {
  addMonitoredGuildAsync(guild).catch(console.error);
}

export function removeMonitoredGuild(id: string) {
  removeMonitoredGuildAsync(id).catch(console.error);
}
