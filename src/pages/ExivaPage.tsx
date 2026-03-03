import { useState, useEffect, useCallback, useMemo } from 'react';
import { RefreshCw, MapPin, Clock, Pencil, Users, UserCheck, UserX, Skull, ChevronDown, ChevronUp, CalendarDays } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import StatCard from '@/components/StatCard';
import StatusDot from '@/components/StatusDot';
import { fetchGuildMembers, fetchGuildMemberDeaths, CharacterDeath } from '@/lib/tibia-api';
import {
  getAnnotations, saveAnnotation, getMonitoredGuilds,
  getCategories, saveCategory, MemberCategory,
  recordLoginChange, getTodayLogins, LoginEntry,
} from '@/lib/storage';
import { GuildMember } from '@/types/tibia';
import { useToast } from '@/hooks/use-toast';
import { VocationIcon, getVocationColor } from '@/components/TibiaIcons';

const CATEGORY_CONFIG: Record<MemberCategory, { label: string; emoji: string; color: string }> = {
  main: { label: 'Main', emoji: '👑', color: 'border-primary/50 bg-primary/5' },
  bomba: { label: 'Bomba', emoji: '💣', color: 'border-destructive/50 bg-destructive/5' },
  maker: { label: 'Maker', emoji: '🔨', color: 'border-amber-500/50 bg-amber-500/5' },
  outros: { label: 'Outros', emoji: '📦', color: 'border-muted-foreground/30 bg-muted/30' },
};

const CATEGORIES: MemberCategory[] = ['main', 'bomba', 'maker', 'outros'];

export default function ExivaPage() {
  const { toast } = useToast();
  const [members, setMembers] = useState<GuildMember[]>([]);
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

  const annotations = getAnnotations();

  // Get fixed guild from config
  const guildName = useMemo(() => {
    const guilds = getMonitoredGuilds();
    return guilds.length > 0 ? guilds[0].name : '';
  }, []);

  const doFetch = useCallback(async (name: string) => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const data = await fetchGuildMembers(name.trim());
      const cats = getCategories();
      setCategories(cats);
      const withAnnotations = data.map(m => ({
        ...m,
        annotation: annotations[m.name] || '',
      }));
      // Record login changes
      withAnnotations.forEach(m => recordLoginChange(m.name, m.status));
      setMembers(withAnnotations);
      setLastUpdate(new Date().toLocaleTimeString('pt-BR'));
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [annotations, toast]);

  const fetchDeaths = useCallback(async () => {
    if (members.length === 0) return;
    setLoadingDeaths(true);
    try {
      const memberNames = members.map(m => m.name);
      const d = await fetchGuildMemberDeaths(memberNames);
      setDeaths(d);
    } catch {
      // silent
    } finally {
      setLoadingDeaths(false);
    }
  }, [members]);

  // Initial fetch
  useEffect(() => {
    if (guildName) doFetch(guildName);
  }, [guildName]);

  // Auto-refresh
  useEffect(() => {
    if (!guildName || members.length === 0) return;
    const interval = setInterval(() => doFetch(guildName), 60000);
    return () => clearInterval(interval);
  }, [guildName, members.length, doFetch]);

  // Fetch deaths on first load
  useEffect(() => {
    if (members.length > 0 && deaths.length === 0) fetchDeaths();
  }, [members.length]);

  const onlineCount = members.filter(m => m.status === 'online').length;
  const offlineCount = members.filter(m => m.status === 'offline').length;

  const handleSaveAnnotation = (charName: string) => {
    saveAnnotation(charName, annotationText);
    setMembers(prev => prev.map(m => m.name === charName ? { ...m, annotation: annotationText } : m));
    setEditingAnnotation(null);
    toast({ title: 'Anotação salva' });
  };

  const handleSetCategory = (charName: string, cat: MemberCategory) => {
    saveCategory(charName, cat);
    setCategories(prev => ({ ...prev, [charName]: cat }));
  };

  const filtered = members.filter(m => {
    if (searchFilter && !m.name.toLowerCase().includes(searchFilter.toLowerCase())) return false;
    return true;
  });

  const grouped = useMemo(() => {
    const result: Record<MemberCategory, typeof filtered> = {
      main: [], bomba: [], maker: [], outros: [],
    };
    filtered.forEach(m => {
      const cat = categories[m.name] || 'outros';
      result[cat].push(m);
    });
    // Sort each group: online first, then by level desc
    Object.keys(result).forEach(k => {
      result[k as MemberCategory].sort((a, b) => {
        if (a.status !== b.status) return a.status === 'online' ? -1 : 1;
        return b.level - a.level;
      });
    });
    return result;
  }, [filtered, categories]);

  const getTodayLoginInfo = (name: string) => {
    const entries = getTodayLogins(name);
    const loginCount = entries.filter(e => e.status === 'online').length;
    return { entries, loginCount };
  };

  if (!guildName) {
    return (
      <div className="text-center py-16">
        <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
        <h2 className="text-xl font-bold text-foreground mb-2">Nenhuma guild configurada</h2>
        <p className="text-muted-foreground">Vá em <strong>Configurações → Guilds</strong> e adicione uma guild para monitorar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-primary" style={{ fontFamily: "'MedievalSharp', cursive" }}>
            🎯 Exiva — {guildName}
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitoramento fixo • {lastUpdate && <>Atualizado às {lastUpdate} • </>}Auto-refresh 60s
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => doFetch(guildName)} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Atualizar
        </Button>
      </div>

      {/* Stats */}
      {members.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon={<Users className="h-5 w-5" />} value={members.length} label="Total" color="primary" />
          <StatCard icon={<UserCheck className="h-5 w-5" />} value={onlineCount} label="Online" color="online" />
          <StatCard icon={<UserX className="h-5 w-5" />} value={offlineCount} label="Offline" color="offline" />
        </div>
      )}

      {/* Search */}
      <Input
        value={searchFilter}
        onChange={e => setSearchFilter(e.target.value)}
        placeholder="Filtrar por nome..."
        className="bg-secondary border-border"
      />

      {/* 4 Columns */}
      {members.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {CATEGORIES.map(cat => {
            const cfg = CATEGORY_CONFIG[cat];
            const list = grouped[cat];
            const catOnline = list.filter(m => m.status === 'online').length;
            return (
              <div key={cat} className={`rounded-lg border ${cfg.color} overflow-hidden`}>
                {/* Column Header */}
                <div className="px-3 py-2 border-b border-border/50 flex items-center justify-between">
                  <span className="font-bold text-sm">
                    {cfg.emoji} {cfg.label} ({list.length})
                  </span>
                  <span className="text-xs text-muted-foreground">{catOnline} on</span>
                </div>
                {/* Members */}
                <div className="divide-y divide-border/30 max-h-[500px] overflow-y-auto">
                  {list.map(m => (
                    <MemberRow
                      key={m.name}
                      member={m}
                      category={categories[m.name] || 'outros'}
                      onSetCategory={handleSetCategory}
                      editingAnnotation={editingAnnotation}
                      annotationText={annotationText}
                      setEditingAnnotation={setEditingAnnotation}
                      setAnnotationText={setAnnotationText}
                      handleSaveAnnotation={handleSaveAnnotation}
                      expanded={expandedPlayer === m.name}
                      onToggleExpand={() => setExpandedPlayer(expandedPlayer === m.name ? null : m.name)}
                      getTodayLoginInfo={getTodayLoginInfo}
                    />
                  ))}
                  {list.length === 0 && (
                    <div className="p-4 text-center text-xs text-muted-foreground">Nenhum membro</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Deaths Section */}
      {members.length > 0 && (
        <div className="rounded-lg border border-border bg-card">
          <button
            onClick={() => { setShowDeaths(!showDeaths); if (!showDeaths && deaths.length === 0) fetchDeaths(); }}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center gap-2 font-semibold text-sm">
              <Skull className="h-4 w-4 text-destructive" />
              Últimas Mortes ({deaths.length})
            </div>
            <div className="flex items-center gap-2">
              {loadingDeaths && <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />}
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); fetchDeaths(); }}>
                <RefreshCw className="h-3 w-3" />
              </Button>
              {showDeaths ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </button>
          {showDeaths && (
            <div className="divide-y divide-border border-t border-border">
              {deaths.map((d, i) => (
                <div key={`${d.name}-${i}`} className="px-4 py-2 flex items-center gap-3 text-sm">
                  <Skull className="h-3.5 w-3.5 text-destructive shrink-0" />
                  <span className="font-medium text-foreground">{d.name}</span>
                  <span className="text-xs text-muted-foreground">Lv {d.level}</span>
                  <span className="flex-1 text-xs text-muted-foreground truncate">
                    {d.killers?.filter(k => k.player).map(k => k.name).join(', ') || d.reason || 'Unknown'}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {d.time ? new Date(d.time).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
              ))}
              {deaths.length === 0 && !loadingDeaths && (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  Nenhuma morte recente encontrada
                </div>
              )}
              {loadingDeaths && deaths.length === 0 && (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2" />
                  Buscando mortes...
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- Member Row Component ---
interface MemberRowProps {
  member: GuildMember;
  category: MemberCategory;
  onSetCategory: (name: string, cat: MemberCategory) => void;
  editingAnnotation: string | null;
  annotationText: string;
  setEditingAnnotation: (name: string | null) => void;
  setAnnotationText: (text: string) => void;
  handleSaveAnnotation: (name: string) => void;
  expanded: boolean;
  onToggleExpand: () => void;
  getTodayLoginInfo: (name: string) => { entries: LoginEntry[]; loginCount: number };
}

function MemberRow({
  member: m, category, onSetCategory,
  editingAnnotation, annotationText, setEditingAnnotation, setAnnotationText, handleSaveAnnotation,
  expanded, onToggleExpand, getTodayLoginInfo,
}: MemberRowProps) {
  const loginInfo = expanded ? getTodayLoginInfo(m.name) : null;

  return (
    <div className="px-3 py-2">
      {/* Main Row */}
      <div className="flex items-center gap-2 cursor-pointer" onClick={onToggleExpand}>
        <StatusDot status={m.status} />
        <VocationIcon vocation={m.vocation} className={`h-3.5 w-3.5 ${getVocationColor(m.vocation)}`} />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-foreground truncate block">{m.name}</span>
          <span className="text-[10px] text-muted-foreground">{m.vocation} • Lv {m.level}</span>
        </div>
        {/* Category selector */}
        <select
          value={category}
          onChange={e => { e.stopPropagation(); onSetCategory(m.name, e.target.value as MemberCategory); }}
          onClick={e => e.stopPropagation()}
          className="text-[10px] px-1 py-0.5 rounded bg-secondary border border-border text-foreground"
        >
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{CATEGORY_CONFIG[c].emoji} {CATEGORY_CONFIG[c].label}</option>
          ))}
        </select>
      </div>

      {/* Annotation */}
      <div className="flex items-center gap-1 mt-1">
        {editingAnnotation === m.name ? (
          <div className="flex gap-1 w-full">
            <Input
              value={annotationText}
              onChange={e => setAnnotationText(e.target.value)}
              placeholder="Anotação..."
              className="h-6 text-[10px] flex-1 bg-secondary"
              onKeyDown={e => e.key === 'Enter' && handleSaveAnnotation(m.name)}
              onClick={e => e.stopPropagation()}
            />
            <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2" onClick={() => handleSaveAnnotation(m.name)}>OK</Button>
          </div>
        ) : (
          <div className="flex items-center gap-1 w-full">
            {m.annotation && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 truncate max-w-[120px]">
                {m.annotation}
              </span>
            )}
            <button
              onClick={e => { e.stopPropagation(); setEditingAnnotation(m.name); setAnnotationText(m.annotation || ''); }}
              className="text-muted-foreground hover:text-primary transition-colors ml-auto"
            >
              <Pencil className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      {/* Expanded: Login History */}
      {expanded && loginInfo && (
        <div className="mt-2 p-2 rounded bg-secondary/50 border border-border/50 text-[10px] space-y-1">
          <div className="flex items-center gap-1 font-semibold text-foreground">
            <CalendarDays className="h-3 w-3" />
            Hoje: {loginInfo.loginCount} login(s)
          </div>
          {loginInfo.entries.length > 0 ? (
            <div className="space-y-0.5 max-h-24 overflow-y-auto">
              {loginInfo.entries.map((e, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <StatusDot status={e.status} />
                  <span className="text-muted-foreground">
                    {new Date(e.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className={e.status === 'online' ? 'text-green-400' : 'text-red-400'}>
                    {e.status === 'online' ? 'Logou' : 'Deslogou'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-muted-foreground">Sem registros hoje</span>
          )}
        </div>
      )}
    </div>
  );
}
