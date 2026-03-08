import { useState, useEffect, useMemo } from 'react';
import { getAllLevelHistory, LevelRecord, getMonitoredGuildsAsync } from '@/lib/storage';
import { fetchGuildMembers, fetchGuildMemberDeaths, CharacterDeath } from '@/lib/tibia-api';
import { GuildMember } from '@/types/tibia';
import { supabase } from '@/integrations/supabase/client';
import PageHeader from '@/components/PageHeader';
import { SkeletonRow } from '@/components/SkeletonLoader';
import EmptyState from '@/components/EmptyState';
import { Download } from 'lucide-react';

import ReportSummaryCards from '@/components/relatorio/ReportSummaryCards';
import VocationBreakdown from '@/components/relatorio/VocationBreakdown';
import LevelChart from '@/components/relatorio/LevelChart';
import TopPodium from '@/components/relatorio/TopPodium';
import DeathsPanel from '@/components/relatorio/DeathsPanel';
import MemberTable, { MemberReport } from '@/components/relatorio/MemberTable';
import OnlineHeatmap from '@/components/relatorio/OnlineHeatmap';
import LevelDistribution from '@/components/relatorio/LevelDistribution';
import WarReadiness from '@/components/relatorio/WarReadiness';
import ActivityRisk from '@/components/relatorio/ActivityRisk';

export default function RelatorioPage() {
  const [members, setMembers] = useState<GuildMember[]>([]);
  const [levelHistory, setLevelHistory] = useState<LevelRecord[]>([]);
  const [loginHistory, setLoginHistory] = useState<Array<{ char_name: string; status: string; recorded_at: string }>>([]);
  const [deaths, setDeaths] = useState<CharacterDeath[]>([]);
  const [deathsLoading, setDeathsLoading] = useState(false);
  const [deathProgress, setDeathProgress] = useState<{ loaded: number; total: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<string>('levels_today');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const guilds = await getMonitoredGuildsAsync();
        if (guilds.length === 0) { setLoading(false); return; }

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const [guildMembers, history] = await Promise.all([
          fetchGuildMembers(guilds[0].name),
          getAllLevelHistory(weekAgo),
        ]);

        setMembers(guildMembers);
        setLevelHistory(history);

        // Load login history for heatmap
        const { data: logins } = await supabase
          .from('login_history')
          .select('char_name, status, recorded_at')
          .gte('recorded_at', weekAgo.toISOString())
          .order('recorded_at', { ascending: true });
        setLoginHistory(logins || []);

        // Load deaths for ALL members in background
        setDeathsLoading(true);
        setDeathProgress({ loaded: 0, total: guildMembers.length });
        const allNames = guildMembers.map(m => m.name);
        fetchGuildMemberDeaths(allNames, (loaded, total) => {
          setDeathProgress({ loaded, total });
          // Stream partial results as they come in
        })
          .then(d => { setDeaths(d); setDeathsLoading(false); setDeathProgress(null); })
          .catch(() => { setDeathsLoading(false); setDeathProgress(null); });
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const reports: MemberReport[] = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    return members.map(m => {
      const charHistory = levelHistory.filter(h => h.char_name === m.name);
      const todayHistory = charHistory.filter(h => h.recorded_at >= todayISO);

      const levelUps: Array<{ from: number; to: number; time: string }> = [];
      for (let i = 1; i < charHistory.length; i++) {
        if (charHistory[i].level > charHistory[i - 1].level) {
          levelUps.push({ from: charHistory[i - 1].level, to: charHistory[i].level, time: charHistory[i].recorded_at });
        }
      }

      const firstSeenLevel = charHistory.length > 0 ? charHistory[0].level : m.level;
      const firstTodayLevel = todayHistory.length > 0 ? todayHistory[0].level : m.level;

      return {
        name: m.name,
        vocation: m.vocation,
        level: m.level,
        status: m.status,
        levelsGainedToday: m.level - firstTodayLevel,
        levelsGainedWeek: m.level - firstSeenLevel,
        levelUps,
        firstSeenLevel,
      };
    });
  }, [members, levelHistory]);

  const filtered = useMemo(() => {
    let list = reports.filter(r => !search || r.name.toLowerCase().includes(search.toLowerCase()));
    list.sort((a, b) => {
      if (sortBy === 'levels_today') return b.levelsGainedToday - a.levelsGainedToday;
      if (sortBy === 'levels_week') return b.levelsGainedWeek - a.levelsGainedWeek;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return b.level - a.level;
    });
    return list;
  }, [reports, search, sortBy]);

  // Summary data
  const totalLevelsToday = reports.reduce((s, r) => s + Math.max(0, r.levelsGainedToday), 0);
  const playersUpToday = reports.filter(r => r.levelsGainedToday > 0).length;
  const totalLevelsWeek = reports.reduce((s, r) => s + Math.max(0, r.levelsGainedWeek), 0);
  const onlineNow = members.filter(m => m.status === 'online').length;
  const topGainer = reports.reduce<{ name: string; levels: number } | null>((best, r) => {
    if (r.levelsGainedToday > (best?.levels || 0)) return { name: r.name, levels: r.levelsGainedToday };
    return best;
  }, null);
  const avgLevel = members.length > 0 ? Math.round(members.reduce((s, m) => s + m.level, 0) / members.length) : 0;

  const exportCSV = () => {
    const header = 'Nome,Vocação,Level,Status,Levels Hoje,Levels 7d\n';
    const rows = reports.map(r => `${r.name},${r.vocation},${r.level},${r.status},${r.levelsGainedToday},${r.levelsGainedWeek}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 animate-pulse">
          <div className="w-1 h-8 rounded-full bg-secondary" />
          <div className="h-5 w-48 bg-secondary rounded" />
        </div>
        {Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <EmptyState
        icon="globe"
        title="Sem dados de guild"
        description="Configure uma guild em Config → Guilds para gerar relatórios."
        actionLabel="Ir para Config"
        onAction={() => window.location.href = '/configuracoes'}
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <PageHeader
          title="RELATÓRIO AVANÇADO"
          icon="exiva"
          subtitle={
            <>
              <span className="text-primary font-semibold">{playersUpToday}</span>
              <span>uparam hoje</span>
              <span>•</span>
              <span className="text-primary font-semibold">+{totalLevelsToday}</span>
              <span>levels</span>
              <span>•</span>
              <span className="text-online font-semibold">{onlineNow}</span>
              <span>online</span>
            </>
          }
        />
        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 text-[9px] px-2.5 py-1.5 rounded bg-secondary border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
        >
          <Download className="h-3 w-3" />
          CSV
        </button>
      </div>

      {/* Summary Cards */}
      <ReportSummaryCards data={{
        totalLevelsToday,
        playersUpToday,
        totalLevelsWeek,
        totalMembers: members.length,
        onlineNow,
        topGainer,
        totalDeaths: deaths.length,
        avgLevelGuild: avgLevel,
      }} />

      {/* War Readiness + Podium */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <WarReadiness members={members} loginHistory={loginHistory} />
        <TopPodium players={reports} period="today" />
      </div>

      {/* Level Distribution + Vocation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <LevelDistribution members={members} />
        <VocationBreakdown members={reports} />
      </div>

      {/* Level chart */}
      <LevelChart levelHistory={levelHistory} members={members} />

      {/* Activity & Risk */}
      <ActivityRisk members={members} loginHistory={loginHistory} deaths={deaths} />

      {/* Heatmap + Deaths */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <OnlineHeatmap loginHistory={loginHistory} />
        <DeathsPanel deaths={deaths} loading={deathsLoading} />
      </div>

      {/* Full member table */}
      <MemberTable
        members={filtered}
        search={search}
        setSearch={setSearch}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />
    </div>
  );
}
