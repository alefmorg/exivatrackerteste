import { useState, useEffect } from 'react';
import { Swords, Users, UserCheck, UserX, Target, Skull, ScrollText, ArrowRightLeft, Clock, Globe } from 'lucide-react';
import StatCard from '@/components/StatCard';
import { getMonitoredGuilds } from '@/lib/storage';
import { MonitoredGuild } from '@/types/tibia';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import StatusDot from '@/components/StatusDot';
import { VocationIcon, getVocationColor } from '@/components/TibiaIcons';

interface BonecoRow {
  id: string; name: string; level: number; vocation: string; world: string;
  status: string; activity: string; used_by: string; last_access: string;
  full_bless: boolean; premium_active: boolean; tibia_coins: number;
}

interface LogRow {
  id: string; boneco_name: string; username: string; action: string; created_at: string;
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

export default function DashboardPage() {
  const [bonecos, setBonecos] = useState<BonecoRow[]>([]);
  const [guilds, setGuilds] = useState<MonitoredGuild[]>([]);
  const [recentLogs, setRecentLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setGuilds(getMonitoredGuilds());
    const fetchData = async () => {
      const [{ data: bData }, { data: lData }] = await Promise.all([
        supabase.from('bonecos').select('id,name,level,vocation,world,status,activity,used_by,last_access,full_bless,premium_active,tibia_coins').order('created_at', { ascending: false }),
        supabase.from('boneco_logs').select('id,boneco_name,username,action,created_at').order('created_at', { ascending: false }).limit(10),
      ]);
      if (bData) setBonecos(bData as BonecoRow[]);
      if (lData) setRecentLogs(lData as LogRow[]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const onlineCount = bonecos.filter(b => b.status === 'online').length;
  const afkCount = bonecos.filter(b => b.status === 'afk').length;
  const offlineCount = bonecos.filter(b => b.status === 'offline').length;
  const inUseCount = bonecos.filter(b => b.used_by).length;
  const totalTC = bonecos.reduce((sum, b) => sum + (b.tibia_coins || 0), 0);
  const blessCount = bonecos.filter(b => b.full_bless).length;
  const premiumCount = bonecos.filter(b => b.premium_active).length;

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

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-primary neon-text mb-1" style={{ fontFamily: "'MedievalSharp', cursive" }}>⚔ Dashboard</h1>
      <p className="text-muted-foreground mb-6">Visão geral do campo de batalha</p>

      {/* Primary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        <StatCard icon={<Swords className="h-5 w-5" />} value={bonecos.length} label="Bonecos" color="primary" />
        <StatCard icon={<UserCheck className="h-5 w-5" />} value={onlineCount} label="Online" color="online" />
        <StatCard icon={<Skull className="h-5 w-5" />} value={afkCount} label="AFK" color="afk" />
        <StatCard icon={<UserX className="h-5 w-5" />} value={offlineCount} label="Offline" color="offline" />
        <StatCard icon={<ArrowRightLeft className="h-5 w-5" />} value={inUseCount} label="Em Uso" color="primary" />
        <StatCard icon={<Target className="h-5 w-5" />} value={guilds.length} label="Guilds" color="primary" />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-lg border border-border bg-card p-4 flex items-center gap-3">
          <span className="text-xl">💰</span>
          <div>
            <p className="text-lg font-bold text-foreground">{totalTC.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Tibia Coins</p>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 flex items-center gap-3">
          <span className="text-xl">❤️</span>
          <div>
            <p className="text-lg font-bold text-foreground">{blessCount}/{bonecos.length}</p>
            <p className="text-xs text-muted-foreground">Full Bless</p>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 flex items-center gap-3">
          <span className="text-xl">👑</span>
          <div>
            <p className="text-lg font-bold text-foreground">{premiumCount}/{bonecos.length}</p>
            <p className="text-xs text-muted-foreground">Premium Active</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Status Pie */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="font-semibold text-foreground mb-4">Status dos Bonecos</h3>
          <div className="h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'hsl(160, 10%, 9%)', border: '1px solid hsl(160, 10%, 16%)', borderRadius: '8px', color: 'hsl(150, 20%, 90%)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Bar */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="font-semibold text-foreground mb-4">Atividades</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(160, 10%, 16%)" />
                <XAxis dataKey="name" tick={{ fill: 'hsl(150, 10%, 55%)', fontSize: 12 }} axisLine={false} />
                <YAxis tick={{ fill: 'hsl(150, 10%, 55%)', fontSize: 12 }} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(160, 10%, 9%)', border: '1px solid hsl(160, 10%, 16%)', borderRadius: '8px', color: 'hsl(150, 20%, 90%)' }} />
                <Bar dataKey="value" fill="hsl(142, 76%, 45%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vocation Distribution */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="font-semibold text-foreground mb-4">Vocações</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vocData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(160, 10%, 16%)" />
                <XAxis type="number" tick={{ fill: 'hsl(150, 10%, 55%)', fontSize: 12 }} axisLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: 'hsl(150, 10%, 55%)', fontSize: 11 }} axisLine={false} width={110} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(160, 10%, 9%)', border: '1px solid hsl(160, 10%, 16%)', borderRadius: '8px', color: 'hsl(150, 20%, 90%)' }} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {vocData.map((entry, i) => <Cell key={i} fill={VOC_COLORS[entry.name] || 'hsl(150, 10%, 40%)'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Worlds */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" /> Distribuição por Mundo
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {worldData.map(w => (
              <div key={w.name} className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground w-24 truncate">{w.name}</span>
                <div className="flex-1 h-5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary/60 rounded-full" style={{ width: `${(w.value / bonecos.length) * 100}%` }} />
                </div>
                <span className="text-xs text-muted-foreground font-mono w-6 text-right">{w.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity + Characters side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Handoffs */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4 text-primary" /> Últimos Repasses
          </h3>
          {recentLogs.length > 0 ? (
            <div className="divide-y divide-border">
              {recentLogs.map(log => (
                <div key={log.id} className="flex items-center py-2.5 gap-3">
                  <span className={`text-sm ${log.action === 'pegar' ? 'text-primary' : 'text-afk'}`}>
                    {log.action === 'pegar' ? '📥' : '📤'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-foreground">{log.username}</span>
                    <span className="text-sm text-muted-foreground"> {log.action === 'pegar' ? 'pegou' : 'devolveu'} </span>
                    <span className="text-sm font-medium text-primary">{log.boneco_name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {timeAgo(log.created_at)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-6">Nenhum repasse registrado</p>
          )}
        </div>

        {/* Characters in Use */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <ScrollText className="h-4 w-4 text-primary" /> Bonecos em Uso
          </h3>
          {bonecos.filter(b => b.used_by).length > 0 ? (
            <div className="divide-y divide-border">
              {bonecos.filter(b => b.used_by).slice(0, 8).map(b => (
                <div key={b.id} className="flex items-center py-2.5 gap-3">
                  <StatusDot status={b.status as any} />
                  <VocationIcon vocation={b.vocation} className={`h-3.5 w-3.5 ${getVocationColor(b.vocation)}`} />
                  <span className="font-medium text-sm flex-1 truncate">{b.name}</span>
                  <span className="text-xs text-muted-foreground">{b.vocation}</span>
                  <span className="text-xs text-muted-foreground font-mono">Lv.{b.level}</span>
                  <span className="text-xs text-primary font-medium">👤 {b.used_by}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-6">Nenhum boneco em uso</p>
          )}
        </div>
      </div>
    </div>
  );
}
