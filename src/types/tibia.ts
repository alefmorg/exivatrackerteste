// Types for the Exiva Manager Pro system

export interface GuildMember {
  name: string;
  level: number;
  vocation: string;
  status: 'online' | 'offline';
  lastLocation: string;
  annotation: string;
  lastUpdate: string;
}

export interface Guild {
  name: string;
  world: string;
  members: GuildMember[];
  lastFetch: string;
}

export type CharacterStatus = 'online' | 'afk' | 'offline';
export type CharacterActivity = 'hunt' | 'war' | 'maker' | 'boss' | '';

export interface Boneco {
  id: string;
  name: string;
  email: string;
  password: string;
  token: string;
  world: string;
  level: number;
  vocation: string;
  location: string;
  usedBy: string;
  status: CharacterStatus;
  activity: CharacterActivity;
  observations: string;
  lastAccess: string;
}

export interface UsageLog {
  id: string;
  bonecoId: string;
  bonecoName: string;
  user: string;
  action: 'login' | 'logout';
  timestamp: string;
  ip: string;
}

export interface MonitoredGuild {
  id: string;
  name: string;
  world: string;
  memberCount: number;
  lastUpdate: string;
}
