import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, MapPin } from 'lucide-react';
import { fetchGuildMembers } from '@/lib/tibia-api';
import { getMonitoredGuildsAsync } from '@/lib/storage';
import { GuildMember } from '@/types/tibia';
import { VocationIcon } from '@/components/TibiaIcons';
import StatusDot from '@/components/StatusDot';
import PageHeader from '@/components/PageHeader';
import { useMapPins } from '@/hooks/useMapPins';
import { TIBIA_CITIES } from '@/lib/tibia-cities';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function MapaPage() {
  const [onlineMembers, setOnlineMembers] = useState<GuildMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const { pins, addPin, removePin, cleanOfflinePins } = useMapPins();

  // Fetch online guild members
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const guilds = await getMonitoredGuildsAsync();
        if (guilds.length > 0) {
          const members = await fetchGuildMembers(guilds[0].name);
          const online = members.filter(m => m.status === 'online');
          setOnlineMembers(online);
        }
      } catch { /* silent */ } finally {
        setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  // Clean offline pins whenever online members list updates
  useEffect(() => {
    if (onlineMembers.length === 0 && !loading) return;
    const onlineNames = new Set(onlineMembers.map(m => m.name));
    if (onlineNames.size > 0) {
      cleanOfflinePins(onlineNames);
    }
  }, [onlineMembers, cleanOfflinePins, loading]);

  // Group pins by city, only keep online ones
  const onlineNames = useMemo(() => new Set(onlineMembers.map(m => m.name)), [onlineMembers]);
  const memberMap = useMemo(() => {
    const map: Record<string, GuildMember> = {};
    for (const m of onlineMembers) map[m.name] = m;
    return map;
  }, [onlineMembers]);

  const cityGroups = useMemo(() => {
    const groups: Record<string, typeof pins> = {};
    TIBIA_CITIES.forEach(c => (groups[c.id] = []));
    for (const pin of pins) {
      if (onlineNames.has(pin.char_name) && groups[pin.city_id]) {
        groups[pin.city_id].push(pin);
      }
    }
    return groups;
  }, [pins, onlineNames]);

  const totalOnMap = useMemo(() =>
    Object.values(cityGroups).reduce((sum, arr) => sum + arr.length, 0),
  [cityGroups]);

  // Filtered members for adding (online + not already pinned)
  const pinnedNames = useMemo(() => new Set(pins.map(p => p.char_name)), [pins]);
  const filteredMembers = useMemo(() => {
    return onlineMembers.filter(m => {
      if (pinnedNames.has(m.name)) return false;
      if (!searchText) return true;
      return m.name.toLowerCase().includes(searchText.toLowerCase());
    });
  }, [onlineMembers, pinnedNames, searchText]);

  const handleAddMember = useCallback(async (name: string, cityId: string) => {
    await addPin(name, cityId);
    setSearchText('');
    toast.success(`${name} marcado no mapa`);
  }, [addPin]);

  const handleRemovePin = useCallback(async (name: string) => {
    await removePin(name);
    toast.success(`${name} removido do mapa`);
  }, [removePin]);

  const selectedCityData = TIBIA_CITIES.find(c => c.id === selectedCity);
  const selectedPins = selectedCity ? cityGroups[selectedCity] || [] : [];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Mapa"
        subtitle={
          <span>
            {totalOnMap} personagens no mapa · {onlineMembers.length} online na guild
          </span>
        }
        icon="compass"
      />

      {/* Map Container */}
      <div className="relative w-full aspect-[5/4] border border-border rounded-lg overflow-hidden select-none">
        {/* Real Tibia minimap background */}
        <img
          src="/tibia-world-map.png"
          alt="Tibia World Map"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ imageRendering: 'pixelated' }}
          draggable={false}
        />
        {/* Subtle overlay for pin readability */}
        <div className="absolute inset-0 bg-background/20" />

        {/* City pins */}
        {TIBIA_CITIES.map(city => {
          const count = cityGroups[city.id]?.length || 0;
          const isSelected = selectedCity === city.id;

          return (
            <motion.button
              key={city.id}
              className="absolute flex flex-col items-center gap-0.5 group cursor-pointer z-10"
              style={{ left: `${city.x}%`, top: `${city.y}%`, transform: 'translate(-50%, -50%)' }}
              onClick={() => {
                setSelectedCity(isSelected ? null : city.id);
                setAddingTo(null);
              }}
              onMouseEnter={() => setHoveredCity(city.id)}
              onMouseLeave={() => setHoveredCity(null)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Hover tooltip */}
              <AnimatePresence>
                {hoveredCity === city.id && count > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 z-30 bg-popover border border-border rounded px-2 py-1.5 shadow-lg min-w-[100px] max-w-[180px] pointer-events-none"
                  >
                    <div className="text-[8px] font-mono text-muted-foreground uppercase tracking-wider mb-1">{city.name}</div>
                    <div className="space-y-0.5">
                      {(cityGroups[city.id] || []).slice(0, 10).map(pin => (
                        <div key={pin.char_name} className="text-[10px] text-foreground truncate flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          {pin.char_name}
                          {memberMap[pin.char_name] && (
                            <span className="text-muted-foreground">Lv {memberMap[pin.char_name].level}</span>
                          )}
                        </div>
                      ))}
                      {count > 10 && <div className="text-[9px] text-muted-foreground">+{count - 10} mais</div>}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pulse ring */}
              {count > 0 && (
                <motion.div
                  className="absolute w-8 h-8 rounded-full"
                  style={{ backgroundColor: city.color, opacity: 0.15 }}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.15, 0, 0.15] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}

              {/* Pin */}
              <div className={`relative w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] transition-all ${
                isSelected
                  ? 'border-primary bg-primary/30 shadow-[0_0_12px_hsl(var(--primary)/0.5)]'
                  : count > 0
                  ? 'border-primary/60 bg-card'
                  : 'border-border bg-card/50'
              }`}>
                <span style={{ filter: count > 0 ? 'none' : 'grayscale(1) opacity(0.4)' }}>
                  {city.icon}
                </span>
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
              <span className={`text-[7px] font-mono leading-none whitespace-nowrap transition-colors ${
                isSelected ? 'text-primary font-bold' : count > 0 ? 'text-foreground/70' : 'text-muted-foreground/40'
              }`}>
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
                  <span className="text-[9px] text-muted-foreground font-mono">
                    {selectedCityData.region} · {selectedPins.length} personagens
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant={addingTo === selectedCity ? 'default' : 'outline'}
                  className="h-6 text-[10px] px-2"
                  onClick={() => setAddingTo(addingTo === selectedCity ? null : selectedCity)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Adicionar
                </Button>
                <button onClick={() => { setSelectedCity(null); setAddingTo(null); }} className="p-1 text-muted-foreground hover:text-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Add member form */}
            <AnimatePresence>
              {addingTo === selectedCity && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-b border-border overflow-hidden"
                >
                  <div className="p-2 space-y-1.5">
                    <Input
                      placeholder="Buscar membro online..."
                      value={searchText}
                      onChange={e => setSearchText(e.target.value)}
                      className="h-7 text-xs"
                    />
                    <div className="max-h-32 overflow-y-auto space-y-0.5">
                      {filteredMembers.length === 0 ? (
                        <div className="text-[10px] text-muted-foreground text-center py-2">
                          {searchText ? 'Nenhum membro encontrado' : 'Todos membros online já estão no mapa'}
                        </div>
                      ) : (
                        filteredMembers.slice(0, 20).map(m => (
                          <button
                            key={m.name}
                            onClick={() => handleAddMember(m.name, selectedCity!)}
                            className="flex items-center gap-2 w-full px-2 py-1 rounded hover:bg-secondary/50 transition-colors text-left"
                          >
                            <StatusDot status="online" />
                            <VocationIcon vocation={m.vocation} className="h-3.5 w-3.5" />
                            <span className="text-[10px] text-foreground flex-1 truncate">{m.name}</span>
                            <span className="text-[9px] text-muted-foreground font-mono">Lv {m.level}</span>
                            <MapPin className="h-3 w-3 text-primary" />
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pinned members */}
            {selectedPins.length === 0 && addingTo !== selectedCity ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                Nenhum personagem nesta cidade — clique em Adicionar
              </div>
            ) : (
              <div className="divide-y divide-border max-h-48 overflow-y-auto">
                {selectedPins.map(pin => {
                  const member = memberMap[pin.char_name];
                  return (
                    <div key={pin.char_name} className="flex items-center gap-2 px-3 py-1.5 hover:bg-secondary/30 transition-colors">
                      <StatusDot status="online" />
                      {member && <VocationIcon vocation={member.vocation} className="h-4 w-4" />}
                      <span className="text-[11px] font-medium text-foreground flex-1 truncate">{pin.char_name}</span>
                      {member && <span className="text-[9px] text-muted-foreground font-mono">Lv {member.level}</span>}
                      <button
                        onClick={() => handleRemovePin(pin.char_name)}
                        className="p-0.5 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
