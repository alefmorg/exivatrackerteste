import { GuildMember } from '@/types/tibia';

interface TibiaDataGuildResponse {
  guild: {
    name: string;
    world: string;
    members: Array<{
      name: string;
      title: string;
      rank: string;
      vocation: string;
      level: number;
      joined: string;
      status: string;
    }>;
    invites: unknown[];
  };
  information: unknown;
}

interface TibiaDataCharResponse {
  character: {
    character: {
      name: string;
      title: string;
      sex: string;
      vocation: string;
      level: number;
      world: string;
      residence: string;
      last_login: string;
      account_status: string;
    };
  };
}

// Cache
const cache: Record<string, { data: unknown; timestamp: number }> = {};
const CACHE_TTL = 15000; // 15 seconds (reduced for fresher data)

function getCached<T>(key: string): T | null {
  const entry = cache[key];
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data as T;
  }
  return null;
}

function setCache(key: string, data: unknown) {
  cache[key] = { data, timestamp: Date.now() };
}

// Fetch online players from world endpoint (updates faster than guild endpoint)
async function fetchWorldOnlinePlayers(world: string): Promise<Set<string>> {
  const cacheKey = `world_online_${world}`;
  const cached = getCached<Set<string>>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(`https://api.tibiadata.com/v4/world/${encodeURIComponent(world)}`);
    if (!res.ok) return new Set();
    const data = await res.json();
    const onlinePlayers = new Set<string>(
      (data.world?.online_players || []).map((p: { name: string }) => p.name)
    );
    setCache(cacheKey, onlinePlayers);
    return onlinePlayers;
  } catch {
    return new Set();
  }
}

export async function fetchGuildMembers(guildName: string): Promise<GuildMember[]> {
  const cacheKey = `guild_${guildName}`;
  const cached = getCached<GuildMember[]>(cacheKey);
  if (cached) return cached;

  const res = await fetch(`https://api.tibiadata.com/v4/guild/${encodeURIComponent(guildName)}`);
  if (!res.ok) throw new Error('Falha ao buscar guild');

  const data: TibiaDataGuildResponse = await res.json();

  if (!data.guild?.members?.length) {
    throw new Error('Guild não encontrada ou sem membros');
  }

  const world = data.guild.world || '';

  // Cross-reference with world online list for more accurate status
  const worldOnline = world ? await fetchWorldOnlinePlayers(world) : new Set<string>();

  const members: GuildMember[] = data.guild.members.map(m => {
    // Use world endpoint as primary source if available, fallback to guild status
    const isOnline = worldOnline.size > 0
      ? worldOnline.has(m.name)
      : m.status === 'online';

    return {
      name: m.name,
      level: m.level,
      vocation: m.vocation,
      status: isOnline ? 'online' as const : 'offline' as const,
      lastLocation: '',
      annotation: '',
      lastUpdate: new Date().toLocaleTimeString('pt-BR'),
    };
  });

  setCache(cacheKey, members);
  return members;
}

export async function fetchCharacter(name: string) {
  const cacheKey = `char_${name}`;
  const cached = getCached<any>(cacheKey);
  if (cached) return cached;

  const res = await fetch(`https://api.tibiadata.com/v4/character/${encodeURIComponent(name)}`);
  if (!res.ok) throw new Error('Falha ao buscar personagem');

  const data: TibiaDataCharResponse = await res.json();
  const char = data.character;
  setCache(cacheKey, char);
  return char;
}

export interface CharacterDeath {
  name: string;
  level: number;
  killers: Array<{ name: string; player: boolean }>;
  time: string;
  reason: string;
}

export async function fetchCharacterDeaths(name: string): Promise<CharacterDeath[]> {
  // No cache for deaths — always fetch fresh
  const res = await fetch(`https://api.tibiadata.com/v4/character/${encodeURIComponent(name)}`);
  if (!res.ok) return [];

  const data = await res.json();
  const deaths: CharacterDeath[] = (data.character?.deaths || []).map((d: any) => ({
    name,
    level: d.level || 0,
    killers: d.killers || [],
    time: d.time || '',
    reason: d.reason || '',
  }));
  return deaths;
}

export async function fetchGuildMemberDeaths(
  members: string[],
  onProgress?: (loaded: number, total: number) => void
): Promise<CharacterDeath[]> {
  const allDeaths: CharacterDeath[] = [];
  const batchSize = 10;
  const total = members.length;

  for (let i = 0; i < total; i += batchSize) {
    const batch = members.slice(i, i + batchSize);
    const results = await Promise.allSettled(batch.map(name => fetchCharacterDeaths(name)));
    results.forEach(r => {
      if (r.status === 'fulfilled') allDeaths.push(...r.value);
    });
    onProgress?.(Math.min(i + batchSize, total), total);
    if (i + batchSize < total) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
  allDeaths.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  return allDeaths;
}

export function getGuildWorld(guildName: string): Promise<string> {
  return fetch(`https://api.tibiadata.com/v4/guild/${encodeURIComponent(guildName)}`)
    .then(r => r.json())
    .then(d => d.guild?.world || 'Unknown');
}

// XP calculation based on Tibia's official formula
export function calculateXpForLevel(level: number): number {
  if (level < 1) return 0;
  return Math.floor((50 / 3) * (Math.pow(level, 3) - 6 * Math.pow(level, 2) + 17 * level - 12));
}

export function calculateXpGain(fromLevel: number, toLevel: number): number {
  if (toLevel <= fromLevel) return 0;
  return calculateXpForLevel(toLevel) - calculateXpForLevel(fromLevel);
}

export function formatXp(xp: number): string {
  if (xp >= 1_000_000_000) return `${(xp / 1_000_000_000).toFixed(1)}B`;
  if (xp >= 1_000_000) return `${(xp / 1_000_000).toFixed(1)}M`;
  if (xp >= 1_000) return `${(xp / 1_000).toFixed(0)}K`;
  return xp.toString();
}
