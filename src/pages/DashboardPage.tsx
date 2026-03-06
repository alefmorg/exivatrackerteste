import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Users, UserCheck, UserX, Target, Skull, ScrollText, ArrowRightLeft, Clock, Globe, TrendingUp, Activity, Zap, RefreshCw } from 'lucide-react';
import StatCard from '@/components/StatCard';
import { getMonitoredGuilds } from '@/lib/storage';
import { MonitoredGuild } from '@/types/tibia';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import StatusDot from '@/components/StatusDot';
import { VocationIcon, getVocationColor } from '@/components/TibiaIcons';

interface BonecoRow {
  id: string; name: string; level: number; vocation: string; world: string;
  status: string; activity: string; used_by: string; last_access: string;
  full_bless: boolean; premium_active: boolean; tibia_coins: number;
}

interface LogRow {
  id: string; boneco_name: string; username: string; action: string; notes: string; created_at: string;
}

function timeAgo(dateStr: string) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'Agora';
  if (min < 60) return `${min}min`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

const COLORS = ['hsl(142, 76%, 45%)', 'hsl(45, 93%, 47%)', 'hsl(0, 72%, 51%)'];
const VOC_COLORS: Record<string, string> = {
  'Elite Knight': 'hsl(0, 72%, 55%)',
  'Royal Paladin': 'hsl(45, 93%, 55%)',
  'Elder Druid': 'hsl(142, 76%, 50%)',
  'Master Sorcerer': 'hsl(220, 80%, 60%)',
};
const ACTIVITY_COLORS: Record<string, string> = {
  Hunt: 'hsl(142, 76%, 45%)',
  War: 'hsl(0, 72%, 51%)',
  Maker: 'hsl(45, 93%, 47%)',
  Boss: 'hsl(272, 72%, 55%)',
  Livre: 'hsl(160, 10%, 35%)',
};

const tooltipStyle = {
  backgroundColor: 'hsl(160, 10%, 9%)',
  border: '1px solid hsl(160, 10%, 20%)',
  borderRadius: '10px',
  color: 'hsl(150, 20%, 90%)',
  fontSize: '12px',
  boxShadow: '0 8px 32px hsl(0 0% 0% / 0.4)',
};

export default function DashboardPage() {
  const [bonecos, setBonecos] = useState<BonecoRow[]>([]);
  const [guilds, setGuilds] = useState<MonitoredGuild[]>([]);
  const [recentLogs, setRecentLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState('');

  const fetchData = useCallback(async () => {
    const [{ data: bData }, { data: lData }] = await Promise.all([
      supabase.from('bonecos').select('id,name,level,vocation,world,status,activity,used_by,last_access,full_bless,premium_active,tibia_coins').order('created_at', { ascending: false }),
      supabase.from('boneco_logs').select('id,boneco_name,username,action,notes,created_at').order('created_at', { ascending: false }).limit(15),
    ]);
    if (bData) setBonecos(bData as BonecoRow[]);
    if (lData) setRecentLogs(lData as LogRow[]);
    setLastRefresh(new Date().toLocaleTimeString('pt-BR'));
    setLoading(false);
  }, []);

  useEffect(() => {
    setGuilds(getMonitoredGuilds());
    fetchData();

    // Real-time subscriptions
    const bChannel = supabase
      .channel('dash-bonecos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bonecos' }, () => fetchData())
      .subscribe();
    const lChannel = supabase
      .channel('dash-logs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'boneco_logs' }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(bChannel);
      supabase.removeChannel(lChannel);
    };
  }, [fetchData]);

  const onlineCount = bonecos.filter(b => b.status === 'online').length;
  const afkCount = bonecos.filter(b => b.status === 'afk').length;
  const offlineCount = bonecos.filter(b => b.status === 'offline').length;
  const inUseCount = bonecos.filter(b => b.used_by).length;
  const totalTC = bonecos.reduce((sum, b) => sum + (b.tibia_coins || 0), 0);
  const blessCount = bonecos.filter(b => b.full_bless).length;
  const premiumCount = bonecos.filter(b => b.premium_active).length;
  const avgLevel = bonecos.length > 0 ? Math.round(bonecos.reduce((s, b) => s + b.level, 0) / bonecos.length) : 0;

  const statusData = [
    { name: 'Online', value: onlineCount },
    { name: 'AFK', value: afkCount },
    { name: 'Offline', value: offlineCount },
  ];

  const vocData = Object.entries(
    bonecos.reduce<Record<string, number>>((acc, b) => {
      const v = b.vocation || 'Sem Voc';
      acc[v] = (acc[v] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const activityData = [
    { name: 'Hunt', value: bonecos.filter(b => b.activity === 'hunt').length },
    { name: 'War', value: bonecos.filter(b => b.activity === 'war').length },
    { name: 'Maker', value: bonecos.filter(b => b.activity === 'maker').length },
    { name: 'Boss', value: bonecos.filter(b => b.activity === 'boss').length },
    { name: 'Livre', value: bonecos.filter(b => !b.activity).length },
  ];

  const worldData = Object.entries(
    bonecos.reduce<Record<string, number>>((acc, b) => {
      const w = b.world || 'N/A';
      acc[w] = (acc[w] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  // User stats from logs
  const userStats = recentLogs.reduce<Record<string, number>>((acc, l) => {
    acc[l.username] = (acc[l.username] || 0) + 1;
    return acc;
  }, {});
  const topUsers = Object.entries(userStats).sort((a, b) => b[1] - a[1]).slice(0, 5);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold gradient-text mb-1" style={{ fontFamily: "'MedievalSharp', cursive" }}>⚔ Dashboard</h1>
          <p className="text-muted-foreground text-sm flex items-center gap-2">
            Visão geral em tempo real
            <span className="flex items-center gap-1.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse-neon" />
              LIVE
            </span>
            {lastRefresh && <span className="text-xs text-muted-foreground">• {lastRefresh}</span>}
          </p>
        </div>
        <button onClick={fetchData} className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Primary Stats - Animated */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <MiniStat icon={<Swords className="h-4 w-4" />} value={bonecos.length} label="Total" color="primary" />
        <MiniStat icon={<UserCheck className="h-4 w-4" />} value={onlineCount} label="Online" color="online" />
        <MiniStat icon={<Activity className="h-4 w-4" />} value={afkCount} label="AFK" color="afk" />
        <MiniStat icon={<UserX className="h-4 w-4" />} value={offlineCount} label="Offline" color="offline" />
        <MiniStat icon={<ArrowRightLeft className="h-4 w-4" />} value={inUseCount} label="Em Uso" color="primary" />
        <MiniStat icon={<TrendingUp className="h-4 w-4" />} value={avgLevel} label="Lv Médio" color="primary" />
        <MiniStat icon={<span className="text-sm">💰</span>} value={totalTC} label="TC Total" color="afk" />
        <MiniStat icon={<Target className="h-4 w-4" />} value={guilds.length} label="Guilds" color="primary" />
      </div>

      {/* Quick Info Badges */}
      <div className="flex flex-wrap gap-2">
        <InfoBadge emoji="❤️" label="Full Bless" value={`${blessCount}/${bonecos.length}`} />
        <InfoBadge emoji="👑" label="Premium" value={`${premiumCount}/${bonecos.length}`} />
        <InfoBadge emoji="🟢" label="Disponíveis" value={`${bonecos.length - inUseCount}`} />
        <InfoBadge emoji="⚔" label="Huntando" value={`${bonecos.filter(b => b.activity === 'hunt').length}`} />
        <InfoBadge emoji="🔥" label="Em Guerra" value={`${bonecos.filter(b => b.activity === 'war').length}`} />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Status Pie */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2 text-sm">
            <Activity className="h-4 w-4 text-primary" /> Status dos Bonecos
          </h3>
          <div className="h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value"
                  label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                  strokeWidth={2} stroke="hsl(160, 10%, 6%)">
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Bar */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2 text-sm">
            <Zap className="h-4 w-4 text-primary" /> Atividades
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(160, 10%, 14%)" />
                <XAxis dataKey="name" tick={{ fill: 'hsl(150, 10%, 55%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'hsl(150, 10%, 55%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {activityData.map((entry, i) => <Cell key={i} fill={ACTIVITY_COLORS[entry.name] || 'hsl(150, 10%, 40%)'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vocation Distribution */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2 text-sm">
            <Swords className="h-4 w-4 text-primary" /> Vocações
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vocData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(160, 10%, 14%)" />
                <XAxis type="number" tick={{ fill: 'hsl(150, 10%, 55%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: 'hsl(150, 10%, 55%)', fontSize: 10 }} axisLine={false} tickLine={false} width={100} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  {vocData.map((entry, i) => <Cell key={i} fill={VOC_COLORS[entry.name] || 'hsl(150, 10%, 40%)'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Worlds */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2 text-sm">
            <Globe className="h-4 w-4 text-primary" /> Mundos
          </h3>
          <div className="space-y-2.5 max-h-48 overflow-y-auto">
            {worldData.map((w, i) => (
              <div key={w.name} className="flex items-center gap-3">
                <span className="text-xs font-medium text-muted-foreground w-5 text-right">{i + 1}.</span>
                <span className="text-sm font-medium text-foreground w-24 truncate">{w.name}</span>
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(w.value / bonecos.length) * 100}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                  />
                </div>
                <span className="text-xs text-muted-foreground font-mono w-6 text-right">{w.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom: Activity Feed + In Use + Top Users */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Activity */}
        <div className="glass-card rounded-xl p-5 lg:col-span-2">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2 text-sm">
            <ArrowRightLeft className="h-4 w-4 text-primary" /> Feed de Atividade
            <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-neon" /> tempo real
            </span>
          </h3>
          <div className="space-y-1 max-h-[320px] overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {recentLogs.map(log => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  layout
                  className="flex items-center py-2.5 px-3 gap-3 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs shrink-0 ${log.action === 'pegar' ? 'bg-primary/15 text-primary' : 'bg-afk/15 text-afk'}`}>
                    {log.action === 'pegar' ? '📥' : '📤'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-sm">
                      <span className="font-medium text-foreground">{log.username}</span>
                      <span className="text-muted-foreground">{log.action === 'pegar' ? 'pegou' : 'devolveu'}</span>
                      <span className="font-medium text-primary truncate">{log.boneco_name}</span>
                    </div>
                    {log.notes && <p className="text-[11px] text-muted-foreground truncate">💬 {log.notes}</p>}
                  </div>
                  <span className="text-[11px] text-muted-foreground shrink-0">{timeAgo(log.created_at)}</span>
                </motion.div>
              ))}
            </AnimatePresence>
            {recentLogs.length === 0 && (
              <p className="text-muted-foreground text-sm text-center py-8">Nenhum repasse registrado</p>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Bonecos in Use */}
          <div className="glass-card rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
              <ScrollText className="h-4 w-4 text-primary" /> Em Uso ({inUseCount})
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {bonecos.filter(b => b.used_by).map(b => (
                <div key={b.id} className="flex items-center gap-2 py-1.5">
                  <StatusDot status={b.status as any} size="sm" />
                  <VocationIcon vocation={b.vocation} className={`h-3 w-3 ${getVocationColor(b.vocation)}`} />
                  <span className="text-xs font-medium flex-1 truncate">{b.name}</span>
                  <span className="text-[10px] text-primary">👤 {b.used_by}</span>
                </div>
              ))}
              {inUseCount === 0 && <p className="text-xs text-muted-foreground text-center py-3">Nenhum em uso</p>}
            </div>
          </div>

          {/* Top Users */}
          <div className="glass-card rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-primary" /> Top Usuários
            </h3>
            <div className="space-y-2">
              {topUsers.map(([name, count], i) => (
                <div key={name} className="flex items-center gap-2">
                  <span className={`text-xs font-bold w-5 text-center ${i === 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                    {i === 0 ? '🏆' : `#${i + 1}`}
                  </span>
                  <span className="text-sm flex-1 truncate">{name}</span>
                  <span className="text-xs font-mono text-muted-foreground">{count} ações</span>
                </div>
              ))}
              {topUsers.length === 0 && <p className="text-xs text-muted-foreground text-center py-3">Sem dados</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mini stat card
function MiniStat({ icon, value, label, color }: { icon: React.ReactNode; value: number; label: string; color: string }) {
  const colorClasses: Record<string, string> = {
    primary: 'text-primary',
    online: 'text-online',
    offline: 'text-offline',
    afk: 'text-afk',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-3 text-center"
    >
      <div className={`flex justify-center mb-1 ${colorClasses[color]}`}>{icon}</div>
      <p className={`text-lg font-bold ${colorClasses[color]} stat-glow`}>
        {value.toLocaleString()}
      </p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </motion.div>
  );
}

function InfoBadge({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-card text-xs">
      <span>{emoji}</span>
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}
