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
const CACHE_TTL = 55000; // 55 seconds

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

  const members: GuildMember[] = data.guild.members.map(m => ({
    name: m.name,
    level: m.level,
    vocation: m.vocation,
    status: m.status === 'online' ? 'online' as const : 'offline' as const,
    lastLocation: '',
    annotation: '',
    lastUpdate: new Date().toLocaleTimeString('pt-BR'),
  }));

  setCache(cacheKey, members);
  return members;
}

export async function fetchCharacter(name: string) {
  const cacheKey = `char_${name}`;
  const cached = getCached<TibiaDataCharResponse['character']['character']>(cacheKey);
  if (cached) return cached;

  const res = await fetch(`https://api.tibiadata.com/v4/character/${encodeURIComponent(name)}`);
  if (!res.ok) throw new Error('Falha ao buscar personagem');

  const data: TibiaDataCharResponse = await res.json();
  const char = data.character.character;
  setCache(cacheKey, char);
  return char;
}

export function getGuildWorld(guildName: string): Promise<string> {
  return fetch(`https://api.tibiadata.com/v4/guild/${encodeURIComponent(guildName)}`)
    .then(r => r.json())
    .then(d => d.guild?.world || 'Unknown');
}
