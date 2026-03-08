import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';
import { LevelRecord } from '@/lib/storage';
import { useState } from 'react';

interface Props {
  levelHistory: LevelRecord[];
  members: Array<{ name: string; level: number }>;
}

export default function LevelChart({ levelHistory, members }: Props) {
  const [view, setView] = useState<'timeline' | 'bar'>('bar');

  // Bar chart: top 15 gainers this week
  const gainMap: Record<string, { first: number; current: number }> = {};
  levelHistory.forEach(h => {
    if (!gainMap[h.char_name]) gainMap[h.char_name] = { first: h.level, current: h.level };
    gainMap[h.char_name].current = h.level;
  });

  // Also add current levels from members
  members.forEach(m => {
    if (gainMap[m.name]) gainMap[m.name].current = m.level;
  });

  const barData = Object.entries(gainMap)
    .map(([name, d]) => ({ name: name.length > 12 ? name.substring(0, 12) + '…' : name, gained: d.current - d.first }))
    .filter(d => d.gained > 0)
    .sort((a, b) => b.gained - a.gained)
    .slice(0, 15);

  // Timeline: levels gained per day
  const dayMap: Record<string, number> = {};
  const sorted = [...levelHistory].sort((a, b) => a.recorded_at.localeCompare(b.recorded_at));
  const charLastLevel: Record<string, number> = {};

  sorted.forEach(h => {
    const day = h.recorded_at.substring(0, 10);
    const prev = charLastLevel[h.char_name] || h.level;
    const gained = h.level - prev;
    if (gained > 0) dayMap[day] = (dayMap[day] || 0) + gained;
    charLastLevel[h.char_name] = h.level;
  });

  const timelineData = Object.entries(dayMap)
    .map(([date, levels]) => ({
      date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      levels,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="panel rounded-lg p-3"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="font-display text-[10px] font-semibold uppercase tracking-wider text-foreground">
          {view === 'bar' ? 'TOP GAINERS (7D)' : 'LEVELS POR DIA'}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => setView('bar')}
            className={`text-[9px] px-2 py-0.5 rounded transition-colors ${view === 'bar' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Ranking
          </button>
          <button
            onClick={() => setView('timeline')}
            className={`text-[9px] px-2 py-0.5 rounded transition-colors ${view === 'timeline' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Timeline
          </button>
        </div>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          {view === 'bar' ? (
            <BarChart data={barData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 12%)" />
              <XAxis dataKey="name" tick={{ fontSize: 8, fill: 'hsl(35 5% 45%)' }} angle={-45} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 9, fill: 'hsl(35 5% 45%)' }} width={30} />
              <Tooltip
                contentStyle={{ background: 'hsl(0 0% 7%)', border: '1px solid hsl(0 0% 12%)', borderRadius: 8, fontSize: 11 }}
                itemStyle={{ color: 'hsl(35 15% 85%)' }}
                formatter={(value: number) => [`+${value} levels`, 'Ganho']}
              />
              <Bar dataKey="gained" fill="hsl(25 95% 50%)" radius={[3, 3, 0, 0]} />
            </BarChart>
          ) : (
            <AreaChart data={timelineData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 12%)" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'hsl(35 5% 45%)' }} />
              <YAxis tick={{ fontSize: 9, fill: 'hsl(35 5% 45%)' }} width={30} />
              <Tooltip
                contentStyle={{ background: 'hsl(0 0% 7%)', border: '1px solid hsl(0 0% 12%)', borderRadius: 8, fontSize: 11 }}
                itemStyle={{ color: 'hsl(35 15% 85%)' }}
                formatter={(value: number) => [`+${value} levels`, 'Total']}
              />
              <Area type="monotone" dataKey="levels" stroke="hsl(25 95% 50%)" fill="hsl(25 95% 50% / 0.15)" strokeWidth={2} />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
