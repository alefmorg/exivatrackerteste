import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { VocationIcon } from '@/components/TibiaIcons';

interface VocData {
  name: string;
  short: string;
  count: number;
  avgLevel: number;
  levelsToday: number;
  color: string;
}

export default function VocationBreakdown({ members }: { members: Array<{ vocation: string; level: number; levelsGainedToday: number }> }) {
  const vocMap: Record<string, { count: number; totalLevel: number; levelsToday: number }> = {};

  members.forEach(m => {
    const voc = m.vocation.toLowerCase();
    let key = 'Outro';
    if (voc.includes('knight')) key = 'Knight';
    else if (voc.includes('paladin')) key = 'Paladin';
    else if (voc.includes('druid')) key = 'Druid';
    else if (voc.includes('sorcerer')) key = 'Sorcerer';

    if (!vocMap[key]) vocMap[key] = { count: 0, totalLevel: 0, levelsToday: 0 };
    vocMap[key].count++;
    vocMap[key].totalLevel += m.level;
    vocMap[key].levelsToday += Math.max(0, m.levelsGainedToday);
  });

  const colors: Record<string, string> = {
    Knight: 'hsl(0, 72%, 55%)',
    Paladin: 'hsl(45, 93%, 55%)',
    Druid: 'hsl(142, 76%, 50%)',
    Sorcerer: 'hsl(220, 80%, 60%)',
    Outro: 'hsl(0, 0%, 40%)',
  };

  const vocData: VocData[] = Object.entries(vocMap).map(([name, d]) => ({
    name,
    short: name.substring(0, 2).toUpperCase(),
    count: d.count,
    avgLevel: Math.round(d.totalLevel / d.count),
    levelsToday: d.levelsToday,
    color: colors[name] || colors.Outro,
  })).sort((a, b) => b.count - a.count);

  const total = members.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="panel rounded-lg p-3"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="font-display text-[10px] font-semibold uppercase tracking-wider text-foreground">
          DISTRIBUIÇÃO POR VOCAÇÃO
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-24 h-24 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={vocData}
                cx="50%"
                cy="50%"
                innerRadius={25}
                outerRadius={42}
                paddingAngle={2}
                dataKey="count"
                strokeWidth={0}
              >
                {vocData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: 'hsl(0 0% 7%)', border: '1px solid hsl(0 0% 12%)', borderRadius: 8, fontSize: 11 }}
                itemStyle={{ color: 'hsl(35 15% 85%)' }}
                formatter={(value: number, name: string) => [`${value} (${Math.round((value / total) * 100)}%)`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-1.5">
          {vocData.map(v => (
            <div key={v.name} className="flex items-center gap-2">
              <VocationIcon vocation={v.name} className="h-4 w-4" />
              <span className="text-[10px] font-semibold text-foreground w-16 truncate">{v.name}</span>
              <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${(v.count / total) * 100}%`, background: v.color }} />
              </div>
              <span className="text-[9px] font-mono text-muted-foreground w-6 text-right">{v.count}</span>
              <span className="text-[8px] font-mono text-primary w-12 text-right">+{v.levelsToday}lvl</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
