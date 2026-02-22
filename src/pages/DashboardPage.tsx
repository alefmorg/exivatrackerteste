import { useState, useEffect } from 'react';
import { Shield, Users, UserCheck, UserX, Activity, Search, Clock } from 'lucide-react';
import StatCard from '@/components/StatCard';
import { getBonecos, getMonitoredGuilds } from '@/lib/storage';
import { Boneco, MonitoredGuild } from '@/types/tibia';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function DashboardPage() {
  const [bonecos, setBonecos] = useState<Boneco[]>([]);
  const [guilds, setGuilds] = useState<MonitoredGuild[]>([]);

  useEffect(() => {
    setBonecos(getBonecos());
    setGuilds(getMonitoredGuilds());
  }, []);

  const onlineBonecos = bonecos.filter(b => b.status === 'online').length;
  const afkBonecos = bonecos.filter(b => b.status === 'afk').length;
  const offlineBonecos = bonecos.filter(b => b.status === 'offline').length;

  const chartData = [
    { name: 'Online', value: onlineBonecos, fill: 'hsl(142, 76%, 45%)' },
    { name: 'AFK', value: afkBonecos, fill: 'hsl(45, 93%, 47%)' },
    { name: 'Offline', value: offlineBonecos, fill: 'hsl(0, 72%, 51%)' },
  ];

  const activityData = [
    { name: 'Hunt', value: bonecos.filter(b => b.activity === 'hunt').length },
    { name: 'War', value: bonecos.filter(b => b.activity === 'war').length },
    { name: 'Maker', value: bonecos.filter(b => b.activity === 'maker').length },
    { name: 'Boss', value: bonecos.filter(b => b.activity === 'boss').length },
  ];

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-primary neon-text mb-1">Dashboard</h1>
      <p className="text-muted-foreground mb-6">Visão geral do sistema</p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<Shield className="h-5 w-5" />} value={bonecos.length} label="Bonecos" color="primary" />
        <StatCard icon={<UserCheck className="h-5 w-5" />} value={onlineBonecos} label="Online" color="online" />
        <StatCard icon={<Activity className="h-5 w-5" />} value={afkBonecos} label="AFK" color="afk" />
        <StatCard icon={<Search className="h-5 w-5" />} value={guilds.length} label="Guilds" color="primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Chart */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="font-semibold text-foreground mb-4">Status dos Bonecos</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(160, 10%, 16%)" />
                <XAxis dataKey="name" tick={{ fill: 'hsl(150, 10%, 55%)', fontSize: 12 }} axisLine={false} />
                <YAxis tick={{ fill: 'hsl(150, 10%, 55%)', fontSize: 12 }} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(160, 10%, 9%)', border: '1px solid hsl(160, 10%, 16%)', borderRadius: '8px', color: 'hsl(150, 20%, 90%)' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="font-semibold text-foreground mb-4">Atividade dos Bonecos</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(160, 10%, 16%)" />
                <XAxis dataKey="name" tick={{ fill: 'hsl(150, 10%, 55%)', fontSize: 12 }} axisLine={false} />
                <YAxis tick={{ fill: 'hsl(150, 10%, 55%)', fontSize: 12 }} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(160, 10%, 9%)', border: '1px solid hsl(160, 10%, 16%)', borderRadius: '8px', color: 'hsl(150, 20%, 90%)' }}
                />
                <Bar dataKey="value" fill="hsl(142, 76%, 45%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent bonecos */}
        <div className="rounded-lg border border-border bg-card p-5 lg:col-span-2">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> Bonecos Recentes
          </h3>
          {bonecos.length > 0 ? (
            <div className="divide-y divide-border">
              {bonecos.slice(0, 5).map(b => (
                <div key={b.id} className="flex items-center py-2.5 gap-3">
                  <span className={`w-2 h-2 rounded-full ${b.status === 'online' ? 'bg-online' : b.status === 'afk' ? 'bg-afk' : 'bg-offline'}`} />
                  <span className="font-medium text-sm flex-1">{b.name}</span>
                  <span className="text-xs text-muted-foreground">{b.vocation}</span>
                  <span className="text-xs text-muted-foreground font-mono">Lv. {b.level}</span>
                  {b.usedBy && <span className="text-xs text-primary">{b.usedBy}</span>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-6">Nenhum boneco cadastrado ainda</p>
          )}
        </div>
      </div>
    </div>
  );
}
