import { motion } from 'framer-motion';
import { AlertTriangle, Flame, Moon, TrendingDown } from 'lucide-react';
import { CharacterDeath } from '@/lib/tibia-api';
import { VocationIcon, getVocationColor } from '@/components/TibiaIcons';
import StatusDot from '@/components/StatusDot';

interface Props {
  members: Array<{ name: string; level: number; vocation: string; status: 'online' | 'offline' }>;
  loginHistory: Array<{ char_name: string; status: string; recorded_at: string }>;
  deaths: CharacterDeath[];
}

export default function ActivityRisk({ members, loginHistory, deaths }: Props) {
  // Calculate activity streaks: count distinct days each char was online in the last 7 days
  const streakMap: Record<string, Set<string>> = {};
  loginHistory.forEach(l => {
    if (l.status === 'online') {
      if (!streakMap[l.char_name]) streakMap[l.char_name] = new Set();
      streakMap[l.char_name].add(new Date(l.recorded_at).toISOString().substring(0, 10));
    }
  });

  const streaks = members.map(m => ({
    name: m.name,
    vocation: m.vocation,
    level: m.level,
    status: m.status,
    activeDays: streakMap[m.name]?.size || 0,
  }));

  // Most active
  const mostActive = [...streaks].sort((a, b) => b.activeDays - a.activeDays).slice(0, 5);

  // Inactive (0 days in the last 7)
  const inactive = streaks.filter(s => s.activeDays === 0);

  // Death risk: count PvP deaths per character
  const pvpDeathCount: Record<string, number> = {};
  deaths.forEach(d => {
    const hasPvP = d.killers?.some(k => k.player);
    if (hasPvP) {
      pvpDeathCount[d.name] = (pvpDeathCount[d.name] || 0) + 1;
    }
  });

  const riskPlayers = Object.entries(pvpDeathCount)
    .map(([name, count]) => {
      const m = members.find(mem => mem.name === name);
      return { name, deaths: count, level: m?.level || 0, vocation: m?.vocation || '' };
    })
    .sort((a, b) => b.deaths - a.deaths)
    .slice(0, 5);

  // Overall guild activity %
  const activeMembers = streaks.filter(s => s.activeDays > 0).length;
  const activityPct = members.length > 0 ? Math.round((activeMembers / members.length) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.22 }}
      className="panel rounded-lg p-3"
    >
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="h-3.5 w-3.5 text-afk" />
        <span className="font-display text-[10px] font-semibold uppercase tracking-wider text-foreground">
          ATIVIDADE & RISCO
        </span>
        <span className="ml-auto text-[9px] font-mono">
          <span className="text-primary font-bold">{activityPct}%</span>
          <span className="text-muted-foreground"> ativos 7d</span>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {/* Most Active */}
        <div className="p-2 rounded bg-secondary/30 border border-border/20">
          <div className="flex items-center gap-1 mb-2">
            <Flame className="h-3 w-3 text-online" />
            <span className="text-[8px] font-semibold uppercase tracking-wider text-online">Mais ativos</span>
          </div>
          <div className="space-y-1">
            {mostActive.map((p, i) => (
              <div key={p.name} className="flex items-center gap-1.5">
                <span className="text-[8px] font-mono text-muted-foreground w-3">{i + 1}.</span>
                <VocationIcon vocation={p.vocation} className={`h-3 w-3 ${getVocationColor(p.vocation)}`} />
                <span className="text-[9px] text-foreground truncate flex-1">{p.name}</span>
                <span className="text-[8px] font-mono text-online font-bold">{p.activeDays}d</span>
              </div>
            ))}
            {mostActive.length === 0 && (
              <span className="text-[8px] text-muted-foreground/40">Sem dados</span>
            )}
          </div>
        </div>

        {/* Inactive */}
        <div className="p-2 rounded bg-secondary/30 border border-border/20">
          <div className="flex items-center gap-1 mb-2">
            <Moon className="h-3 w-3 text-muted-foreground" />
            <span className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">Inativos 7d</span>
            <span className="text-[8px] font-mono text-destructive ml-auto">{inactive.length}</span>
          </div>
          <div className="space-y-1 max-h-[100px] overflow-y-auto">
            {inactive.slice(0, 8).map(p => (
              <div key={p.name} className="flex items-center gap-1.5">
                <StatusDot status="offline" />
                <span className="text-[9px] text-muted-foreground/60 truncate flex-1">{p.name}</span>
                <span className="text-[8px] font-mono text-muted-foreground/40">Lv{p.level}</span>
              </div>
            ))}
            {inactive.length > 8 && (
              <span className="text-[7px] text-muted-foreground/40">+{inactive.length - 8} mais...</span>
            )}
            {inactive.length === 0 && (
              <span className="text-[8px] text-online/60">Nenhum inativo! 🎉</span>
            )}
          </div>
        </div>

        {/* PvP Risk */}
        <div className="p-2 rounded bg-secondary/30 border border-border/20">
          <div className="flex items-center gap-1 mb-2">
            <TrendingDown className="h-3 w-3 text-destructive" />
            <span className="text-[8px] font-semibold uppercase tracking-wider text-destructive">Risco PvP</span>
          </div>
          <div className="space-y-1">
            {riskPlayers.map((p, i) => (
              <div key={p.name} className="flex items-center gap-1.5">
                <span className="text-[8px] font-mono text-muted-foreground w-3">{i + 1}.</span>
                <span className="text-[9px] text-foreground truncate flex-1">{p.name}</span>
                <span className="text-[8px] font-mono text-destructive font-bold">☠ {p.deaths}</span>
              </div>
            ))}
            {riskPlayers.length === 0 && (
              <span className="text-[8px] text-muted-foreground/40">Sem mortes PvP</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
