import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { motion } from 'framer-motion';
import { RefreshCw, MapPin, Pencil, Users, UserCheck, UserX, Skull, ChevronDown, ChevronUp, CalendarDays, Activity, Zap, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { fetchGuildMembers, fetchGuildMemberDeaths, CharacterDeath } from '@/lib/tibia-api';
import {
  getAnnotations, saveAnnotation, getMonitoredGuilds,
  getCategories, saveCategory, MemberCategory,
  recordLoginChange, getTodayLogins, LoginEntry,
} from '@/lib/storage';
import { GuildMember } from '@/types/tibia';
import { useToast } from '@/hooks/use-toast';
import { VocationIcon, getVocationColor } from '@/components/TibiaIcons';
import StatusDot from '@/components/StatusDot';

const CATEGORY_CONFIG: Record<MemberCategory, { label: string; emoji: string; color: string; glow: string }> = {
  main: { label: 'Main', emoji: '👑', color: 'border-primary/40 bg-primary/5', glow: 'shadow-primary/5' },
  bomba: { label: 'Bomba', emoji: '💣', color: 'border-destructive/40 bg-destructive/5', glow: 'shadow-destructive/5' },
  maker: { label: 'Maker', emoji: '🔨', color: 'border-afk/40 bg-afk/5', glow: 'shadow-afk/5' },
  outros: { label: 'Outros', emoji: '📦', color: 'border-muted-foreground/20 bg-muted/20', glow: '' },
};

const CATEGORIES: MemberCategory[] = ['main', 'bomba', 'maker', 'outros'];

export default function ExivaPage() {
  const { toast } = useToast();
  const settings = useSettings();
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
  const [refreshCountdown, setRefreshCountdown] = useState(settings.refreshInterval);

  const annotations = getAnnotations();
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
      const withAnnotations = data.map(m => ({ ...m, annotation: annotations[m.name] || '' }));
      withAnnotations.forEach(m => recordLoginChange(m.name, m.status));
      setMembers(withAnnotations);
      setLastUpdate(new Date().toLocaleTimeString('pt-BR'));
      setRefreshCountdown(60);
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
      const d = await fetchGuildMemberDeaths(members.map(m => m.name));
      setDeaths(d);
    } catch {} finally { setLoadingDeaths(false); }
  }, [members]);

  useEffect(() => { if (guildName) doFetch(guildName); }, [guildName]);

  // Auto-refresh with countdown
  useEffect(() => {
    if (!guildName || members.length === 0) return;
    const interval = setInterval(() => {
      setRefreshCountdown(prev => {
        if (prev <= 1) { doFetch(guildName); return 60; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [guildName, members.length, doFetch]);

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
    if (m.status !== 'online') return false;
    if (searchFilter && !m.name.toLowerCase().includes(searchFilter.toLowerCase())) return false;
    return true;
  });

  const grouped = useMemo(() => {
    const result: Record<MemberCategory, typeof filtered> = { main: [], bomba: [], maker: [], outros: [] };
    filtered.forEach(m => {
      const cat = categories[m.name] || 'outros';
      result[cat].push(m);
    });
    Object.keys(result).forEach(k => {
      result[k as MemberCategory].sort((a, b) => b.level - a.level);
    });
    return result;
  }, [filtered, categories]);

  const getTodayLoginInfo = (name: string) => {
    const entries = getTodayLogins(name);
    return { entries, loginCount: entries.filter(e => e.status === 'online').length };
  };

  if (!guildName) {
    return (
      <div className="text-center py-16">
        <Globe className="h-16 w-16 mx-auto mb-4 text-muted-foreground/20" />
        <h2 className="text-xl font-bold text-foreground mb-2">Nenhuma guild configurada</h2>
        <p className="text-muted-foreground">Vá em <strong className="text-primary">Configurações → Guilds</strong> e adicione uma guild.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold gradient-text" style={{ fontFamily: "'MedievalSharp', cursive" }}>
            🎯 Exiva — {guildName}
          </h1>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse-neon" /> LIVE
            </span>
            {lastUpdate && <span>• Atualizado às {lastUpdate}</span>}
            <span className="font-mono text-xs text-primary">({refreshCountdown}s)</span>
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => doFetch(guildName)} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Atualizar
        </Button>
      </div>

      {/* Stats */}
      {members.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="glass-card rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-foreground">{members.length}</p>
            <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1"><Users className="h-3 w-3" /> Total</p>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-online stat-glow">{onlineCount}</p>
            <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
              <span className="w-2 h-2 rounded-full bg-online animate-pulse-neon" /> Online
            </p>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-offline">{offlineCount}</p>
            <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1"><UserX className="h-3 w-3" /> Offline</p>
          </div>
        </div>
      )}

      {/* Search */}
      <Input value={searchFilter} onChange={e => setSearchFilter(e.target.value)} placeholder="Filtrar jogadores online..." className="bg-secondary border-border" />

      {/* 4 Columns */}
      {members.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {CATEGORIES.map(cat => {
            const cfg = CATEGORY_CONFIG[cat];
            const list = grouped[cat];
            return (
              <motion.div
                key={cat}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl border ${cfg.color} overflow-hidden ${cfg.glow ? `shadow-lg ${cfg.glow}` : ''}`}
              >
                <div className="px-3 py-2.5 border-b border-border/30 flex items-center justify-between bg-gradient-to-r from-transparent to-transparent">
                  <span className="font-bold text-sm flex items-center gap-1.5">
                    {cfg.emoji} {cfg.label}
                    <span className="text-xs font-mono text-muted-foreground">({list.length})</span>
                  </span>
                </div>
                <div className="divide-y divide-border/20 max-h-[500px] overflow-y-auto">
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
                    <div className="p-6 text-center text-xs text-muted-foreground/50">Nenhum membro online</div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Deaths Section */}
      {members.length > 0 && (
        <div className="glass-card rounded-xl overflow-hidden">
          <button
            onClick={() => { setShowDeaths(!showDeaths); if (!showDeaths && deaths.length === 0) fetchDeaths(); }}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-secondary/30 transition-colors"
          >
            <div className="flex items-center gap-2 font-semibold text-sm">
              <Skull className="h-4 w-4 text-destructive" />
              Últimas Mortes
              <span className="text-xs font-mono text-muted-foreground">({deaths.length})</span>
            </div>
            <div className="flex items-center gap-2">
              {loadingDeaths && <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />}
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); fetchDeaths(); }}>
                <RefreshCw className="h-3 w-3" />
              </Button>
              {showDeaths ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </div>
          </button>
          {showDeaths && (
            <div className="divide-y divide-border/30 border-t border-border/30">
              {deaths.map((d, i) => (
                <motion.div
                  key={`${d.name}-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="px-4 py-2.5 flex items-center gap-3 text-sm hover:bg-destructive/5 transition-colors"
                >
                  <Skull className="h-3.5 w-3.5 text-destructive shrink-0" />
                  <span className="font-medium text-foreground">{d.name}</span>
                  <span className="text-xs text-muted-foreground font-mono">Lv{d.level}</span>
                  <span className="flex-1 text-xs text-muted-foreground truncate">
                    {d.killers?.filter(k => k.player).map(k => k.name).join(', ') || d.reason || 'Unknown'}
                  </span>
                  <span className="text-[11px] text-muted-foreground shrink-0 font-mono">
                    {d.time ? new Date(d.time).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </motion.div>
              ))}
              {deaths.length === 0 && !loadingDeaths && (
                <div className="p-8 text-center text-sm text-muted-foreground/50">Nenhuma morte recente</div>
              )}
              {loadingDeaths && deaths.length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground">
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

// --- Member Row ---
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
    <div className="px-3 py-2 hover:bg-secondary/30 transition-colors">
      <div className="flex items-center gap-2 cursor-pointer" onClick={onToggleExpand}>
        <div className="relative">
          <StatusDot status={m.status} />
        </div>
        <VocationIcon vocation={m.vocation} className={`h-3.5 w-3.5 ${getVocationColor(m.vocation)}`} />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-foreground truncate block">{m.name}</span>
          <span className="text-[10px] text-muted-foreground">{m.vocation} • Lv {m.level}</span>
        </div>
        <select
          value={category}
          onChange={e => { e.stopPropagation(); onSetCategory(m.name, e.target.value as MemberCategory); }}
          onClick={e => e.stopPropagation()}
          className="text-[10px] px-1.5 py-0.5 rounded-md bg-secondary border border-border text-foreground cursor-pointer hover:border-primary/30 transition-colors"
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
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 truncate max-w-[130px]">
                {m.annotation}
              </span>
            )}
            <button
              onClick={e => { e.stopPropagation(); setEditingAnnotation(m.name); setAnnotationText(m.annotation || ''); }}
              className="text-muted-foreground hover:text-primary transition-colors ml-auto opacity-0 group-hover:opacity-100"
            >
              <Pencil className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      {/* Expanded */}
      {expanded && loginInfo && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="mt-2 p-2 rounded-lg bg-secondary/30 border border-border/30 text-[10px] space-y-1"
        >
          <div className="flex items-center gap-1 font-semibold text-foreground">
            <CalendarDays className="h-3 w-3" />
            Hoje: {loginInfo.loginCount} login(s)
          </div>
          {loginInfo.entries.length > 0 ? (
            <div className="space-y-0.5 max-h-24 overflow-y-auto">
              {loginInfo.entries.map((e, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <StatusDot status={e.status} size="sm" />
                  <span className="text-muted-foreground font-mono">
                    {new Date(e.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className={e.status === 'online' ? 'text-online' : 'text-offline'}>
                    {e.status === 'online' ? 'Logou' : 'Deslogou'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-muted-foreground">Sem registros hoje</span>
          )}
        </motion.div>
      )}
    </div>
  );
}
