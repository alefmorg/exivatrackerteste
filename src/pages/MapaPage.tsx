import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { fetchGuildMembers, fetchCharacter } from '@/lib/tibia-api';
import { getMonitoredGuildsAsync } from '@/lib/storage';
import { GuildMember } from '@/types/tibia';
import { VocationIcon, ItemSprite } from '@/components/TibiaIcons';
import StatusDot from '@/components/StatusDot';
import PageHeader from '@/components/PageHeader';
import { useSettings } from '@/hooks/useSettings';
import { supabase } from '@/integrations/supabase/client';

// ============================================================
// Tibia City definitions with approximate grid positions
// ============================================================

interface TibiaCity {
  id: string;
  name: string;
  region: string;
  x: number; // percentage position on map
  y: number;
  color: string;
  icon: string;
}

const TIBIA_CITIES: TibiaCity[] = [
  // Mainland
  { id: 'thais', name: 'Thais', region: 'Mainland', x: 30, y: 42, color: 'hsl(var(--primary))', icon: '🏰' },
  { id: 'carlin', name: 'Carlin', region: 'Mainland', x: 28, y: 18, color: 'hsl(210 80% 55%)', icon: '🏛️' },
  { id: 'venore', name: 'Venore', region: 'Mainland', x: 42, y: 48, color: 'hsl(142 70% 45%)', icon: '💰' },
  { id: 'ab_dendriel', name: "Ab'Dendriel", region: 'Mainland', x: 38, y: 22, color: 'hsl(120 60% 40%)', icon: '🌳' },
  { id: 'kazordoon', name: 'Kazordoon', region: 'Mainland', x: 35, y: 32, color: 'hsl(30 60% 45%)', icon: '⛏️' },
  { id: 'edron', name: 'Edron', region: 'Mainland', x: 52, y: 28, color: 'hsl(272 72% 50%)', icon: '🔮' },
  { id: 'darashia', name: 'Darashia', region: 'Desert', x: 68, y: 35, color: 'hsl(45 80% 50%)', icon: '🏜️' },
  { id: 'ankrahmun', name: 'Ankrahmun', region: 'Desert', x: 72, y: 50, color: 'hsl(35 70% 40%)', icon: '🏺' },
  { id: 'port_hope', name: 'Port Hope', region: 'Tiquanda', x: 55, y: 62, color: 'hsl(160 50% 40%)', icon: '🌴' },
  { id: 'liberty_bay', name: 'Liberty Bay', region: 'Tiquanda', x: 48, y: 72, color: 'hsl(200 60% 50%)', icon: '⚓' },
  { id: 'svargrond', name: 'Svargrond', region: 'Ice Islands', x: 18, y: 8, color: 'hsl(200 40% 70%)', icon: '❄️' },
  { id: 'yalahar', name: 'Yalahar', region: 'Mainland', x: 60, y: 12, color: 'hsl(0 50% 45%)', icon: '⚙️' },
  { id: 'gray_beach', name: 'Gray Beach', region: 'Roshamuul', x: 78, y: 18, color: 'hsl(0 0% 50%)', icon: '💀' },
  { id: 'roshamuul', name: 'Roshamuul', region: 'Roshamuul', x: 82, y: 25, color: 'hsl(280 40% 35%)', icon: '👹' },
  { id: 'issavi', name: 'Issavi', region: 'Kilmaresh', x: 85, y: 60, color: 'hsl(40 70% 55%)', icon: '🦁' },
  { id: 'marapur', name: 'Marapur', region: 'Marapur', x: 88, y: 42, color: 'hsl(180 60% 45%)', icon: '🐚' },
  { id: 'rathleton', name: 'Rathleton', region: 'Oramond', x: 15, y: 55, color: 'hsl(45 50% 45%)', icon: '🔧' },
  { id: 'feyrist', name: 'Feyrist', region: 'Feyrist', x: 22, y: 68, color: 'hsl(300 60% 60%)', icon: '🦋' },
  { id: 'gnomprona', name: 'Gnomprona', region: 'Underground', x: 10, y: 38, color: 'hsl(100 40% 35%)', icon: '🍄' },
];

// Match a boneco or member location string to a city
function matchCity(location: string): string | null {
  if (!location) return null;
  const lower = location.toLowerCase().trim();
  for (const city of TIBIA_CITIES) {
    if (lower.includes(city.name.toLowerCase()) || lower.includes(city.id.replace(/_/g, ' '))) {
      return city.id;
    }
  }
  return null;
}

interface BonecoOnMap {
  name: string;
  level: number;
  vocation: string;
  status: 'online' | 'offline' | 'afk';
  location: string;
  type: 'boneco' | 'guild';
}

export default function MapaPage() {
  const settings = useSettings();
  const [members, setMembers] = useState<GuildMember[]>([]);
  const [bonecos, setBonecos] = useState<BonecoOnMap[]>([]);
  const [guildOnMap, setGuildOnMap] = useState<BonecoOnMap[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingGuild, setLoadingGuild] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [showOnlineOnly, setShowOnlineOnly] = useState(true);

  // Fetch guild members + bonecos
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [guilds, { data: bonecosData }] = await Promise.all([
          getMonitoredGuildsAsync(),
          supabase.from('bonecos').select('name, level, vocation, status, location'),
        ]);

        // Guild members — fetch online ones' residence
        if (guilds.length > 0) {
          const guildMembers = await fetchGuildMembers(guilds[0].name);
          setMembers(guildMembers);

          // Fetch residence for online members in batches
          const onlineMembers = guildMembers.filter(m => m.status === 'online');
          if (onlineMembers.length > 0) {
            setLoadingGuild(true);
            const batchSize = 8;
            const results: BonecoOnMap[] = [];
            for (let i = 0; i < onlineMembers.length; i += batchSize) {
              const batch = onlineMembers.slice(i, i + batchSize);
              const settled = await Promise.allSettled(
                batch.map(async m => {
                  const charData = await fetchCharacter(m.name);
                  return {
                    name: m.name,
                    level: m.level,
                    vocation: m.vocation,
                    status: 'online' as const,
                    location: charData?.character?.residence || '',
                    type: 'guild' as const,
                  };
                })
              );
              for (const r of settled) {
                if (r.status === 'fulfilled') results.push(r.value);
              }
              if (i + batchSize < onlineMembers.length) {
                await new Promise(res => setTimeout(res, 400));
              }
            }
            setGuildOnMap(results);
            setLoadingGuild(false);
          }
        }

        // Bonecos from DB
        if (bonecosData) {
          setBonecos(
            bonecosData.map((b: any) => ({
              name: b.name,
              level: b.level,
              vocation: b.vocation,
              status: b.status as any,
              location: b.location || '',
              type: 'boneco' as const,
            }))
          );
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Group all characters by city
  const cityGroups = useMemo(() => {
    const groups: Record<string, BonecoOnMap[]> = {};
    TIBIA_CITIES.forEach(c => (groups[c.id] = []));
    groups['unknown'] = [];

    // Combine bonecos + guild members
    const allChars = [...bonecos, ...guildOnMap];
    // Deduplicate by name (boneco takes priority)
    const seen = new Set<string>();
    const deduped: BonecoOnMap[] = [];
    for (const c of allChars) {
      if (!seen.has(c.name)) {
        seen.add(c.name);
        deduped.push(c);
      }
    }

    for (const b of deduped) {
      if (showOnlineOnly && b.status === 'offline') continue;
      const cityId = matchCity(b.location);
      if (cityId) groups[cityId]?.push(b);
      else if (b.location) groups['unknown']?.push(b);
    }

    return groups;
  }, [bonecos, guildOnMap, showOnlineOnly]);

  const totalOnMap = useMemo(() => {
    return Object.values(cityGroups).reduce((sum, arr) => sum + arr.length, 0);
  }, [cityGroups]);

  const selectedCityData = TIBIA_CITIES.find(c => c.id === selectedCity);
  const selectedMembers = selectedCity ? cityGroups[selectedCity] || [] : [];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Mapa"
        subtitle={`${totalOnMap} personagens no mapa`}
        icon="compass"
      />

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={showOnlineOnly}
            onChange={e => setShowOnlineOnly(e.target.checked)}
            className="rounded border-border"
          />
          Apenas online
        </label>
        <span className="text-[10px] text-muted-foreground font-mono">
          {bonecos.length} bonecos carregados
        </span>
      </div>

      {/* Map Container */}
      <div className="relative w-full aspect-[16/10] bg-card border border-border rounded-lg overflow-hidden select-none">
        {/* Background grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Region labels */}
        {['Mainland', 'Desert', 'Ice Islands', 'Tiquanda', 'Roshamuul', 'Kilmaresh'].map(region => {
          const regionCities = TIBIA_CITIES.filter(c => c.region === region);
          if (!regionCities.length) return null;
          const avgX = regionCities.reduce((s, c) => s + c.x, 0) / regionCities.length;
          const avgY = regionCities.reduce((s, c) => s + c.y, 0) / regionCities.length;
          return (
            <div
              key={region}
              className="absolute text-[8px] font-mono text-muted-foreground/30 uppercase tracking-[0.3em] pointer-events-none"
              style={{ left: `${avgX}%`, top: `${avgY - 6}%`, transform: 'translateX(-50%)' }}
            >
              {region}
            </div>
          );
        })}

        {/* Connection lines between nearby cities */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          {[
            ['thais', 'venore'], ['thais', 'kazordoon'], ['kazordoon', 'ab_dendriel'],
            ['ab_dendriel', 'carlin'], ['edron', 'ab_dendriel'], ['venore', 'port_hope'],
            ['port_hope', 'liberty_bay'], ['darashia', 'ankrahmun'], ['edron', 'darashia'],
            ['yalahar', 'edron'], ['gray_beach', 'roshamuul'], ['carlin', 'svargrond'],
          ].map(([a, b]) => {
            const ca = TIBIA_CITIES.find(c => c.id === a);
            const cb = TIBIA_CITIES.find(c => c.id === b);
            if (!ca || !cb) return null;
            return (
              <line
                key={`${a}-${b}`}
                x1={ca.x} y1={ca.y} x2={cb.x} y2={cb.y}
                stroke="hsl(var(--border))"
                strokeWidth="0.15"
                strokeDasharray="0.5,0.5"
              />
            );
          })}
        </svg>

        {/* City pins */}
        {TIBIA_CITIES.map(city => {
          const count = cityGroups[city.id]?.length || 0;
          const isSelected = selectedCity === city.id;

          return (
            <motion.button
              key={city.id}
              className={`absolute flex flex-col items-center gap-0.5 group cursor-pointer z-10`}
              style={{ left: `${city.x}%`, top: `${city.y}%`, transform: 'translate(-50%, -50%)' }}
              onClick={() => setSelectedCity(isSelected ? null : city.id)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Pulse ring for cities with members */}
              {count > 0 && (
                <motion.div
                  className="absolute w-8 h-8 rounded-full"
                  style={{ backgroundColor: `${city.color}`, opacity: 0.15 }}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.15, 0, 0.15] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}

              {/* Pin */}
              <div
                className={`relative w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/30 shadow-[0_0_12px_hsl(var(--primary)/0.5)]'
                    : count > 0
                    ? 'border-primary/60 bg-card'
                    : 'border-border bg-card/50'
                }`}
              >
                <span style={{ filter: count > 0 ? 'none' : 'grayscale(1) opacity(0.4)' }}>
                  {city.icon}
                </span>

                {/* Count badge */}
                {count > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] rounded-full bg-primary text-primary-foreground text-[8px] font-bold flex items-center justify-center px-0.5"
                  >
                    {count}
                  </motion.div>
                )}
              </div>

              {/* City name */}
              <span
                className={`text-[7px] font-mono leading-none whitespace-nowrap transition-colors ${
                  isSelected ? 'text-primary font-bold' : count > 0 ? 'text-foreground/70' : 'text-muted-foreground/40'
                }`}
              >
                {city.name}
              </span>
            </motion.button>
          );
        })}

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-20">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-mono">Carregando mapa...</span>
            </div>
          </div>
        )}
      </div>

      {/* Selected City Panel */}
      <AnimatePresence>
        {selectedCity && selectedCityData && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="bg-card border border-border rounded-lg overflow-hidden"
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-secondary/30">
              <div className="flex items-center gap-2">
                <span className="text-base">{selectedCityData.icon}</span>
                <div>
                  <h3 className="text-xs font-bold text-foreground">{selectedCityData.name}</h3>
                  <span className="text-[9px] text-muted-foreground font-mono">{selectedCityData.region} · {selectedMembers.length} personagens</span>
                </div>
              </div>
              <button onClick={() => setSelectedCity(null)} className="p-1 text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {selectedMembers.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                Nenhum personagem nesta cidade
              </div>
            ) : (
              <div className="divide-y divide-border max-h-48 overflow-y-auto">
                {selectedMembers.map(member => (
                  <div key={member.name} className="flex items-center gap-2 px-3 py-1.5 hover:bg-secondary/30 transition-colors">
                    <StatusDot status={member.status === 'online' ? 'online' : 'offline'} />
                    <VocationIcon vocation={member.vocation} className="h-4 w-4" />
                    <span className="text-[11px] font-medium text-foreground flex-1 truncate">{member.name}</span>
                    <span className="text-[9px] text-muted-foreground font-mono">Lv {member.level}</span>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono ${
                      member.type === 'boneco' ? 'bg-primary/15 text-primary' : 'bg-secondary text-muted-foreground'
                    }`}>
                      {member.type === 'boneco' ? 'Boneco' : 'Guild'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unknown locations */}
      {cityGroups['unknown']?.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-3">
          <h4 className="text-[10px] font-mono text-muted-foreground mb-2 uppercase tracking-wider">
            📍 Localização não mapeada ({cityGroups['unknown'].length})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {cityGroups['unknown'].map(m => (
              <div key={m.name} className="flex items-center gap-1 px-2 py-1 rounded bg-secondary/50 text-[10px]">
                <StatusDot status={m.status === 'online' ? 'online' : 'offline'} />
                <span className="text-foreground">{m.name}</span>
                <span className="text-muted-foreground">({m.location})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
