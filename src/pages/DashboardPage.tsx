import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, AlertTriangle, TrendingDown, Shield, Crown } from 'lucide-react';
import { getMonitoredGuildsAsync, MonitoredGuild } from '@/lib/storage';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import StatusDot from '@/components/StatusDot';
import { useSettings } from '@/hooks/useSettings';
import { VocationIcon, getVocationColor, ItemSprite, SPRITE } from '@/components/TibiaIcons';
import { timeAgo } from '@/lib/utils';
import { SkeletonPage } from '@/components/SkeletonLoader';
import PageHeader from '@/components/PageHeader';
import MetricCard from '@/components/MetricCard';
import EmptyState from '@/components/EmptyState';

// ============================================================
// Data fetching & management
// ============================================================
interface BonecoRow {
  id: string; name: string; level: number; vocation: string; world: string;
  status: string; activity: string; used_by: string; last_access: string;
  full_bless: boolean; premium_active: boolean; tibia_coins: number;
}

interface LogRow {
  id: string; boneco_name: string; username: string; action: string; notes: string; created_at: string;
}

interface LevelHistoryRow {
  id: string; char_name: string; level: number; recorded_at: string;
}

interface LevelLoss {
  name: string;
  previousLevel: number;
  currentLevel: number;
  lostLevels: number;
  date: string;
}

// timeAgo imported from utils

const STATUS_COLORS = ['hsl(142, 76%, 45%)', 'hsl(45, 93%, 47%)', 'hsl(0, 72%, 51%)'];
const VOC_COLORS: Record<string, string> = {
  'Elite Knight': 'hsl(0, 72%, 55%)',
  'Royal Paladin': 'hsl(45, 93%, 55%)',
  'Elder Druid': 'hsl(142, 76%, 50%)',
  'Master Sorcerer': 'hsl(220, 80%, 60%)',
};
const ACT_COLORS: Record<string, string> = {
  Hunt: 'hsl(25, 95%, 50%)',
  War: 'hsl(0, 72%, 51%)',
  Maker: 'hsl(45, 93%, 47%)',
  Boss: 'hsl(272, 72%, 55%)',
  Livre: 'hsl(0, 0%, 25%)',
};

const chartTooltip = {
  backgroundColor: 'hsl(0, 0%, 7%)',
  border: '1px solid hsl(0, 0%, 14%)',
  borderRadius: '6px',
  color: 'hsl(35, 15%, 85%)',
  fontSize: '11px',
  boxShadow: '0 8px 32px hsl(0 0% 0% / 0.5)',
};

export default function DashboardPage() {
  const settings = useSettings();
  const [bonecos, setBonecos] = useState<BonecoRow[]>([]);
  const [guilds, setGuilds] = useState<MonitoredGuild[]>([]);
  const [recentLogs, setRecentLogs] = useState<LogRow[]>([]);
  const [levelLosses, setLevelLosses] = useState<LevelLoss[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState('');

  const fetchData = useCallback(async () => {
    const [{ data: bData }, { data: lData }, { data: hData }] = await Promise.all([
      supabase.from('bonecos').select('id,name,level,vocation,world,status,activity,used_by,last_access,full_bless,premium_active,tibia_coins').order('created_at', { ascending: false }),
      supabase.from('boneco_logs').select('id,boneco_name,username,action,notes,created_at').order('created_at', { ascending: false }).limit(settings.logLimit),
      supabase.from('level_history').select('id,char_name,level,recorded_at').order('recorded_at', { ascending: false }).limit(500),
    ]);
    if (bData) setBonecos(bData as BonecoRow[]);
    if (lData) setRecentLogs(lData as LogRow[]);
    
    // Calculate level losses from history
    if (hData && bData) {
      const historyByChar: Record<string, LevelHistoryRow[]> = {};
      (hData as LevelHistoryRow[]).forEach(h => {
        if (!historyByChar[h.char_name]) historyByChar[h.char_name] = [];
        historyByChar[h.char_name].push(h);
      });
      
      const losses: LevelLoss[] = [];
      Object.entries(historyByChar).forEach(([charName, history]) => {
        // Sort by date descending
        history.sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime());
        // Check for level drops between consecutive records
        for (let i = 0; i < history.length - 1; i++) {
          const current = history[i];
          const previous = history[i + 1];
          if (previous.level > current.level) {
            losses.push({
              name: charName,
              previousLevel: previous.level,
              currentLevel: current.level,
              lostLevels: previous.level - current.level,
              date: current.recorded_at,
            });
          }
        }
      });
      // Sort by date descending and take recent
      losses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setLevelLosses(losses.slice(0, 20));
    }
    
    setLastRefresh(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    setLoading(false);
  }, [settings.logLimit]);

  useEffect(() => {
    getMonitoredGuildsAsync().then(setGuilds);
    fetchData();
    const bCh = supabase.channel('dash-bonecos').on('postgres_changes', { event: '*', schema: 'public', table: 'bonecos' }, () => fetchData()).subscribe();
    const lCh = supabase.channel('dash-logs').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'boneco_logs' }, () => fetchData()).subscribe();
    return () => { supabase.removeChannel(bCh); supabase.removeChannel(lCh); };
  }, [fetchData]);

  // Auto-refresh based on settings
  useEffect(() => {
    if (!settings.dashboardRefresh || settings.dashboardRefresh < 10) return;
    const interval = setInterval(fetchData, settings.dashboardRefresh * 1000);
    return () => clearInterval(interval);
  }, [settings.dashboardRefresh, fetchData]);

  const onlineCount = bonecos.filter(b => b.status === 'online').length;
  const afkCount = bonecos.filter(b => b.status === 'afk').length;
  const offlineCount = bonecos.filter(b => b.status === 'offline').length;
  const inUseCount = bonecos.filter(b => b.used_by).length;
  const totalTC = bonecos.reduce((sum, b) => sum + (b.tibia_coins || 0), 0);
  const blessCount = bonecos.filter(b => b.full_bless).length;
  const premiumCount = bonecos.filter(b => b.premium_active).length;
  const avgLevel = bonecos.length > 0 ? Math.round(bonecos.reduce((s, b) => s + b.level, 0) / bonecos.length) : 0;
  const maxLevel = bonecos.length > 0 ? Math.max(...bonecos.map(b => b.level)) : 0;

  const statusData = [
    { name: 'Online', value: onlineCount },
    { name: 'AFK', value: afkCount },
    { name: 'Offline', value: offlineCount },
  ];
  const vocData = Object.entries(bonecos.reduce<Record<string, number>>((acc, b) => { const v = b.vocation || 'N/A'; acc[v] = (acc[v] || 0) + 1; return acc; }, {})).map(([name, value]) => ({ name, value }));
  const activityData = [
    { name: 'Hunt', value: bonecos.filter(b => b.activity === 'hunt').length },
    { name: 'War', value: bonecos.filter(b => b.activity === 'war').length },
    { name: 'Maker', value: bonecos.filter(b => b.activity === 'maker').length },
    { name: 'Boss', value: bonecos.filter(b => b.activity === 'boss').length },
    { name: 'Livre', value: bonecos.filter(b => !b.activity).length },
  ];
  const worldData = Object.entries(bonecos.reduce<Record<string, number>>((acc, b) => { const w = b.world || 'N/A'; acc[w] = (acc[w] || 0) + 1; return acc; }, {})).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  const userStats = recentLogs.reduce<Record<string, number>>((acc, l) => { acc[l.username] = (acc[l.username] || 0) + 1; return acc; }, {});
  const topUsers = Object.entries(userStats).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const today = new Date().toDateString();
  const todayLogs = recentLogs.filter(l => new Date(l.created_at).toDateString() === today);

  if (loading) return <SkeletonPage />;

  return (
    <div className="space-y-4">
      <PageHeader
        title="COMMAND CENTER"
        icon="dashboard"
        subtitle={<><span>{bonecos.length} unidades</span><span>•</span><span className="text-primary">{lastRefresh}</span></>}
        actions={
          <button onClick={fetchData} className="p-1.5 rounded border border-border hover:border-primary/30 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all">
            <ItemSprite item="refresh" className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        }
      />

      {/* Status Bar */}
      <div className="panel rounded-lg p-3">
        <div className="flex items-center gap-4 mb-2">
          {[
            { label: 'ONLINE', value: onlineCount, sprite: 'online' as const },
            { label: 'AFK', value: afkCount, sprite: 'afk' as const },
            { label: 'OFFLINE', value: offlineCount, sprite: 'offline' as const },
            { label: 'EM USO', value: inUseCount, sprite: 'login' as const },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2">
              <ItemSprite item={s.sprite} className="h-5 w-5" />
              <span className={`text-xs font-bold font-mono text-foreground`}>{s.value}</span>
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider">{s.label}</span>
            </div>
          ))}
        </div>
        {bonecos.length > 0 && (
          <div className="h-1.5 rounded-full bg-secondary overflow-hidden flex">
            <div className="bg-online transition-all" style={{ width: `${(onlineCount / bonecos.length) * 100}%` }} />
            <div className="bg-afk transition-all" style={{ width: `${(afkCount / bonecos.length) * 100}%` }} />
            <div className="bg-offline transition-all" style={{ width: `${(offlineCount / bonecos.length) * 100}%` }} />
          </div>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {[
          { label: 'LV MÉD', value: avgLevel.toString(), sprite: 'level' as const },
          { label: 'LV MAX', value: maxLevel.toString(), sprite: 'level' as const },
          { label: 'TC TOTAL', value: totalTC.toLocaleString(), sprite: 'tibiaCoin' as const, highlight: true },
          { label: 'BLESS', value: `${blessCount}/${bonecos.length}`, sprite: 'bless' as const },
          { label: 'PREMIUM', value: `${premiumCount}/${bonecos.length}`, sprite: 'premiumScroll' as const },
          { label: 'LIVRES', value: `${bonecos.length - inUseCount}`, sprite: 'online' as const, highlight: true },
        ].map((m, i) => (
          <MetricCard key={m.label} label={m.label} value={m.value} sprite={m.sprite} highlight={m.highlight} delay={i * 0.04} />
        ))}
      </div>

      {/* Today */}
      {todayLogs.length > 0 && (
        <div className="panel rounded-lg p-3 flex items-center gap-3 stripe-left">
          <ItemSprite item="clock" className="h-5 w-5" />
          <span className="text-xs text-foreground font-medium">Hoje:</span>
          <span className="text-xs text-muted-foreground font-mono">
            {todayLogs.length} ações — {todayLogs.filter(l => l.action === 'pegar').length} pegaram, {todayLogs.filter(l => l.action === 'devolver').length} devolveram
          </span>
        </div>
      )}

      {/* Alerts & Level Losses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Alerts Panel */}
        <AlertsPanel bonecos={bonecos} />
        
        {/* Level Losses Panel */}
        <LevelLossesPanel losses={levelLosses} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ChartPanel title="STATUS" icon={<ItemSprite item="online" className="h-5 w-5" />}>
          <div className="h-44 sm:h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value"
                  label={({ name, value }) => value > 0 ? `${name} ${value}` : ''} strokeWidth={0}>
                  {statusData.map((_, i) => <Cell key={i} fill={STATUS_COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={chartTooltip} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartPanel>

        <ChartPanel title="ATIVIDADES" icon={<ItemSprite item="level" className="h-5 w-5" />}>
          <div className="h-44 sm:h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <XAxis dataKey="name" tick={{ fill: 'hsl(35, 5%, 45%)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'hsl(35, 5%, 45%)', fontSize: 10 }} axisLine={false} tickLine={false} width={20} />
                <Tooltip contentStyle={chartTooltip} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {activityData.map((entry, i) => <Cell key={i} fill={ACT_COLORS[entry.name] || 'hsl(0, 0%, 25%)'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartPanel>

        <ChartPanel title="VOCAÇÕES" icon={<ItemSprite item="sword" className="h-5 w-5" />}>
          <div className="h-44 sm:h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vocData} layout="vertical">
                <XAxis type="number" tick={{ fill: 'hsl(35, 5%, 45%)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: 'hsl(35, 5%, 45%)', fontSize: 9 }} axisLine={false} tickLine={false} width={95} />
                <Tooltip contentStyle={chartTooltip} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {vocData.map((entry, i) => <Cell key={i} fill={VOC_COLORS[entry.name] || 'hsl(0, 0%, 30%)'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartPanel>

        <ChartPanel title="MUNDOS" icon={<ItemSprite item="globe" className="h-5 w-5" />}>
          <div className="space-y-1.5 max-h-44 overflow-y-auto">
            {worldData.map((w, i) => (
              <div key={w.name} className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-muted-foreground w-4 text-right">{i + 1}</span>
                <span className="text-xs font-medium text-foreground w-20 truncate">{w.name}</span>
                <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
                  <motion.div className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }} animate={{ width: `${(w.value / bonecos.length) * 100}%` }}
                    transition={{ duration: 0.6, delay: i * 0.08 }} />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground w-4 text-right">{w.value}</span>
              </div>
            ))}
          </div>
        </ChartPanel>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Feed */}
        <div className="panel rounded-lg lg:col-span-2 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border flex items-center gap-2">
            <ItemSprite item="history" className="h-5 w-5" />
            <span className="text-[11px] font-display font-semibold text-foreground uppercase tracking-wider">Feed</span>
            <span className="ml-auto flex items-center gap-1 text-[9px] text-primary font-mono">
              <ItemSprite item="live" className="h-4 w-4 animate-pulse" /> REALTIME
            </span>
          </div>
          <div className="max-h-[320px] overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {recentLogs.map(log => (
                <motion.div key={log.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} layout
                  className="flex items-center py-2 px-4 gap-3 border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <ItemSprite item={log.action === 'pegar' ? 'login' : 'logout'} className="h-5 w-5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 text-xs">
                      <span className="font-semibold text-foreground">{log.username}</span>
                      <span className="text-muted-foreground">{log.action === 'pegar' ? '→ pegou' : '← devolveu'}</span>
                      <span className="font-semibold text-primary truncate">{log.boneco_name}</span>
                    </div>
                    {log.notes && <p className="text-[10px] text-muted-foreground truncate mt-0.5">{log.notes}</p>}
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono shrink-0">{timeAgo(log.created_at)}</span>
                </motion.div>
              ))}
            </AnimatePresence>
            {recentLogs.length === 0 && <EmptyState icon="history" title="Sem atividade" description="Nenhum repasse registrado ainda." />}
          </div>
        </div>

        {/* Sidebar panels */}
        <div className="space-y-3">
          <SidePanel title="EM USO" count={inUseCount} icon={<ItemSprite item="scroll" className="h-5 w-5" />}>
            {bonecos.filter(b => b.used_by).map(b => (
              <div key={b.id} className="flex items-center gap-2 py-1">
                <StatusDot status={b.status as any} size="sm" />
                <VocationIcon vocation={b.vocation} className={`h-3 w-3 ${getVocationColor(b.vocation)}`} />
                <span className="text-[11px] font-medium flex-1 truncate">{b.name}</span>
                <span className="text-[9px] text-primary font-mono">{b.used_by}</span>
              </div>
            ))}
            {inUseCount === 0 && <p className="text-[10px] text-muted-foreground text-center py-2">—</p>}
          </SidePanel>

          <SidePanel title="TOP USERS" count={topUsers.length} icon={<ItemSprite item="crown" className="h-5 w-5" />}>
            {topUsers.map(([name, count], i) => (
              <div key={name} className="flex items-center gap-2 py-0.5">
                <span className={`text-[10px] font-mono font-bold w-4 ${i === 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                  {i === 0 ? '★' : `${i + 1}`}
                </span>
                <span className="text-xs flex-1 truncate">{name}</span>
                <span className="text-[10px] font-mono text-muted-foreground">{count}</span>
              </div>
            ))}
          </SidePanel>

          <SidePanel title="GUILDS" count={guilds.length} icon={<ItemSprite item="guild" className="h-5 w-5" />}>
            {guilds.map((g, i) => (
              <div key={g.id} className="flex items-center gap-2 py-0.5">
                <ItemSprite item="globe" className="h-4 w-4" />
                <span className="text-xs font-medium flex-1 truncate">{g.name}</span>
                <span className="text-[10px] text-muted-foreground font-mono">{g.world}</span>
                {i === 0 && <span className="tag tag-primary">EXIVA</span>}
              </div>
            ))}
            {guilds.length === 0 && <p className="text-[10px] text-muted-foreground text-center py-2">—</p>}
          </SidePanel>
        </div>
      </div>
    </div>
  );
}

function ChartPanel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -2 }}
      transition={{ duration: 0.15 }}
      className="panel rounded-lg overflow-hidden transition-shadow hover:shadow-[0_0_24px_hsl(var(--primary)/0.08)]"
    >
      <div className="px-4 py-2 border-b border-border flex items-center gap-2">
        <span className="text-primary">{icon}</span>
        <span className="text-[10px] font-display font-semibold text-foreground uppercase tracking-wider">{title}</span>
      </div>
      <div className="p-3">{children}</div>
    </motion.div>
  );
}

function SidePanel({ title, count, icon, children }: { title: string; count: number; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -1 }}
      transition={{ duration: 0.15 }}
      className="panel rounded-lg overflow-hidden transition-shadow hover:shadow-[0_0_16px_hsl(var(--primary)/0.06)]"
    >
      <div className="px-3 py-2 border-b border-border flex items-center gap-2">
        <span className="text-primary">{icon}</span>
        <span className="text-[10px] font-display font-semibold text-foreground uppercase tracking-wider">{title}</span>
        <span className="ml-auto text-[9px] font-mono text-muted-foreground">{count}</span>
      </div>
      <div className="px-3 py-2 space-y-0.5">{children}</div>
    </motion.div>
  );
}

function AlertsPanel({ bonecos }: { bonecos: BonecoRow[] }) {
  const noBless = bonecos.filter(b => !b.full_bless);
  const noPremium = bonecos.filter(b => !b.premium_active);
  const lowTC = bonecos.filter(b => b.tibia_coins < 250);
  
  const alerts = [
    { type: 'bless', items: noBless, label: 'Sem Bless', icon: <Shield className="h-3.5 w-3.5" />, color: 'text-destructive', bgColor: 'bg-destructive/10' },
    { type: 'premium', items: noPremium, label: 'Sem Premium', icon: <Crown className="h-3.5 w-3.5" />, color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
    { type: 'tc', items: lowTC, label: 'TC Baixo (<250)', icon: <ItemSprite item="tibiaCoin" className="h-3.5 w-3.5" />, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
  ];

  const totalAlerts = noBless.length + noPremium.length + lowTC.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="panel rounded-lg overflow-hidden"
    >
      <div className="px-4 py-2.5 border-b border-border flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        <span className="text-[11px] font-display font-semibold text-foreground uppercase tracking-wider">Alertas</span>
        {totalAlerts > 0 && (
          <span className="ml-auto px-1.5 py-0.5 text-[9px] font-mono font-bold bg-amber-500/20 text-amber-500 rounded">
            {totalAlerts}
          </span>
        )}
      </div>
      <div className="p-3 space-y-2 max-h-[280px] overflow-y-auto">
        {totalAlerts === 0 ? (
          <div className="text-center py-4">
            <ItemSprite item="online" className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-[10px] text-muted-foreground">Tudo em ordem!</p>
          </div>
        ) : (
          alerts.map(alert => alert.items.length > 0 && (
            <div key={alert.type} className="space-y-1.5">
              <div className={`flex items-center gap-2 px-2 py-1.5 rounded ${alert.bgColor}`}>
                <span className={alert.color}>{alert.icon}</span>
                <span className={`text-[10px] font-semibold ${alert.color}`}>{alert.label}</span>
                <span className="ml-auto text-[9px] font-mono text-muted-foreground">{alert.items.length}</span>
              </div>
              <div className="pl-2 space-y-0.5">
                {alert.items.slice(0, 5).map(b => (
                  <div key={b.id} className="flex items-center gap-2 py-0.5">
                    <StatusDot status={b.status as any} size="sm" />
                    <span className="text-[10px] text-foreground truncate flex-1">{b.name}</span>
                    <span className="text-[8px] text-muted-foreground font-mono">{b.world}</span>
                  </div>
                ))}
                {alert.items.length > 5 && (
                  <span className="text-[9px] text-muted-foreground pl-4">+{alert.items.length - 5} mais...</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}

function LevelLossesPanel({ losses }: { losses: LevelLoss[] }) {
  const totalLost = losses.reduce((sum, l) => sum + l.lostLevels, 0);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="panel rounded-lg overflow-hidden"
    >
      <div className="px-4 py-2.5 border-b border-border flex items-center gap-2">
        <TrendingDown className="h-4 w-4 text-destructive" />
        <span className="text-[11px] font-display font-semibold text-foreground uppercase tracking-wider">Perdas de Level</span>
        {losses.length > 0 && (
          <span className="ml-auto px-1.5 py-0.5 text-[9px] font-mono font-bold bg-destructive/20 text-destructive rounded">
            -{totalLost} lvls
          </span>
        )}
      </div>
      <div className="p-3 max-h-[280px] overflow-y-auto">
        {losses.length === 0 ? (
          <div className="text-center py-4">
            <ItemSprite item="level" className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-[10px] text-muted-foreground">Nenhuma perda de level registrada</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {losses.map((loss, i) => (
              <motion.div
                key={`${loss.name}-${loss.date}-${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-secondary/30 transition-colors"
              >
                <div className="p-1 rounded bg-destructive/10">
                  <TrendingDown className="h-3 w-3 text-destructive" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-foreground truncate">{loss.name}</span>
                    <span className="text-[9px] px-1 py-0.5 rounded bg-destructive/10 text-destructive font-mono font-bold">
                      -{loss.lostLevels}
                    </span>
                  </div>
                  <div className="text-[9px] text-muted-foreground">
                    <span className="line-through">{loss.previousLevel}</span>
                    <span className="mx-1">→</span>
                    <span className="text-foreground font-medium">{loss.currentLevel}</span>
                  </div>
                </div>
                <span className="text-[8px] text-muted-foreground font-mono shrink-0">
                  {timeAgo(loss.date)}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
