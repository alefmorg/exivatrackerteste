import { motion } from 'framer-motion';
import { TrendingUp, ArrowUpRight, Calendar, Users, Trophy, Skull } from 'lucide-react';
import { ItemSprite } from '@/components/TibiaIcons';

interface SummaryData {
  totalLevelsToday: number;
  playersUpToday: number;
  totalLevelsWeek: number;
  totalMembers: number;
  onlineNow: number;
  topGainer: { name: string; levels: number } | null;
  totalDeaths: number;
  avgLevelGuild: number;
}

export default function ReportSummaryCards({ data }: { data: SummaryData }) {
  const cards = [
    {
      label: 'Levels Hoje',
      value: `+${data.totalLevelsToday}`,
      icon: <TrendingUp className="h-4 w-4 text-primary" />,
      color: 'border-t-primary',
      valueColor: 'text-primary',
    },
    {
      label: 'Uparam Hoje',
      value: `${data.playersUpToday}`,
      icon: <ArrowUpRight className="h-4 w-4 text-online" />,
      color: 'border-t-online',
      valueColor: 'text-online',
    },
    {
      label: 'Levels 7 Dias',
      value: `+${data.totalLevelsWeek}`,
      icon: <Calendar className="h-4 w-4 text-afk" />,
      color: 'border-t-afk',
      valueColor: 'text-afk',
    },
    {
      label: 'Online Agora',
      value: `${data.onlineNow}`,
      icon: <Users className="h-4 w-4 text-online" />,
      color: 'border-t-online',
      valueColor: 'text-online',
    },
    {
      label: 'Top Gainer',
      value: data.topGainer ? `${data.topGainer.name.split(' ')[0]}` : '—',
      subtitle: data.topGainer ? `+${data.topGainer.levels} lvls` : undefined,
      icon: <Trophy className="h-4 w-4 text-primary" />,
      color: 'border-t-primary',
      valueColor: 'text-primary',
    },
    {
      label: 'Deaths Recentes',
      value: `${data.totalDeaths}`,
      icon: <Skull className="h-4 w-4 text-destructive" />,
      color: 'border-t-destructive',
      valueColor: 'text-destructive',
    },
    {
      label: 'Membros',
      value: `${data.totalMembers}`,
      icon: <ItemSprite item="shield" className="h-4 w-4" />,
      color: 'border-t-muted-foreground/30',
      valueColor: 'text-foreground',
    },
    {
      label: 'Nível Médio',
      value: `${data.avgLevelGuild}`,
      icon: <ItemSprite item="level" className="h-4 w-4" />,
      color: 'border-t-afk',
      valueColor: 'text-afk',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {cards.map((c, i) => (
        <motion.div
          key={c.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03 }}
          className={`panel rounded-lg p-2.5 ${c.color} border-t-2`}
        >
          <div className="flex items-center gap-1.5 mb-0.5">
            {c.icon}
            <span className="text-[8px] uppercase tracking-wider text-muted-foreground font-semibold truncate">{c.label}</span>
          </div>
          <span className={`text-lg font-bold font-mono ${c.valueColor} truncate block`}>{c.value}</span>
          {c.subtitle && <span className="text-[9px] text-muted-foreground font-mono">{c.subtitle}</span>}
        </motion.div>
      ))}
    </div>
  );
}
