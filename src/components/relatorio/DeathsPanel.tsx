import { useState } from 'react';
import { motion } from 'framer-motion';
import { Skull, Swords, Bug, ChevronDown, ChevronUp } from 'lucide-react';
import { CharacterDeath } from '@/lib/tibia-api';

export default function DeathsPanel({ deaths, loading, progress }: { deaths: CharacterDeath[]; loading: boolean; progress?: { loaded: number; total: number } | null }) {
  const [filter, setFilter] = useState<'all' | 'pvp' | 'pve'>('all');
  const [expanded, setExpanded] = useState(false);

  const pvpDeaths = deaths.filter(d => d.killers?.some(k => k.player));
  const pveDeaths = deaths.filter(d => !d.killers?.some(k => k.player));

  const filtered = filter === 'pvp' ? pvpDeaths : filter === 'pve' ? pveDeaths : deaths;
  const shown = expanded ? filtered : filtered.slice(0, 10);

  // Top killers (players who killed us the most)
  const killerCount: Record<string, number> = {};
  pvpDeaths.forEach(d => {
    d.killers?.filter(k => k.player).forEach(k => {
      killerCount[k.name] = (killerCount[k.name] || 0) + 1;
    });
  });
  const topKillers = Object.entries(killerCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="panel rounded-lg overflow-hidden"
    >
      <div className="px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Skull className="h-3.5 w-3.5 text-destructive" />
          <span className="font-display text-[10px] font-semibold uppercase tracking-wider text-foreground">
            MORTES RECENTES
          </span>
          <span className="text-[9px] font-mono text-muted-foreground">{deaths.length}</span>
          <div className="ml-auto flex gap-1">
            {(['all', 'pvp', 'pve'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-[8px] px-1.5 py-0.5 rounded flex items-center gap-0.5 transition-colors ${
                  filter === f ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {f === 'pvp' && <Swords className="h-2.5 w-2.5" />}
                {f === 'pve' && <Bug className="h-2.5 w-2.5" />}
                {f === 'all' ? 'Todas' : f === 'pvp' ? `PvP (${pvpDeaths.length})` : `PvE (${pveDeaths.length})`}
              </button>
            ))}
          </div>
        </div>

        {/* PvP summary bar */}
        {deaths.length > 0 && (
          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden flex">
              <div
                className="h-full bg-destructive/80 transition-all"
                style={{ width: `${(pvpDeaths.length / Math.max(1, deaths.length)) * 100}%` }}
              />
              <div
                className="h-full bg-afk/50 transition-all"
                style={{ width: `${(pveDeaths.length / Math.max(1, deaths.length)) * 100}%` }}
              />
            </div>
            <span className="text-[7px] text-muted-foreground shrink-0">
              <span className="text-destructive">{Math.round((pvpDeaths.length / Math.max(1, deaths.length)) * 100)}% PvP</span>
            </span>
          </div>
        )}

        {/* Top killers */}
        {topKillers.length > 0 && (
          <div className="mt-1.5 flex items-center gap-1 flex-wrap">
            <span className="text-[7px] text-muted-foreground">Top killers:</span>
            {topKillers.map(([name, count]) => (
              <span key={name} className="text-[8px] px-1 py-0.5 rounded bg-destructive/10 border border-destructive/20 text-destructive font-mono">
                {name} <span className="font-bold">×{count}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className={`divide-y divide-border/30 ${expanded ? 'max-h-[400px]' : 'max-h-[250px]'} overflow-y-auto`}>
        {loading && (
          <div className="p-4 text-center text-[10px] text-muted-foreground animate-pulse">Buscando mortes...</div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="p-4 text-center text-[10px] text-muted-foreground/40">
            {filter === 'pvp' ? 'Sem mortes PvP 🛡️' : filter === 'pve' ? 'Sem mortes PvE 🎉' : 'Nenhuma morte recente 🎉'}
          </div>
        )}
        {shown.map((d, i) => {
          const isPvP = d.killers?.some(k => k.player);
          const playerKillers = d.killers?.filter(k => k.player).map(k => k.name) || [];
          const creatureKillers = d.killers?.filter(k => !k.player).map(k => k.name) || [];

          return (
            <div key={i} className="px-3 py-1.5 flex items-start gap-2 hover:bg-secondary/30 transition-colors">
              <div className={`shrink-0 mt-0.5 p-0.5 rounded ${isPvP ? 'bg-destructive/10' : 'bg-afk/10'}`}>
                {isPvP ? <Swords className="h-2.5 w-2.5 text-destructive" /> : <Bug className="h-2.5 w-2.5 text-afk" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-foreground">{d.name}</span>
                  <span className="text-[9px] text-muted-foreground font-mono">Lv{d.level}</span>
                  <span className={`text-[7px] px-1 rounded ${isPvP ? 'bg-destructive/10 text-destructive' : 'bg-afk/10 text-afk'}`}>
                    {isPvP ? 'PvP' : 'PvE'}
                  </span>
                </div>
                <div className="text-[8px] text-muted-foreground truncate">
                  {isPvP ? (
                    <>
                      <span className="text-destructive">Killed by:</span> {playerKillers.join(', ')}
                      {creatureKillers.length > 0 && <span className="text-muted-foreground/40"> + {creatureKillers.join(', ')}</span>}
                    </>
                  ) : (
                    creatureKillers.join(', ') || 'Desconhecido'
                  )}
                </div>
              </div>
              <span className="text-[8px] text-muted-foreground font-mono shrink-0">
                {d.time ? new Date(d.time).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}
              </span>
            </div>
          );
        })}
      </div>

      {filtered.length > 10 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full py-1.5 text-[9px] text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 border-t border-border/30 transition-colors"
        >
          {expanded ? <><ChevronUp className="h-3 w-3" /> Mostrar menos</> : <><ChevronDown className="h-3 w-3" /> Ver todas ({filtered.length})</>}
        </button>
      )}
    </motion.div>
  );
}
