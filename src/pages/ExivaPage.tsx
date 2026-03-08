import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { motion } from 'framer-motion';
import { Pencil, ChevronDown, ChevronUp, CalendarDays, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { fetchGuildMembers, fetchGuildMemberDeaths, CharacterDeath } from '@/lib/tibia-api';
import {
  loadAnnotations, saveAnnotationAsync,
  getMonitoredGuildsAsync,
  loadCategories, saveCategoryAsync, MemberCategory,
  recordLoginChange, getTodayLoginsAsync, LoginEntry,
} from '@/lib/storage';
import { GuildMember } from '@/types/tibia';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { VocationIcon, getVocationColor, ItemSprite } from '@/components/TibiaIcons';
import StatusDot from '@/components/StatusDot';
import { SkeletonRow } from '@/components/SkeletonLoader';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import { useMapPins, MapPin as MapPinType } from '@/hooks/useMapPins';
import { TIBIA_CITIES } from '@/lib/tibia-cities';
const CATEGORY_CONFIG: Record<MemberCategory, { label: string; emoji: string; borderColor: string }> = {
  main: { label: 'Main', emoji: '👑', borderColor: 'border-t-primary' },
  bomba: { label: 'Bomba', emoji: '💣', borderColor: 'border-t-destructive' },
  maker: { label: 'Maker', emoji: '🔨', borderColor: 'border-t-afk' },
  outros: { label: 'Outros', emoji: '📦', borderColor: 'border-t-muted-foreground/30' },
};

const CATEGORIES: MemberCategory[] = ['main', 'bomba', 'maker', 'outros'];

// Find nearest city name from pin coordinates
function getNearestCity(posX: number, posY: number): string {
  let closest = '';
  let minDist = Infinity;
  for (const city of TIBIA_CITIES) {
    const d = Math.hypot(city.x - posX, city.y - posY);
    if (d < minDist) { minDist = d; closest = city.name; }
  }
  return closest;
}

export default function ExivaPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const settings = useSettings();
  const [members, setMembers] = useState<GuildMember[]>([]);
  const { pins, refetch: refetchPins } = useMapPins();
  const [loading, setLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [editingAnnotation, setEditingAnnotation] = useState<string | null>(null);
  const [annotationText, setAnnotationText] = useState('');
  const [lastUpdate, setLastUpdate] = useState('');
  const [deaths, setDeaths] = useState<CharacterDeath[]>([]);
  const [loadingDeaths, setLoadingDeaths] = useState(false);
  const [showDeaths, setShowDeaths] = useState(true);
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);
  const [categories, setCategories] = useState<Record<string, MemberCategory>>({});
  const [annotations, setAnnotationsState] = useState<Record<string, string>>({});
  const [refreshCountdown, setRefreshCountdown] = useState(settings.refreshInterval);
  const [showOnlineOnly, setShowOnlineOnly] = useState(true);
  const [guildName, setGuildName] = useState('');
  const [guildLoading, setGuildLoading] = useState(true);

  // Load guild + annotations + categories from DB
  useEffect(() => {
    const init = async () => {
      setGuildLoading(true);
      const [guilds, annots, cats] = await Promise.all([
        getMonitoredGuildsAsync(),
        loadAnnotations(),
        loadCategories(),
      ]);
      if (guilds.length > 0) setGuildName(guilds[0].name);
      setAnnotationsState(annots);
      setCategories(cats);
      setGuildLoading(false);
    };
    init();
  }, []);

  const doFetch = useCallback(async (name: string) => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const data = await fetchGuildMembers(name);
      const [savedCats, savedAnnots] = await Promise.all([loadCategories(), loadAnnotations()]);
      setCategories(savedCats);
      setAnnotationsState(savedAnnots);
      data.forEach(m => {
        m.annotation = savedAnnots[m.name] || '';
      });
      setMembers(data);
      setRefreshCountdown(settings.refreshInterval);
      setLastUpdate(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      // Refresh pins to ensure sync
      refetchPins();
    } catch (e: any) {
      toast({ title: 'Erro ao buscar membros', description: e.message, variant: 'destructive' });
    } finally { setLoading(false); }
  }, [settings.refreshInterval, toast, refetchPins]);

  const fetchDeaths = useCallback(async () => {
    if (members.length === 0) return;
    setLoadingDeaths(true);
    try { setDeaths(await fetchGuildMemberDeaths(members.map(m => m.name))); }
    catch {} finally { setLoadingDeaths(false); }
  }, [members]);

  useEffect(() => { if (guildName) doFetch(guildName); }, [guildName]);

  useEffect(() => {
    if (!guildName || members.length === 0) return;
    const interval = setInterval(() => {
      setRefreshCountdown(prev => { if (prev <= 1) { doFetch(guildName); return settings.refreshInterval; } return prev - 1; });
    }, 1000);
    return () => clearInterval(interval);
  }, [guildName, members.length, doFetch]);

  useEffect(() => { if (members.length > 0 && deaths.length === 0) fetchDeaths(); }, [members.length]);

  const onlineCount = members.filter(m => m.status === 'online').length;
  const offlineCount = members.filter(m => m.status === 'offline').length;

  const handleSaveAnnotation = async (charName: string) => {
    await saveAnnotationAsync(charName, annotationText, user?.id);
    setAnnotationsState(prev => ({ ...prev, [charName]: annotationText }));
    setMembers(prev => prev.map(m => m.name === charName ? { ...m, annotation: annotationText } : m));
    setEditingAnnotation(null);
    toast({ title: 'Anotação salva' });
  };

  const handleSetCategory = async (charName: string, cat: MemberCategory) => {
    await saveCategoryAsync(charName, cat, user?.id);
    setCategories(prev => ({ ...prev, [charName]: cat }));
  };

  const filtered = members.filter(m => {
    if (showOnlineOnly && m.status !== 'online') return false;
    if (searchFilter && !m.name.toLowerCase().includes(searchFilter.toLowerCase())) return false;
    return true;
  });

  const grouped = useMemo(() => {
    const result: Record<MemberCategory, typeof filtered> = { main: [], bomba: [], maker: [], outros: [] };
    filtered.forEach(m => { result[categories[m.name] || 'outros'].push(m); });
    Object.keys(result).forEach(k => { result[k as MemberCategory].sort((a, b) => b.level - a.level); });
    return result;
  }, [filtered, categories]);

  const pinMap = useMemo(() => {
    const map: Record<string, MapPinType> = {};
    pins.forEach(p => { map[p.char_name] = p; });
    return map;
  }, [pins]);

  const getTodayLoginInfo = useCallback(async (name: string) => {
    const entries = await getTodayLoginsAsync(name);
    return { entries, loginCount: entries.filter(e => e.status === 'online').length };
  }, []);

  if (guildLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 animate-pulse">
          <div className="w-1 h-8 rounded-full bg-secondary" />
          <div className="space-y-2">
            <div className="h-5 w-40 bg-secondary rounded" />
            <div className="h-2 w-24 bg-secondary/60 rounded" />
          </div>
        </div>
        {Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}
      </div>
    );
  }

  if (!guildName) {
    return (
      <EmptyState
        icon="globe"
        title="Sem guild configurada"
        description="Vá em Config → Guilds e adicione uma guild para começar a monitorar."
        actionLabel="Ir para Config"
        onAction={() => window.location.href = '/configuracoes'}
      />
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="EXIVA LIST"
        icon="exiva"
        subtitle={<><span className="text-foreground font-semibold">{guildName}</span><span>•</span><span className="text-primary">{lastUpdate || '—'}</span><span>•</span><span className="text-primary">{refreshCountdown}s</span></>}
        actions={
          <button onClick={() => doFetch(guildName)} disabled={loading}
            className="p-1.5 rounded border border-border hover:border-primary/30 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all">
            <ItemSprite item="refresh" className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        }
      />

      {/* Status bar */}
      {members.length > 0 && (
        <div className="panel rounded-lg p-3">
          <div className="flex items-center gap-4 mb-2">
            <div className="flex items-center gap-2">
              <ItemSprite item="shield" className="h-4 w-4" />
              <span className="text-xs font-bold font-mono text-foreground">{members.length}</span>
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider">TOTAL</span>
            </div>
            <div className="flex items-center gap-2">
              <ItemSprite item="online" className="h-4 w-4" />
              <span className="text-xs font-bold font-mono text-online">{onlineCount}</span>
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider">ONLINE</span>
            </div>
            <div className="flex items-center gap-2">
              <ItemSprite item="offline" className="h-4 w-4" />
              <span className="text-xs font-bold font-mono text-offline">{offlineCount}</span>
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider">OFFLINE</span>
            </div>
          </div>
          {members.length > 0 && (
            <div className="h-1 rounded-full bg-secondary overflow-hidden flex">
              <div className="bg-online" style={{ width: `${(onlineCount / members.length) * 100}%` }} />
              <div className="bg-offline" style={{ width: `${(offlineCount / members.length) * 100}%` }} />
            </div>
          )}
        </div>
      )}

      {/* Search + Toggle */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2">
            <ItemSprite item="search" className="h-4 w-4" />
          </div>
          <Input value={searchFilter} onChange={e => setSearchFilter(e.target.value)}
            placeholder={showOnlineOnly ? "Filtrar jogadores online..." : "Filtrar jogadores..."} className="pl-8 h-8 text-xs bg-secondary/50 border-border" />
        </div>
        <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
          <Switch checked={showOnlineOnly} onCheckedChange={setShowOnlineOnly} />
          Só online
        </label>
      </div>

      {/* Columns */}
      {members.length > 0 && (
        <div className={`grid grid-cols-1 ${settings.exivaColumns >= 3 ? 'md:grid-cols-2' : 'md:grid-cols-2'} ${settings.exivaColumns === 4 ? 'xl:grid-cols-4' : settings.exivaColumns === 3 ? 'xl:grid-cols-3' : 'xl:grid-cols-2'} gap-3`}>
          {CATEGORIES.map(cat => {
            const cfg = CATEGORY_CONFIG[cat];
            const list = grouped[cat];
            return (
              <div key={cat} className={`panel rounded-lg overflow-hidden border-t-2 ${cfg.borderColor}`}>
                <div className="px-3 py-2 border-b border-border flex items-center justify-between">
                  <span className="font-display text-[10px] font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    {cfg.emoji} {cfg.label}
                  </span>
                  <span className="text-[9px] font-mono text-muted-foreground">{list.length}</span>
                </div>
                <div className="divide-y divide-border/30 max-h-[500px] overflow-y-auto">
                   {list.map(m => (
                    <MemberRow key={m.name} member={m} category={categories[m.name] || 'outros'}
                      onSetCategory={handleSetCategory} editingAnnotation={editingAnnotation} annotationText={annotationText}
                      setEditingAnnotation={setEditingAnnotation} setAnnotationText={setAnnotationText}
                      handleSaveAnnotation={handleSaveAnnotation} expanded={expandedPlayer === m.name}
                      onToggleExpand={() => setExpandedPlayer(expandedPlayer === m.name ? null : m.name)}
                      getTodayLoginInfo={getTodayLoginInfo} mapPin={pinMap[m.name]} />
                  ))}
                  {list.length === 0 && <div className="p-4 text-center text-[10px] text-muted-foreground/40">Vazio</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Deaths */}
      {members.length > 0 && (
        <div className="panel rounded-lg overflow-hidden">
          <button onClick={() => { setShowDeaths(!showDeaths); if (!showDeaths && deaths.length === 0) fetchDeaths(); }}
            className="w-full px-3 py-2 flex items-center justify-between hover:bg-secondary/30 transition-colors">
            <div className="flex items-center gap-2">
              <ItemSprite item="skull" className="h-5 w-5" />
              <span className="text-[10px] font-display font-semibold text-foreground uppercase tracking-wider">DEATH LOG</span>
              <span className="text-[9px] font-mono text-muted-foreground">{deaths.length}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {loadingDeaths && <ItemSprite item="refresh" className="h-4 w-4 animate-spin" />}
              <button className="p-1 hover:text-primary" onClick={(e) => { e.stopPropagation(); fetchDeaths(); }}>
                <ItemSprite item="refresh" className="h-4 w-4" />
              </button>
              {showDeaths ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
            </div>
          </button>
          {showDeaths && (
            <div className="border-t border-border">
              {deaths.map((d, i) => (
                <div key={`${d.name}-${i}`} className="px-3 py-1.5 flex items-center gap-2 text-xs border-b border-border/30 last:border-0 hover:bg-destructive/5 transition-colors">
                  <div className="w-1 h-4 rounded-full bg-destructive/60 shrink-0" />
                  <span className="font-semibold text-foreground">{d.name}</span>
                  <span className="text-muted-foreground font-mono text-[10px]">Lv{d.level}</span>
                  <span className="flex-1 text-muted-foreground truncate text-[10px]">
                    {d.killers?.filter(k => k.player).map(k => k.name).join(', ') || d.reason || '?'}
                  </span>
                  <span className="text-[9px] text-muted-foreground font-mono shrink-0">
                    {d.time ? new Date(d.time).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
              ))}
              {deaths.length === 0 && !loadingDeaths && <div className="p-6 text-center text-[10px] text-muted-foreground/40">Sem mortes</div>}
              {loadingDeaths && deaths.length === 0 && (
                <div className="p-6 text-center"><ItemSprite item="refresh" className="h-4 w-4 animate-spin mx-auto" /></div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- Member Row ---
interface MemberRowProps {
  member: GuildMember; category: MemberCategory;
  onSetCategory: (name: string, cat: MemberCategory) => void;
  editingAnnotation: string | null; annotationText: string;
  setEditingAnnotation: (name: string | null) => void; setAnnotationText: (text: string) => void;
  handleSaveAnnotation: (name: string) => void;
  expanded: boolean; onToggleExpand: () => void;
  getTodayLoginInfo: (name: string) => Promise<{ entries: LoginEntry[]; loginCount: number }>;
  mapPin?: MapPinType;
}

function MemberRow({ member: m, category, onSetCategory, editingAnnotation, annotationText, setEditingAnnotation, setAnnotationText, handleSaveAnnotation, expanded, onToggleExpand, getTodayLoginInfo, mapPin }: MemberRowProps) {
  const [loginInfo, setLoginInfo] = useState<{ entries: LoginEntry[]; loginCount: number } | null>(null);

  useEffect(() => {
    if (expanded) {
      getTodayLoginInfo(m.name).then(setLoginInfo);
    } else {
      setLoginInfo(null);
    }
  }, [expanded, m.name]);

  return (
    <div className="px-3 py-1.5 hover:bg-secondary/30 transition-colors group">
      <div className="flex items-center gap-2 cursor-pointer" onClick={onToggleExpand}>
        <StatusDot status={m.status} />
        <VocationIcon vocation={m.vocation} className={`h-4 w-4 ${getVocationColor(m.vocation)}`} />
        <div className="flex-1 min-w-0">
          <span className="text-xs font-semibold text-foreground truncate block">{m.name}</span>
          <span className="text-[9px] text-muted-foreground font-mono">Lv{m.level} • {m.vocation}</span>
          {mapPin && (
            <span className="text-[9px] font-mono text-primary flex items-center gap-0.5 bg-primary/10 px-1 py-0.5 rounded">
              <MapPin className="h-2.5 w-2.5 shrink-0" />
              <span className="font-semibold">{getNearestCity(mapPin.pos_x, mapPin.pos_y)}</span>
              {mapPin.note && <span className="text-muted-foreground">· {mapPin.note}</span>}
            </span>
          )}
        </div>
        <select value={category} onChange={e => { e.stopPropagation(); onSetCategory(m.name, e.target.value as MemberCategory); }}
          onClick={e => e.stopPropagation()}
          className="text-[9px] px-1 py-0.5 rounded bg-secondary border border-border text-foreground cursor-pointer">
          {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_CONFIG[c].emoji} {CATEGORY_CONFIG[c].label}</option>)}
        </select>
      </div>
      <div className="flex items-center gap-1 mt-0.5">
        {editingAnnotation === m.name ? (
          <div className="flex gap-1 w-full">
            <Input value={annotationText} onChange={e => setAnnotationText(e.target.value)} placeholder="Nota..."
              className="h-5 text-[9px] flex-1 bg-secondary" onKeyDown={e => e.key === 'Enter' && handleSaveAnnotation(m.name)} onClick={e => e.stopPropagation()} />
            <Button size="sm" variant="ghost" className="h-5 text-[9px] px-1.5" onClick={() => handleSaveAnnotation(m.name)}>OK</Button>
          </div>
        ) : (
          <div className="flex items-center gap-1 w-full">
            {m.annotation && <span className="tag tag-primary">{m.annotation}</span>}
            <button onClick={e => { e.stopPropagation(); setEditingAnnotation(m.name); setAnnotationText(m.annotation || ''); }}
              className="text-muted-foreground hover:text-primary transition-colors ml-auto opacity-0 group-hover:opacity-100">
              <Pencil className="h-2.5 w-2.5" />
            </button>
          </div>
        )}
      </div>
      {expanded && loginInfo && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
          className="mt-1.5 p-2 rounded bg-secondary/40 border border-border/30 text-[9px] space-y-0.5">
          <div className="flex items-center gap-1 font-semibold text-foreground">
            <CalendarDays className="h-2.5 w-2.5" /> Hoje: {loginInfo.loginCount} login(s)
          </div>
          {loginInfo.entries.length > 0 ? (
            <div className="space-y-0.5 max-h-20 overflow-y-auto">
              {loginInfo.entries.map((e, i) => (
                <div key={i} className="flex items-center gap-1">
                  <StatusDot status={e.status} size="sm" />
                  <span className="text-muted-foreground font-mono">{new Date(e.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className={e.status === 'online' ? 'text-online' : 'text-offline'}>{e.status === 'online' ? 'Login' : 'Logout'}</span>
                </div>
              ))}
            </div>
          ) : <span className="text-muted-foreground">Sem registros</span>}
        </motion.div>
      )}
    </div>
  );
}
