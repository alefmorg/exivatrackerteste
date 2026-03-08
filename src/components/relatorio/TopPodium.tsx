import { motion } from 'framer-motion';
import { VocationIcon, getVocationColor } from '@/components/TibiaIcons';
import { Trophy } from 'lucide-react';

interface Player {
  name: string;
  vocation: string;
  level: number;
  levelsGainedToday: number;
}

export default function TopPodium({ players, period }: { players: Player[]; period: 'today' | 'week' }) {
  const top = players
    .filter(p => (period === 'today' ? p.levelsGainedToday : p.levelsGainedToday) > 0)
    .sort((a, b) => b.levelsGainedToday - a.levelsGainedToday)
    .slice(0, 3);

  if (top.length === 0) return null;

  const medals = ['🥇', '🥈', '🥉'];
  const heights = ['h-20', 'h-14', 'h-10'];
  const order = top.length >= 3 ? [1, 0, 2] : top.length === 2 ? [1, 0] : [0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 }}
      className="panel rounded-lg p-3"
    >
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="h-3.5 w-3.5 text-primary" />
        <span className="font-display text-[10px] font-semibold uppercase tracking-wider text-foreground">
          PÓDIO — {period === 'today' ? 'HOJE' : '7 DIAS'}
        </span>
      </div>

      <div className="flex items-end justify-center gap-3">
        {order.map(idx => {
          const p = top[idx];
          if (!p) return null;
          return (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.1 }}
              className="flex flex-col items-center"
            >
              <span className="text-lg mb-1">{medals[idx]}</span>
              <VocationIcon vocation={p.vocation} className={`h-5 w-5 ${getVocationColor(p.vocation)} mb-1`} />
              <span className="text-[9px] font-semibold text-foreground text-center truncate max-w-[70px]">{p.name}</span>
              <span className="text-[8px] text-muted-foreground font-mono mb-1">Lv{p.level}</span>
              <div className={`w-16 ${heights[idx]} rounded-t-md bg-primary/20 border border-primary/30 border-b-0 flex items-center justify-center`}>
                <span className="text-xs font-bold font-mono text-primary">+{p.levelsGainedToday}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
