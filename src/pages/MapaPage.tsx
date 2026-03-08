import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Search } from 'lucide-react';
import { fetchGuildMembers } from '@/lib/tibia-api';
import { getMonitoredGuildsAsync } from '@/lib/storage';
import { GuildMember } from '@/types/tibia';
import { VocationIcon } from '@/components/TibiaIcons';
import StatusDot from '@/components/StatusDot';
import PageHeader from '@/components/PageHeader';
import { useMapPins, MapPin } from '@/hooks/useMapPins';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface ClickPopup {
  x: number; // percentage on map
  y: number;
  screenX: number; // pixel position for popup
  screenY: number;
}

export default function MapaPage() {
  const [onlineMembers, setOnlineMembers] = useState<GuildMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredPin, setHoveredPin] = useState<string | null>(null);
  const [clickPopup, setClickPopup] = useState<ClickPopup | null>(null);
  const [searchText, setSearchText] = useState('');
  const mapRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const { pins, addPin, removePin, cleanOfflinePins } = useMapPins();

  // Fetch online guild members
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const guilds = await getMonitoredGuildsAsync();
        if (guilds.length > 0) {
          const members = await fetchGuildMembers(guilds[0].name);
          setOnlineMembers(members.filter(m => m.status === 'online'));
        }
      } catch { /* silent */ } finally {
        setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  // Clean offline pins
  useEffect(() => {
    if (onlineMembers.length === 0 && !loading) return;
    const onlineNames = new Set(onlineMembers.map(m => m.name));
    if (onlineNames.size > 0) cleanOfflinePins(onlineNames);
  }, [onlineMembers, cleanOfflinePins, loading]);

  const onlineNames = useMemo(() => new Set(onlineMembers.map(m => m.name)), [onlineMembers]);
  const memberMap = useMemo(() => {
    const map: Record<string, GuildMember> = {};
    for (const m of onlineMembers) map[m.name] = m;
    return map;
  }, [onlineMembers]);

  // Only show online pins
  const visiblePins = useMemo(() => pins.filter(p => onlineNames.has(p.char_name)), [pins, onlineNames]);

  const totalOnMap = visiblePins.length;

  const pinnedNames = useMemo(() => new Set(pins.map(p => p.char_name)), [pins]);
  const filteredMembers = useMemo(() => {
    return onlineMembers.filter(m => {
      if (pinnedNames.has(m.name)) return false;
      if (!searchText) return true;
      return m.name.toLowerCase().includes(searchText.toLowerCase());
    });
  }, [onlineMembers, pinnedNames, searchText]);

  const handleMapClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current) return;
    // Don't open popup if clicking on an existing pin
    const target = e.target as HTMLElement;
    if (target.closest('[data-pin]')) return;

    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Screen position for popup (relative to map container)
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    setClickPopup({ x, y, screenX, screenY });
    setSearchText('');
    setTimeout(() => searchRef.current?.focus(), 100);
  }, []);

  const handleAddMember = useCallback(async (name: string) => {
    if (!clickPopup) return;
    await addPin(name, clickPopup.x, clickPopup.y);
    setClickPopup(null);
    setSearchText('');
    toast.success(`${name} marcado no mapa`);
  }, [addPin, clickPopup]);

  const handleRemovePin = useCallback(async (e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    await removePin(name);
    toast.success(`${name} removido do mapa`);
  }, [removePin]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Mapa"
        subtitle={
          <span>
            {totalOnMap} personagens no mapa · {onlineMembers.length} online na guild
            <span className="ml-2 text-[10px] text-muted-foreground/60">(clique no mapa para adicionar)</span>
          </span>
        }
        icon="compass"
      />

      {/* Map Container */}
      <div
        ref={mapRef}
        className="relative w-full aspect-[5/4] border border-border rounded-lg overflow-hidden select-none cursor-crosshair"
        onClick={handleMapClick}
      >
        {/* Real Tibia minimap background */}
        <img
          src="/tibia-world-map.png"
          alt="Tibia World Map"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ imageRendering: 'pixelated' }}
          draggable={false}
        />
        {/* Subtle overlay */}
        <div className="absolute inset-0 bg-background/15 pointer-events-none" />

        {/* Placed pins */}
        {visiblePins.map(pin => {
          const member = memberMap[pin.char_name];
          const isHovered = hoveredPin === pin.char_name;

          return (
            <div
              key={pin.id}
              data-pin
              className="absolute z-10 flex flex-col items-center"
              style={{ left: `${pin.pos_x}%`, top: `${pin.pos_y}%`, transform: 'translate(-50%, -100%)' }}
              onMouseEnter={() => setHoveredPin(pin.char_name)}
              onMouseLeave={() => setHoveredPin(null)}
            >
              {/* Hover card */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 z-30 bg-popover/95 backdrop-blur border border-border rounded px-2 py-1.5 shadow-lg min-w-[120px] pointer-events-none"
                  >
                    <div className="flex items-center gap-1.5">
                      <StatusDot status="online" />
                      {member && <VocationIcon vocation={member.vocation} className="h-3.5 w-3.5" />}
                      <span className="text-[10px] font-medium text-foreground whitespace-nowrap">{pin.char_name}</span>
                    </div>
                    {member && (
                      <div className="text-[9px] text-muted-foreground font-mono mt-0.5">
                        Lv {member.level} · {member.vocation}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pin marker */}
              <div className="relative group cursor-pointer" data-pin>
                {/* Pulse */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary"
                  animate={{ scale: [1, 2, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ width: 12, height: 12, margin: 'auto', top: 0, left: 0, right: 0, bottom: 0 }}
                />
                {/* Dot */}
                <div className="w-3 h-3 rounded-full bg-primary border-2 border-primary-foreground shadow-[0_0_6px_hsl(var(--primary)/0.6)]" />
                {/* Remove button on hover */}
                <button
                  data-pin
                  onClick={(e) => handleRemovePin(e, pin.char_name)}
                  className="absolute -top-1 -right-2.5 w-3.5 h-3.5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-2 w-2" />
                </button>
              </div>

              {/* Name label */}
              <span className="text-[7px] font-mono text-foreground bg-background/70 px-1 rounded mt-0.5 whitespace-nowrap leading-tight">
                {pin.char_name}
              </span>
            </div>
          );
        })}

        {/* Click popup - member search */}
        <AnimatePresence>
          {clickPopup && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute z-20 bg-popover/95 backdrop-blur border border-border rounded-lg shadow-xl w-56"
              style={{
                left: `${Math.min(clickPopup.screenX, (mapRef.current?.clientWidth || 300) - 230)}px`,
                top: `${Math.min(clickPopup.screenY, (mapRef.current?.clientHeight || 300) - 200)}px`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-border">
                <Search className="h-3 w-3 text-muted-foreground shrink-0" />
                <Input
                  ref={searchRef}
                  placeholder="Buscar membro online..."
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  className="h-6 text-[10px] border-0 bg-transparent p-0 focus-visible:ring-0 shadow-none"
                />
                <button
                  onClick={() => setClickPopup(null)}
                  className="p-0.5 text-muted-foreground hover:text-foreground shrink-0"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              <div className="max-h-40 overflow-y-auto p-1">
                {filteredMembers.length === 0 ? (
                  <div className="text-[10px] text-muted-foreground text-center py-3">
                    {searchText ? 'Nenhum membro encontrado' : 'Todos membros online já estão no mapa'}
                  </div>
                ) : (
                  filteredMembers.slice(0, 15).map(m => (
                    <button
                      key={m.name}
                      onClick={() => handleAddMember(m.name)}
                      className="flex items-center gap-1.5 w-full px-2 py-1 rounded hover:bg-secondary/50 transition-colors text-left"
                    >
                      <StatusDot status="online" />
                      <VocationIcon vocation={m.vocation} className="h-3 w-3" />
                      <span className="text-[10px] text-foreground flex-1 truncate">{m.name}</span>
                      <span className="text-[8px] text-muted-foreground font-mono">Lv {m.level}</span>
                    </button>
                  ))
                )}
              </div>
              {/* Pin preview indicator */}
              <div className="px-2 py-1 border-t border-border">
                <div className="text-[8px] text-muted-foreground font-mono">
                  📍 {clickPopup.x.toFixed(1)}%, {clickPopup.y.toFixed(1)}%
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Click indicator dot */}
        {clickPopup && (
          <div
            className="absolute z-15 w-2 h-2 rounded-full bg-primary/60 border border-primary animate-pulse pointer-events-none"
            style={{ left: `${clickPopup.x}%`, top: `${clickPopup.y}%`, transform: 'translate(-50%, -50%)' }}
          />
        )}

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

      {/* Summary of pinned members */}
      {visiblePins.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-2">
          <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider mb-1.5 px-1">
            Personagens no mapa ({visiblePins.length})
          </div>
          <div className="flex flex-wrap gap-1">
            {visiblePins.map(pin => {
              const member = memberMap[pin.char_name];
              return (
                <div
                  key={pin.id}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-secondary/50 text-[10px] group"
                >
                  <StatusDot status="online" />
                  {member && <VocationIcon vocation={member.vocation} className="h-3 w-3" />}
                  <span className="text-foreground">{pin.char_name}</span>
                  {member && <span className="text-muted-foreground font-mono">Lv {member.level}</span>}
                  <button
                    onClick={() => removePin(pin.char_name)}
                    className="p-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-2.5 w-2.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
