import { motion } from 'framer-motion';
import { Skull } from 'lucide-react';
import { CharacterDeath } from '@/lib/tibia-api';

export default function DeathsPanel({ deaths, loading }: { deaths: CharacterDeath[]; loading: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="panel rounded-lg overflow-hidden"
    >
      <div className="px-3 py-2 border-b border-border flex items-center gap-2">
        <Skull className="h-3.5 w-3.5 text-destructive" />
        <span className="font-display text-[10px] font-semibold uppercase tracking-wider text-foreground">
          MORTES RECENTES
        </span>
        <span className="text-[9px] font-mono text-muted-foreground">{deaths.length}</span>
      </div>

      <div className="divide-y divide-border/30 max-h-[250px] overflow-y-auto">
        {loading && (
          <div className="p-4 text-center text-[10px] text-muted-foreground animate-pulse">Buscando mortes...</div>
        )}
        {!loading && deaths.length === 0 && (
          <div className="p-4 text-center text-[10px] text-muted-foreground/40">Nenhuma morte recente 🎉</div>
        )}
        {deaths.slice(0, 15).map((d, i) => (
          <div key={i} className="px-3 py-1.5 flex items-start gap-2 hover:bg-secondary/30 transition-colors">
            <Skull className="h-3 w-3 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-foreground">{d.name}</span>
                <span className="text-[9px] text-muted-foreground font-mono">Lv{d.level}</span>
              </div>
              <div className="text-[8px] text-muted-foreground truncate">
                {d.killers?.filter(k => k.player).map(k => k.name).join(', ') || 'PvE'}
              </div>
            </div>
            <span className="text-[8px] text-muted-foreground font-mono shrink-0">
              {d.time ? new Date(d.time).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
