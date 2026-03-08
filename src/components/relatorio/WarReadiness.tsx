import { motion } from 'framer-motion';
import { Shield, Swords, Users, Clock, Target } from 'lucide-react';
import { VocationIcon, getVocationColor } from '@/components/TibiaIcons';

interface Props {
  members: Array<{ name: string; level: number; vocation: string; status: 'online' | 'offline' }>;
  loginHistory: Array<{ char_name: string; status: string; recorded_at: string }>;
}

const VOCATION_SHORT: Record<string, string> = {
  'Elite Knight': 'EK',
  'Royal Paladin': 'RP',
  'Elder Druid': 'ED',
  'Master Sorcerer': 'MS',
  'Knight': 'EK',
  'Paladin': 'RP',
  'Druid': 'ED',
  'Sorcerer': 'MS',
};

function getVocGroup(voc: string): string {
  if (voc.includes('Knight')) return 'EK';
  if (voc.includes('Paladin')) return 'RP';
  if (voc.includes('Druid')) return 'ED';
  if (voc.includes('Sorcerer')) return 'MS';
  return 'Other';
}

export default function WarReadiness({ members, loginHistory }: Props) {
  const online = members.filter(m => m.status === 'online');
  const onlineByVoc: Record<string, number> = {};
  const totalByVoc: Record<string, number> = {};

  members.forEach(m => {
    const g = getVocGroup(m.vocation);
    totalByVoc[g] = (totalByVoc[g] || 0) + 1;
  });
  online.forEach(m => {
    const g = getVocGroup(m.vocation);
    onlineByVoc[g] = (onlineByVoc[g] || 0) + 1;
  });

  const avgLevelOnline = online.length > 0
    ? Math.round(online.reduce((s, m) => s + m.level, 0) / online.length)
    : 0;

  const avgLevelTotal = members.length > 0
    ? Math.round(members.reduce((s, m) => s + m.level, 0) / members.length)
    : 0;

  // Peak hour calculation from login history
  const hourCounts: number[] = Array(24).fill(0);
  loginHistory.forEach(l => {
    if (l.status === 'online') {
      hourCounts[new Date(l.recorded_at).getHours()]++;
    }
  });
  const peakHour = hourCounts.indexOf(Math.max(...hourCounts));

  // War power score (simplified metric)
  const warPower = Math.round(
    (online.length * 10) +
    (avgLevelOnline * 0.5) +
    (Math.min(onlineByVoc['EK'] || 0, onlineByVoc['ED'] || 0) * 20) // balanced teams
  );

  // Team composition quality
  const vocKeys = ['EK', 'RP', 'ED', 'MS'];
  const hasAllVocs = vocKeys.every(v => (onlineByVoc[v] || 0) > 0);
  const compositionScore = vocKeys.filter(v => (onlineByVoc[v] || 0) > 0).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.14 }}
      className="panel rounded-lg p-3"
    >
      <div className="flex items-center gap-2 mb-3">
        <Swords className="h-3.5 w-3.5 text-primary" />
        <span className="font-display text-[10px] font-semibold uppercase tracking-wider text-foreground">
          PRONTIDÃO DE WAR
        </span>
        <div className="ml-auto flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${online.length >= 10 ? 'bg-online' : online.length >= 5 ? 'bg-afk' : 'bg-destructive'} animate-pulse`} />
          <span className={`text-[9px] font-bold ${online.length >= 10 ? 'text-online' : online.length >= 5 ? 'text-afk' : 'text-destructive'}`}>
            {online.length >= 10 ? 'PRONTO' : online.length >= 5 ? 'PARCIAL' : 'BAIXO'}
          </span>
        </div>
      </div>

      {/* War Power */}
      <div className="mb-3 p-2 rounded bg-secondary/40 border border-border/30">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[8px] uppercase tracking-wider text-muted-foreground font-semibold">War Power Score</span>
          <span className="text-lg font-bold font-mono text-primary">{warPower}</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, warPower / 5)}%` }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary"
          />
        </div>
      </div>

      {/* Online composition */}
      <div className="grid grid-cols-4 gap-1.5 mb-3">
        {vocKeys.map(voc => {
          const onlineCount = onlineByVoc[voc] || 0;
          const totalCount = totalByVoc[voc] || 0;
          const pct = totalCount > 0 ? Math.round((onlineCount / totalCount) * 100) : 0;
          const vocMap: Record<string, string> = { EK: 'Elite Knight', RP: 'Royal Paladin', ED: 'Elder Druid', MS: 'Master Sorcerer' };

          return (
            <div key={voc} className="p-1.5 rounded bg-secondary/30 border border-border/20 text-center">
              <VocationIcon vocation={vocMap[voc]} className={`h-4 w-4 mx-auto mb-0.5 ${getVocationColor(vocMap[voc])}`} />
              <div className="text-[9px] font-bold text-foreground">{voc}</div>
              <div className="text-[10px] font-mono font-bold text-primary">{onlineCount}<span className="text-muted-foreground font-normal">/{totalCount}</span></div>
              <div className="text-[7px] text-muted-foreground">{pct}% on</div>
            </div>
          );
        })}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-1.5">
        <div className="flex items-center gap-1.5 p-1.5 rounded bg-secondary/30 border border-border/20">
          <Target className="h-3 w-3 text-primary" />
          <div>
            <div className="text-[7px] text-muted-foreground uppercase">Nível médio online</div>
            <div className="text-[11px] font-bold font-mono text-foreground">{avgLevelOnline} <span className="text-[8px] text-muted-foreground font-normal">/ {avgLevelTotal} total</span></div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 p-1.5 rounded bg-secondary/30 border border-border/20">
          <Clock className="h-3 w-3 text-primary" />
          <div>
            <div className="text-[7px] text-muted-foreground uppercase">Horário pico</div>
            <div className="text-[11px] font-bold font-mono text-foreground">{peakHour}h - {(peakHour + 1) % 24}h</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 p-1.5 rounded bg-secondary/30 border border-border/20 col-span-2">
          <Shield className="h-3 w-3 text-primary" />
          <div>
            <div className="text-[7px] text-muted-foreground uppercase">Composição</div>
            <div className="text-[11px] font-bold font-mono">
              {hasAllVocs ? (
                <span className="text-online">✓ Todas as vocações presentes</span>
              ) : (
                <span className="text-afk">
                  {vocKeys.filter(v => !(onlineByVoc[v])).join(', ')} ausente{vocKeys.filter(v => !(onlineByVoc[v])).length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
