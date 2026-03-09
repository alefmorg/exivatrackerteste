import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, ChevronDown, ChevronUp, Zap, Flame } from 'lucide-react';
import { VocationIcon, getVocationColor, ItemSprite } from '@/components/TibiaIcons';
import StatusDot from '@/components/StatusDot';
import { formatXp } from '@/lib/tibia-api';

export interface MemberReport {
  name: string;
  vocation: string;
  level: number;
  status: 'online' | 'offline';
  levelsGainedToday: number;
  levelsGainedWeek: number;
  xpGainedToday: number;
  xpGainedWeek: number;
  levelUps: Array<{ from: number; to: number; time: string; xpGained: number }>;
  firstSeenLevel: number;
}

export default function MemberTable({
  members,
  search,
  setSearch,
  sortBy,
  setSortBy,
}: {
  members: MemberReport[];
  search: string;
  setSearch: (s: string) => void;
  sortBy: string;
  setSortBy: (s: string) => void;
}) {
  // Calculate totals
  const totalXpToday = members.reduce((s, m) => s + Math.max(0, m.xpGainedToday), 0);
  const totalXpWeek = members.reduce((s, m) => s + Math.max(0, m.xpGainedWeek), 0);
  const activeToday = members.filter(m => m.xpGainedToday > 0).length;

  return (
    <div className="panel rounded-lg overflow-hidden">
      {/* Header with totals */}
      <div className="px-3 py-2 border-b border-border bg-secondary/20">
        <div className="flex items-center gap-2 mb-2">
          <ItemSprite item="exiva" className="h-4 w-4" />
          <span className="font-display text-[10px] font-semibold uppercase tracking-wider text-foreground">
            DETALHAMENTO POR MEMBRO
          </span>
          <span className="text-[9px] font-mono text-muted-foreground">{members.length}</span>
        </div>
        <div className="flex items-center gap-4 text-[9px]">
          <div className="flex items-center gap-1.5">
            <Zap className="h-3 w-3 text-primary" />
            <span className="text-muted-foreground">XP Hoje:</span>
            <span className="font-mono font-semibold text-primary">{formatXp(totalXpToday)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Flame className="h-3 w-3 text-afk" />
            <span className="text-muted-foreground">XP 7d:</span>
            <span className="font-mono font-semibold text-afk">{formatXp(totalXpWeek)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3 w-3 text-online" />
            <span className="text-muted-foreground">Ativos:</span>
            <span className="font-mono font-semibold text-online">{activeToday}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-3 py-2 border-b border-border flex items-center gap-2">
        <div className="relative flex-1 max-w-[200px]">
          <div className="absolute left-2 top-1/2 -translate-y-1/2">
            <ItemSprite item="search" className="h-3.5 w-3.5" />
          </div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filtrar por nome..."
            className="w-full pl-7 pr-2 h-6 text-[10px] rounded bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="text-[9px] px-2 py-1 rounded bg-secondary border border-border text-foreground cursor-pointer"
        >
          <option value="xp_today">⚡ XP Hoje</option>
          <option value="xp_week">🔥 XP 7d</option>
          <option value="levels_today">📈 Lvls Hoje</option>
          <option value="levels_week">📊 Lvls 7d</option>
          <option value="level">⚔️ Level</option>
          <option value="name">🔤 Nome</option>
        </select>
      </div>

      {/* Member list */}
      <div className="divide-y divide-border/30 max-h-[500px] overflow-y-auto">
        {members.map((r, idx) => (
          <ReportRow key={r.name} report={r} index={idx} />
        ))}
        {members.length === 0 && (
          <div className="p-6 text-center text-[10px] text-muted-foreground/40">Nenhum resultado</div>
        )}
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
      transition={{ delay: index * 0.01 }}
      className="hover:bg-secondary/30 transition-colors"
    >
      <div className="px-3 py-2 flex items-center gap-2 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <StatusDot status={r.status} />
        <VocationIcon vocation={r.vocation} className={`h-4 w-4 ${getVocationColor(r.vocation)}`} />
        
        {/* Name and level */}
        <div className="flex-1 min-w-0">
          <span className="text-[11px] font-semibold text-foreground truncate block">{r.name}</span>
          <span className="text-[9px] text-muted-foreground font-mono">Lv{r.level} • {r.vocation}</span>
        </div>

        {/* XP and Level gains */}
        <div className="flex items-center gap-3 shrink-0">
          {/* XP Today */}
          {r.xpGainedToday > 0 ? (
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20">
                <Zap className="h-2.5 w-2.5 text-primary" />
                <span className="text-[10px] font-bold font-mono text-primary">{formatXp(r.xpGainedToday)}</span>
              </div>
              {r.levelsGainedToday > 0 && (
                <span className="text-[8px] text-muted-foreground font-mono">+{r.levelsGainedToday} lvl</span>
              )}
            </div>
          ) : (
            <span className="text-[9px] text-muted-foreground/40 font-mono">0 xp</span>
          )}

          {/* XP Week */}
          {r.xpGainedWeek > 0 && (
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-0.5">
                <Flame className="h-2.5 w-2.5 text-afk" />
                <span className="text-[9px] font-mono text-afk font-semibold">{formatXp(r.xpGainedWeek)}</span>
              </div>
              <span className="text-[7px] text-muted-foreground">7d</span>
            </div>
          )}

          {expanded ? <ChevronUp className="h-3 w-3 text-muted-foreground" /> : <ChevronDown className="h-3 w-3 text-muted-foreground" />}
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="px-3 pb-2"
        >
          <div className="p-2 rounded bg-secondary/40 border border-border/30 space-y-2">
            {/* Today's level ups with XP */}
            {todayLevelUps.length > 0 ? (
              <>
                <div className="flex items-center gap-1 text-[9px] font-semibold text-foreground">
                  <Clock className="h-2.5 w-2.5" /> Level ups hoje
                </div>
                <div className="space-y-1">
                  {todayLevelUps.map((u, i) => (
                    <div key={i} className="flex items-center gap-2 text-[9px]">
                      <span className="font-mono text-muted-foreground w-12">
                        {new Date(u.time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-muted-foreground">Lv{u.from}</span>
                      <span className="text-primary">→</span>
                      <span className="text-primary font-semibold">Lv{u.to}</span>
                      <span className="text-[8px] text-muted-foreground/60">(+{u.to - u.from})</span>
                      {u.xpGained > 0 && (
                        <span className="ml-auto text-[8px] font-mono text-primary/70">+{formatXp(u.xpGained)} xp</span>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-[9px] text-muted-foreground/50">Sem level ups registrados hoje</div>
            )}

            {/* Weekly summary */}
            {r.levelsGainedWeek > 0 && (
              <div className="text-[8px] text-muted-foreground pt-2 border-t border-border/20 space-y-0.5">
                <div>
                  Progresso 7d: Lv{r.firstSeenLevel} → Lv{r.level}{' '}
                  <span className="text-afk font-semibold">(+{r.levelsGainedWeek} lvls)</span>
                </div>
                <div>
                  XP Total 7d: <span className="text-afk font-semibold font-mono">{formatXp(r.xpGainedWeek)}</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
