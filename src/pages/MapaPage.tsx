import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Search, ZoomIn, ZoomOut, Maximize, Radar, ChevronDown, ChevronUp, Crosshair, Camera, Settings2, Save, RotateCcw } from 'lucide-react';
import { fetchGuildMembers } from '@/lib/tibia-api';
import { getMonitoredGuildsAsync } from '@/lib/storage';
import { GuildMember } from '@/types/tibia';
import { TIBIA_CITIES, TibiaCity } from '@/lib/tibia-cities';
import { VocationIcon, ItemSprite } from '@/components/TibiaIcons';
import StatusDot from '@/components/StatusDot';
import PageHeader from '@/components/PageHeader';
import { useMapPins, MapPin } from '@/hooks/useMapPins';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

// Load/save city position overrides from localStorage
const CITY_OVERRIDES_KEY = 'tibia-city-position-overrides';
function loadCityOverrides(): Record<string, { x: number; y: number }> {
  try {
    const stored = localStorage.getItem(CITY_OVERRIDES_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch { return {}; }
}
function saveCityOverrides(overrides: Record<string, { x: number; y: number }>) {
  localStorage.setItem(CITY_OVERRIDES_KEY, JSON.stringify(overrides));
}

interface ClickPopup {
  x: number;
  y: number;
  screenX: number;
  screenY: number;
}

export default function MapaPage() {
  const [onlineMembers, setOnlineMembers] = useState<GuildMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredPin, setHoveredPin] = useState<string | null>(null);
  const [clickPopup, setClickPopup] = useState<ClickPopup | null>(null);
  const [searchText, setSearchText] = useState('');
  const [exporting, setExporting] = useState(false);
  const [mapAspectRatio, setMapAspectRatio] = useState(5 / 4);
  const mapRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const { pins, addPin, removePin, cleanOfflinePins } = useMapPins();

  // Zoom & pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const dragMoved = useRef(false);
  const touchStartDistance = useRef(0);
  const touchStartZoom = useRef(1);

  // City label edit mode
  const [editMode, setEditMode] = useState(false);
  const [cityOverrides, setCityOverrides] = useState<Record<string, { x: number; y: number }>>(loadCityOverrides);
  const [draggingCity, setDraggingCity] = useState<string | null>(null);
  const cityDragStart = useRef({ x: 0, y: 0, cityX: 0, cityY: 0 });

  const getCityPosition = useCallback((city: TibiaCity) => {
    const override = cityOverrides[city.id];
    return override || { x: city.x, y: city.y };
  }, [cityOverrides]);

  const handleSaveCityPositions = useCallback(() => {
    saveCityOverrides(cityOverrides);
    toast.success('Posições das cidades salvas!');
  }, [cityOverrides]);

  const handleResetCityPositions = useCallback(() => {
    setCityOverrides({});
    localStorage.removeItem(CITY_OVERRIDES_KEY);
    toast.success('Posições resetadas para o padrão');
  }, []);

  const MIN_ZOOM = 1;
  const MAX_ZOOM = 6;

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        setMapAspectRatio(img.naturalWidth / img.naturalHeight);
      }
    };
    img.src = '/tibia-world-map.png';
  }, []);

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
    const interval = setInterval(load, 30000);
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

  const clampPan = useCallback((px: number, py: number, z: number) => {
    if (z <= 1) return { x: 0, y: 0 };
    const container = mapRef.current;
    if (!container) return { x: px, y: py };
    const w = container.clientWidth;
    const h = container.clientHeight;
    const maxX = (w * z - w) / 2;
    const maxY = (h * z - h) / 2;
    return {
      x: Math.max(-maxX, Math.min(maxX, px)),
      y: Math.max(-maxY, Math.min(maxY, py)),
    };
  }, []);

  // Wheel zoom disabled per user request

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom <= 1) return;
    const target = e.target as HTMLElement;
    if (target.closest('[data-pin]') || target.closest('[data-popup]') || target.closest('[data-city]')) return;
    setIsDragging(true);
    dragMoved.current = false;
    dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
    e.preventDefault();
  }, [zoom, pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    // Handle city label dragging
    if (draggingCity && mapRef.current) {
      const rect = mapRef.current.getBoundingClientRect();
      const dx = (e.clientX - cityDragStart.current.x) / rect.width * 100 / zoom;
      const dy = (e.clientY - cityDragStart.current.y) / rect.height * 100 / zoom;
      const newX = Math.max(0, Math.min(100, cityDragStart.current.cityX + dx));
      const newY = Math.max(0, Math.min(100, cityDragStart.current.cityY + dy));
      setCityOverrides(prev => ({ ...prev, [draggingCity]: { x: newX, y: newY } }));
      return;
    }
    
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragMoved.current = true;
    setPan(clampPan(dragStart.current.panX + dx, dragStart.current.panY + dy, zoom));
  }, [isDragging, zoom, clampPan, draggingCity]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDraggingCity(null);
  }, []);

  // Touch handlers for mobile
  const getTouchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-pin]') || target.closest('[data-popup]')) return;

    if (e.touches.length === 2) {
      // Pinch-to-zoom start
      touchStartDistance.current = getTouchDistance(e.touches);
      touchStartZoom.current = zoom;
      e.preventDefault();
    } else if (e.touches.length === 1 && zoom > 1) {
      // Pan start
      setIsDragging(true);
      dragMoved.current = false;
      dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, panX: pan.x, panY: pan.y };
    }
  }, [zoom, pan]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch-to-zoom
      e.preventDefault();
      const dist = getTouchDistance(e.touches);
      if (touchStartDistance.current > 0) {
        const scale = dist / touchStartDistance.current;
        const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, touchStartZoom.current * scale));
        setZoom(newZoom);
        if (newZoom <= 1) setPan({ x: 0, y: 0 });
      }
    } else if (e.touches.length === 1 && isDragging) {
      // Pan
      const dx = e.touches[0].clientX - dragStart.current.x;
      const dy = e.touches[0].clientY - dragStart.current.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragMoved.current = true;
      setPan(clampPan(dragStart.current.panX + dx, dragStart.current.panY + dy, zoom));
    }
  }, [isDragging, zoom, clampPan]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      touchStartDistance.current = 0;
    }
    if (e.touches.length === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleMapClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (dragMoved.current) return;
    if (editMode) return;
    if (!mapRef.current) return;
    const target = e.target as HTMLElement;
    if (target.closest('[data-pin]') || target.closest('[data-popup]')) return;

    const rect = mapRef.current.getBoundingClientRect();
    const containerX = e.clientX - rect.left;
    const containerY = e.clientY - rect.top;
    const mapX = ((containerX - rect.width / 2 - pan.x) / zoom + rect.width / 2) / rect.width * 100;
    const mapY = ((containerY - rect.height / 2 - pan.y) / zoom + rect.height / 2) / rect.height * 100;

    setClickPopup({ x: mapX, y: mapY, screenX: containerX, screenY: containerY });
    setSearchText('');
    setTimeout(() => searchRef.current?.focus(), 100);
  }, [zoom, pan]);

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

  const handleExportScreenshot = useCallback(async () => {
    if (!mapRef.current) return;
    setExporting(true);
    try {
      // Temporarily hide animated pulse elements and popups for clean screenshot
      const pulses = mapRef.current.querySelectorAll('[style*="animation"], .animate-pulse');
      const popups = mapRef.current.querySelectorAll('[data-popup]');
      const zoomControls = mapRef.current.querySelector('.absolute.top-2.right-2');
      
      pulses.forEach(el => (el as HTMLElement).style.visibility = 'hidden');
      popups.forEach(el => (el as HTMLElement).style.visibility = 'hidden');
      if (zoomControls) (zoomControls as HTMLElement).style.visibility = 'hidden';

      const canvas = await html2canvas(mapRef.current, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#1a1a1a',
        scale: 2,
        logging: false,
        onclone: (clonedDoc) => {
          // Fix framer-motion animated elements in clone
          const motionDivs = clonedDoc.querySelectorAll('[style*="opacity"]');
          motionDivs.forEach(el => {
            const htmlEl = el as HTMLElement;
            if (htmlEl.style.opacity === '0') htmlEl.remove();
          });
        },
      });
      
      // Restore visibility
      pulses.forEach(el => (el as HTMLElement).style.visibility = '');
      popups.forEach(el => (el as HTMLElement).style.visibility = '');
      if (zoomControls) (zoomControls as HTMLElement).style.visibility = '';

      const link = document.createElement('a');
      link.download = `mapa-tibia-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('Screenshot exportado!');
    } catch {
      toast.error('Erro ao exportar screenshot');
    } finally {
      setExporting(false);
    }
  }, []);

  const zoomIn = useCallback(() => {
    setZoom(prev => Math.min(MAX_ZOOM, prev + 0.5));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom(prev => {
      const next = Math.max(MIN_ZOOM, prev - 0.5);
      if (next <= 1) setPan({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const [radarOpen, setRadarOpen] = useState(true);

  const centerOnPin = useCallback((pin: MapPin) => {
    const container = mapRef.current;
    if (!container) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    const targetZoom = Math.max(zoom, 2.5);
    const pinPxX = (pin.pos_x / 100) * w;
    const pinPxY = (pin.pos_y / 100) * h;
    const centerX = w / 2;
    const centerY = h / 2;
    const newPanX = (centerX - pinPxX) * targetZoom;
    const newPanY = (centerY - pinPxY) * targetZoom;
    setZoom(targetZoom);
    setPan(clampPan(newPanX, newPanY, targetZoom));
  }, [zoom, clampPan]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <PageHeader
          title="Mapa"
          subtitle={
            <span>
              {totalOnMap} personagens no mapa · {onlineMembers.length} online na guild
              {!editMode && <span className="ml-2 text-[10px] text-muted-foreground/60">(clique no mapa para adicionar)</span>}
              {editMode && <span className="ml-2 text-[10px] text-primary font-semibold">(MODO EDIÇÃO: arraste os nomes das cidades)</span>}
            </span>
          }
          icon="compass"
        />
        <div className="flex items-center gap-1.5">
          {editMode && (
            <>
              <button
                onClick={handleSaveCityPositions}
                className="flex items-center gap-1 px-2 py-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium transition-colors"
              >
                <Save className="h-3.5 w-3.5" />
                Salvar
              </button>
              <button
                onClick={handleResetCityPositions}
                className="flex items-center gap-1 px-2 py-1.5 rounded-md bg-secondary hover:bg-secondary/80 text-foreground text-xs font-medium transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            </>
          )}
          <button
            onClick={() => setEditMode(!editMode)}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${editMode ? 'bg-primary/20 text-primary ring-1 ring-primary' : 'bg-secondary hover:bg-secondary/80 text-foreground'}`}
          >
            <Settings2 className="h-3.5 w-3.5" />
            {editMode ? 'Sair' : 'Editar Cidades'}
          </button>
          <button
            onClick={handleExportScreenshot}
            disabled={exporting}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-secondary hover:bg-secondary/80 text-foreground text-xs font-medium transition-colors disabled:opacity-50"
          >
            <Camera className="h-3.5 w-3.5" />
            {exporting ? '...' : 'Screenshot'}
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div
        ref={mapRef}
        className={`relative w-full border border-border rounded-lg overflow-hidden select-none touch-none ${zoom > 1 ? 'cursor-grab' : 'cursor-crosshair'} ${isDragging ? 'cursor-grabbing' : ''}`}
        style={{ aspectRatio: mapAspectRatio }}
        onClick={handleMapClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Zoomable/pannable inner container */}
        <div
          className="absolute inset-0 origin-center transition-transform duration-100"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transitionProperty: isDragging ? 'none' : 'transform',
          }}
        >
          <img
            src="/tibia-world-map.png"
            alt="Tibia World Map"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            style={{ imageRendering: 'pixelated' }}
            draggable={false}
          />
          <div className="absolute inset-0 bg-background/15 pointer-events-none" />

          {/* City/Island labels */}
          {TIBIA_CITIES.map(city => {
            const pos = getCityPosition(city);
            const isBeingDragged = draggingCity === city.id;
            return (
              <div
                key={city.id}
                data-city={city.id}
                className={`absolute z-[5] flex flex-col items-center ${editMode ? 'pointer-events-auto cursor-move' : 'pointer-events-none'} ${isBeingDragged ? 'z-20' : ''}`}
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: `translate(-50%, -50%) scale(${1 / zoom})`,
                }}
                onMouseDown={(e) => {
                  if (!editMode) return;
                  e.stopPropagation();
                  setDraggingCity(city.id);
                  cityDragStart.current = { x: e.clientX, y: e.clientY, cityX: pos.x, cityY: pos.y };
                }}
              >
                <span className={`text-[8px] font-mono font-bold uppercase tracking-wider bg-background/60 px-1 py-0.5 rounded whitespace-nowrap leading-tight ${editMode ? 'ring-1 ring-primary/50 text-primary' : 'text-foreground/70'} ${isBeingDragged ? 'ring-2 ring-primary' : ''}`}
                  style={{ textShadow: '0 1px 3px hsl(var(--background))' }}>
                  {city.icon} {city.name}
                </span>
              </div>
            );
          })}
          {visiblePins.map(pin => {
            const member = memberMap[pin.char_name];
            const isHovered = hoveredPin === pin.char_name;

            return (
              <div
                key={pin.id}
                data-pin
                className="absolute z-10 flex flex-col items-center"
                style={{
                  left: `${pin.pos_x}%`,
                  top: `${pin.pos_y}%`,
                  transform: `translate(-50%, -100%) scale(${1 / zoom})`,
                }}
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
                  <motion.div
                    className="absolute inset-0 rounded-full bg-primary"
                    animate={{ scale: [1, 2, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ width: 14, height: 14, margin: 'auto', top: 0, left: 0, right: 0, bottom: 0 }}
                  />
                  <div className="w-3.5 h-3.5 rounded-full bg-primary border-2 border-primary-foreground shadow-[0_0_8px_hsl(var(--primary)/0.6)]" />
                  <button
                    data-pin
                    onClick={(e) => handleRemovePin(e, pin.char_name)}
                    className="absolute -top-1 -right-2.5 w-3.5 h-3.5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-2 w-2" />
                  </button>
                </div>

                {/* Name label */}
                <span className="text-[9px] font-mono font-medium text-foreground bg-background/80 px-1.5 py-0.5 rounded mt-0.5 whitespace-nowrap leading-tight shadow-sm">
                  {pin.char_name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Click popup - shows ALL online members */}
        <AnimatePresence>
          {clickPopup && (
            <motion.div
              data-popup
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
              <div className="max-h-60 overflow-y-auto p-1">
                {filteredMembers.length === 0 ? (
                  <div className="text-[10px] text-muted-foreground text-center py-3">
                    {searchText ? 'Nenhum membro encontrado' : 'Todos membros online já estão no mapa'}
                  </div>
                ) : (
                  filteredMembers.map(m => (
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
              <div className="px-2 py-1 border-t border-border flex items-center justify-between">
                <div className="text-[8px] text-muted-foreground font-mono">
                  📍 {clickPopup.x.toFixed(1)}%, {clickPopup.y.toFixed(1)}%
                </div>
                <div className="text-[8px] text-muted-foreground font-mono">
                  {filteredMembers.length} disponíveis
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Click indicator dot */}
        {clickPopup && (
          <div
            className="absolute z-15 w-2 h-2 rounded-full bg-primary/60 border border-primary animate-pulse pointer-events-none"
            style={{
              left: `${clickPopup.x}%`,
              top: `${clickPopup.y}%`,
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) translate(-50%, -50%)`,
              transformOrigin: 'center',
            }}
          />
        )}

        {/* Zoom controls */}
        <div className="absolute top-2 right-2 z-20 flex flex-col gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); zoomIn(); }}
            className="w-7 h-7 rounded bg-card/90 backdrop-blur border border-border flex items-center justify-center text-foreground hover:bg-secondary transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); zoomOut(); }}
            className="w-7 h-7 rounded bg-card/90 backdrop-blur border border-border flex items-center justify-center text-foreground hover:bg-secondary transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); resetView(); }}
            className="w-7 h-7 rounded bg-card/90 backdrop-blur border border-border flex items-center justify-center text-foreground hover:bg-secondary transition-colors"
            title="Resetar zoom"
          >
            <Maximize className="h-3.5 w-3.5" />
          </button>
          <div className="text-[8px] font-mono text-center text-muted-foreground bg-card/90 backdrop-blur rounded border border-border px-1 py-0.5">
            {Math.round(zoom * 100)}%
          </div>
        </div>

        {/* Radar panel */}
        {visiblePins.length > 0 && (
          <div className="absolute bottom-2 left-2 z-20 w-52" data-popup onClick={e => e.stopPropagation()}>
            <div className="bg-card/95 backdrop-blur border border-border rounded-lg shadow-lg overflow-hidden">
              <button
                onClick={() => setRadarOpen(!radarOpen)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <Radar className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[10px] font-display font-semibold text-foreground uppercase tracking-wider">Radar</span>
                  <span className="text-[9px] font-mono text-muted-foreground">{visiblePins.length}</span>
                </div>
                {radarOpen ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronUp className="h-3 w-3 text-muted-foreground" />}
              </button>
              {radarOpen && (
                <div className="border-t border-border max-h-48 overflow-y-auto">
                  {visiblePins.map(pin => {
                    const member = memberMap[pin.char_name];
                    return (
                      <div key={pin.id} className="flex items-center gap-1.5 px-2.5 py-1 hover:bg-secondary/30 transition-colors group">
                        <StatusDot status="online" />
                        {member && <VocationIcon vocation={member.vocation} className="h-3 w-3" />}
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] text-foreground truncate block">{pin.char_name}</span>
                          {member && <span className="text-[8px] text-muted-foreground font-mono">Lv {member.level}</span>}
                        </div>
                        <button
                          onClick={() => centerOnPin(pin)}
                          className="p-0.5 text-muted-foreground hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                          title="Centralizar no mapa"
                        >
                          <Crosshair className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => removePin(pin.char_name)}
                          className="p-0.5 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                          title="Remover"
                        >
                          <Trash2 className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-20">
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-12 h-12 rounded-xl bg-secondary/80 border border-border flex items-center justify-center">
                <ItemSprite item="compass" className="h-8 w-8 opacity-40 animate-pulse" />
              </div>
              <span className="text-xs font-mono text-muted-foreground">Carregando mapa...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
