import { useState, useEffect, useMemo } from 'react';
import { getAllLevelHistory, LevelRecord, getMonitoredGuildsAsync } from '@/lib/storage';
import { fetchGuildMembers } from '@/lib/tibia-api';
import { GuildMember } from '@/types/tibia';
import PageHeader from '@/components/PageHeader';
import { Input } from '@/components/ui/input';
import { VocationIcon, getVocationColor, ItemSprite } from '@/components/TibiaIcons';
import StatusDot from '@/components/StatusDot';
import { SkeletonRow } from '@/components/SkeletonLoader';
import EmptyState from '@/components/EmptyState';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowUpRight, Clock, Calendar } from 'lucide-react';

interface MemberReport {
  name: string;
  vocation: string;
  level: number;
  status: 'online' | 'offline';
  levelsGainedToday: number;
  levelsGainedWeek: number;
  levelUps: Array<{ from: number; to: number; time: string }>;
  firstSeenLevel: number;
}

export default function RelatorioPage() {
  const [members, setMembers] = useState<GuildMember[]>([]);
  const [levelHistory, setLevelHistory] = useState<LevelRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'levels_today' | 'levels_week' | 'level'>('levels_today');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const guilds = await getMonitoredGuildsAsync();
        if (guilds.length === 0) { setLoading(false); return; }

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const [guildMembers, history] = await Promise.all([
          fetchGuildMembers(guilds[0].name),
          getAllLevelHistory(weekAgo),
        ]);

        setMembers(guildMembers);
        setLevelHistory(history);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const reports: MemberReport[] = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    return members.map(m => {
      const charHistory = levelHistory.filter(h => h.char_name === m.name);
      const todayHistory = charHistory.filter(h => h.recorded_at >= todayISO);

      // Calculate level ups (transitions)
      const levelUps: Array<{ from: number; to: number; time: string }> = [];
      for (let i = 1; i < charHistory.length; i++) {
        if (charHistory[i].level > charHistory[i - 1].level) {
          levelUps.push({
            from: charHistory[i - 1].level,
            to: charHistory[i].level,
            time: charHistory[i].recorded_at,
          });
        }
      }

      const firstSeenLevel = charHistory.length > 0 ? charHistory[0].level : m.level;
      const firstTodayLevel = todayHistory.length > 0 ? todayHistory[0].level : m.level;

      return {
        name: m.name,
        vocation: m.vocation,
        level: m.level,
        status: m.status,
        levelsGainedToday: m.level - firstTodayLevel,
        levelsGainedWeek: m.level - firstSeenLevel,
        levelUps,
        firstSeenLevel,
      };
    });
  }, [members, levelHistory]);

  const filtered = useMemo(() => {
    let list = reports.filter(r => !search || r.name.toLowerCase().includes(search.toLowerCase()));
    list.sort((a, b) => {
      if (sortBy === 'levels_today') return b.levelsGainedToday - a.levelsGainedToday;
      if (sortBy === 'levels_week') return b.levelsGainedWeek - a.levelsGainedWeek;
      return b.level - a.level;
    });
    return list;
  }, [reports, search, sortBy]);

  const totalLevelsToday = reports.reduce((s, r) => s + Math.max(0, r.levelsGainedToday), 0);
  const playersUpToday = reports.filter(r => r.levelsGainedToday > 0).length;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 animate-pulse">
          <div className="w-1 h-8 rounded-full bg-secondary" />
          <div className="h-5 w-48 bg-secondary rounded" />
        </div>
        {Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <EmptyState
        icon="globe"
        title="Sem dados de guild"
        description="Configure uma guild em Config → Guilds para gerar relatórios."
        actionLabel="Ir para Config"
        onAction={() => window.location.href = '/configuracoes'}
      />
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="RELATÓRIO DE LEVELS"
        icon="exiva"
        subtitle={
          <>
            <span className="text-primary font-semibold">{playersUpToday}</span>
            <span>uparam hoje</span>
            <span>•</span>
            <span className="text-primary font-semibold">+{totalLevelsToday}</span>
            <span>levels</span>
          </>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}
          className="panel rounded-lg p-3 border-t-2 border-t-primary">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Levels Hoje</span>
          </div>
          <span className="text-xl font-bold font-mono text-primary">+{totalLevelsToday}</span>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="panel rounded-lg p-3 border-t-2 border-t-online">
          <div className="flex items-center gap-2 mb-1">
            <ArrowUpRight className="h-3.5 w-3.5 text-online" />
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Uparam Hoje</span>
          </div>
          <span className="text-xl font-bold font-mono text-online">{playersUpToday}</span>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="panel rounded-lg p-3 border-t-2 border-t-afk">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="h-3.5 w-3.5 text-afk" />
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Levels 7d</span>
          </div>
          <span className="text-xl font-bold font-mono text-afk">+{reports.reduce((s, r) => s + Math.max(0, r.levelsGainedWeek), 0)}</span>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="panel rounded-lg p-3 border-t-2 border-t-muted-foreground/30">
          <div className="flex items-center gap-2 mb-1">
            <ItemSprite item="shield" className="h-3.5 w-3.5" />
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Membros</span>
          </div>
          <span className="text-xl font-bold font-mono text-foreground">{members.length}</span>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2">
            <ItemSprite item="search" className="h-4 w-4" />
          </div>
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Filtrar jogador..." className="pl-8 h-8 text-xs bg-secondary/50 border-border" />
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
          className="text-[10px] px-2 py-1.5 rounded bg-secondary border border-border text-foreground cursor-pointer">
          <option value="levels_today">📈 Levels Hoje</option>
          <option value="levels_week">📊 Levels 7d</option>
          <option value="level">⚔️ Level Atual</option>
        </select>
      </div>

      {/* Table */}
      <div className="panel rounded-lg overflow-hidden">
        <div className="px-3 py-2 border-b border-border flex items-center gap-2">
          <ItemSprite item="exiva" className="h-4 w-4" />
          <span className="font-display text-[10px] font-semibold uppercase tracking-wider text-foreground">
            DETALHAMENTO POR MEMBRO
          </span>
          <span className="text-[9px] font-mono text-muted-foreground">{filtered.length}</span>
        </div>
        <div className="divide-y divide-border/30 max-h-[600px] overflow-y-auto">
          {filtered.map((r, idx) => (
            <ReportRow key={r.name} report={r} index={idx} />
          ))}
          {filtered.length === 0 && (
            <div className="p-6 text-center text-[10px] text-muted-foreground/40">Nenhum resultado</div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReportRow({ report: r, index }: { report: MemberReport; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const todayLevelUps = r.levelUps.filter(u => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(u.time) >= today;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.02 }}
      className="hover:bg-secondary/30 transition-colors"
    >
      <div className="px-3 py-2 flex items-center gap-2 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <StatusDot status={r.status} />
        <VocationIcon vocation={r.vocation} className={`h-4 w-4 ${getVocationColor(r.vocation)}`} />
        <div className="flex-1 min-w-0">
          <span className="text-xs font-semibold text-foreground truncate block">{r.name}</span>
          <span className="text-[9px] text-muted-foreground font-mono">Lv{r.level} • {r.vocation}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {r.levelsGainedToday > 0 ? (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20">
              <TrendingUp className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-bold font-mono text-primary">+{r.levelsGainedToday}</span>
              <span className="text-[8px] text-muted-foreground">hoje</span>
            </div>
          ) : (
            <span className="text-[9px] text-muted-foreground/40 font-mono">0 hoje</span>
          )}
          {r.levelsGainedWeek > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-mono text-afk">+{r.levelsGainedWeek}</span>
              <span className="text-[8px] text-muted-foreground">7d</span>
            </div>
          )}
        </div>
      </div>

      {expanded && todayLevelUps.length > 0 && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="px-3 pb-2"
        >
          <div className="p-2 rounded bg-secondary/40 border border-border/30 space-y-1">
            <div className="flex items-center gap-1 text-[9px] font-semibold text-foreground">
              <Clock className="h-2.5 w-2.5" /> Level ups hoje
            </div>
            {todayLevelUps.map((u, i) => (
              <div key={i} className="flex items-center gap-2 text-[9px]">
                <span className="font-mono text-muted-foreground">
                  {new Date(u.time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-muted-foreground">Lv{u.from}</span>
                <span className="text-primary">→</span>
                <span className="text-primary font-semibold">Lv{u.to}</span>
                <span className="text-[8px] text-muted-foreground/60">(+{u.to - u.from})</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {expanded && todayLevelUps.length === 0 && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="px-3 pb-2"
        >
          <div className="p-2 rounded bg-secondary/40 border border-border/30 text-[9px] text-muted-foreground/50">
            Sem level ups registrados hoje
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
