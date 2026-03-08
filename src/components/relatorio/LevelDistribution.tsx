import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { Layers } from 'lucide-react';

interface Props {
  members: Array<{ name: string; level: number; vocation: string; status: 'online' | 'offline' }>;
}

const RANGES = [
  { label: '1-50', min: 1, max: 50, color: 'hsl(200 60% 50%)' },
  { label: '51-100', min: 51, max: 100, color: 'hsl(180 60% 45%)' },
  { label: '101-200', min: 101, max: 200, color: 'hsl(140 55% 45%)' },
  { label: '201-300', min: 201, max: 300, color: 'hsl(80 60% 45%)' },
  { label: '301-400', min: 301, max: 400, color: 'hsl(45 80% 50%)' },
  { label: '401-500', min: 401, max: 500, color: 'hsl(25 90% 50%)' },
  { label: '501-700', min: 501, max: 700, color: 'hsl(10 85% 50%)' },
  { label: '701-1000', min: 701, max: 1000, color: 'hsl(350 80% 50%)' },
  { label: '1000+', min: 1001, max: 99999, color: 'hsl(280 70% 55%)' },
];

export default function LevelDistribution({ members }: Props) {
  const data = RANGES.map(r => ({
    range: r.label,
    total: members.filter(m => m.level >= r.min && m.level <= r.max).length,
    online: members.filter(m => m.level >= r.min && m.level <= r.max && m.status === 'online').length,
    color: r.color,
  })).filter(d => d.total > 0);

  const highestRange = members.length > 0
    ? RANGES.find(r => members.some(m => m.level >= r.min && m.level <= r.max))
    : null;

  const strongestRange = data.reduce<typeof data[0] | null>((best, d) => (!best || d.total > best.total) ? d : best, null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 }}
      className="panel rounded-lg p-3"
    >
      <div className="flex items-center gap-2 mb-1">
        <Layers className="h-3.5 w-3.5 text-primary" />
        <span className="font-display text-[10px] font-semibold uppercase tracking-wider text-foreground">
          DISTRIBUIÇÃO POR FAIXA DE LEVEL
        </span>
      </div>
      {strongestRange && (
        <div className="text-[8px] text-muted-foreground mb-2">
          Maior concentração: <span className="text-primary font-semibold">{strongestRange.range}</span> com {strongestRange.total} membros
        </div>
      )}

      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 12%)" />
            <XAxis dataKey="range" tick={{ fontSize: 9, fill: 'hsl(35 5% 45%)' }} />
            <YAxis tick={{ fontSize: 9, fill: 'hsl(35 5% 45%)' }} width={25} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: 'hsl(0 0% 7%)', border: '1px solid hsl(0 0% 12%)', borderRadius: 8, fontSize: 11 }}
              formatter={(value: number, name: string) => [value, name === 'total' ? 'Total' : 'Online']}
            />
            <Bar dataKey="total" radius={[3, 3, 0, 0]} name="Total">
              {data.map((d, i) => (
                <Cell key={i} fill={d.color} fillOpacity={0.7} />
              ))}
            </Bar>
            <Bar dataKey="online" radius={[3, 3, 0, 0]} name="Online">
              {data.map((d, i) => (
                <Cell key={i} fill={d.color} fillOpacity={1} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Quick stats */}
      <div className="flex gap-3 mt-2 text-[8px] text-muted-foreground">
        <span>Menor level: <span className="text-foreground font-semibold">{Math.min(...members.map(m => m.level))}</span></span>
        <span>Maior level: <span className="text-foreground font-semibold">{Math.max(...members.map(m => m.level))}</span></span>
        <span>Mediana: <span className="text-foreground font-semibold">{
          members.length > 0
            ? [...members].sort((a, b) => a.level - b.level)[Math.floor(members.length / 2)].level
            : 0
        }</span></span>
      </div>
    </motion.div>
  );
}
