import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ItemSprite } from '@/components/TibiaIcons';
import { timeAgo, formatDate } from '@/lib/utils';
import PageHeader from '@/components/PageHeader';
import MetricCard from '@/components/MetricCard';
import EmptyState from '@/components/EmptyState';

interface LogRow {
  id: string; boneco_id: string; boneco_name: string; user_id: string;
  username: string; action: string; notes: string; created_at: string;
}

// timeAgo and formatDate imported from utils

export default function HistoricoPage() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [actionFilter, setActionFilter] = useState<'' | 'pegar' | 'devolver'>('');
  const [limit, setLimit] = useState(50);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('boneco_logs').select('*').order('created_at', { ascending: false }).limit(limit);
    if (actionFilter) query = query.eq('action', actionFilter);
    const { data, error } = await query;
    if (error) toast({ title: 'Erro ao carregar histórico', variant: 'destructive' });
    else setLogs(data as LogRow[]);
    setLoading(false);
  }, [actionFilter, limit, toast]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  useEffect(() => {
    const channel = supabase.channel('historico-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'boneco_logs' }, (payload) => {
        setLogs(prev => [payload.new as LogRow, ...prev].slice(0, limit));
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [limit]);

  const filtered = logs.filter(l => {
    if (!searchFilter) return true;
    const q = searchFilter.toLowerCase();
    return l.boneco_name.toLowerCase().includes(q) || l.username.toLowerCase().includes(q);
  });

  const grouped = filtered.reduce<Record<string, LogRow[]>>((acc, log) => {
    const date = new Date(log.created_at).toLocaleDateString('pt-BR');
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {});

  const uniqueUsers = new Set(logs.map(l => l.username)).size;
  const uniqueBonecos = new Set(logs.map(l => l.boneco_name)).size;
  const pegarCount = logs.filter(l => l.action === 'pegar').length;
  const devolverCount = logs.filter(l => l.action === 'devolver').length;
  const mostActive = Object.entries(logs.reduce<Record<string, number>>((acc, l) => { acc[l.username] = (acc[l.username] || 0) + 1; return acc; }, {})).sort((a, b) => b[1] - a[1])[0];

  const exportCSV = () => {
    const header = 'Data,Ação,Boneco,Usuário,Notas\n';
    const rows = filtered.map(l => `"${formatDate(l.created_at)}","${l.action}","${l.boneco_name}","${l.username}","${l.notes}"`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `historico_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="BATTLE LOG"
        icon="history"
        subtitle={<><span>{logs.length} registros</span><span className="text-primary flex items-center gap-1"><ItemSprite item="live" className="h-4 w-4 animate-pulse" /> REALTIME</span></>}
        actions={<>
          <button onClick={exportCSV} className="p-1.5 rounded border border-border hover:border-primary/30 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all">
            <ItemSprite item="scroll" className="h-5 w-5" />
          </button>
          <button onClick={fetchLogs} disabled={loading} className="p-1.5 rounded border border-border hover:border-primary/30 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all">
            <ItemSprite item="refresh" className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </>}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {[
          { label: 'TOTAL', value: logs.length.toString(), sprite: 'scroll' as const },
          { label: 'PEGOU', value: pegarCount.toString(), sprite: 'login' as const, highlight: true },
          { label: 'DEVOLVEU', value: devolverCount.toString(), sprite: 'logout' as const },
          { label: 'USERS', value: uniqueUsers.toString(), sprite: 'users' as const },
          { label: 'CHARS', value: uniqueBonecos.toString(), sprite: 'bonecos' as const },
          { label: 'TOP USER', value: mostActive?.[0] || '—', sprite: 'crown' as const, highlight: true },
        ].map((m, i) => (
          <MetricCard key={m.label} label={m.label} value={m.value} sprite={m.sprite} highlight={m.highlight} delay={i * 0.04} />
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 items-center">
        <div className="flex-1 relative">
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2">
            <ItemSprite item="search" className="h-4 w-4" />
          </div>
          <Input value={searchFilter} onChange={e => setSearchFilter(e.target.value)}
            placeholder="Buscar char ou usuário..." className="pl-8 h-8 text-xs bg-secondary/50 border-border" />
        </div>
        <div className="flex gap-px">
          {([
            { value: '' as const, label: 'Todos', count: logs.length },
            { value: 'pegar' as const, label: '→ Pegou', count: pegarCount },
            { value: 'devolver' as const, label: '← Devolveu', count: devolverCount },
          ]).map(f => (
            <button key={f.value} onClick={() => setActionFilter(actionFilter === f.value ? '' : f.value)}
              className={`px-2.5 py-1.5 text-[10px] font-semibold border transition-all first:rounded-l-md last:rounded-r-md ${
                actionFilter === f.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-secondary border-border text-muted-foreground hover:text-foreground'
              }`}>
              {f.label} <span className="font-mono ml-0.5 opacity-70">{f.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      {loading ? (
        <SkeletonPage />
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([date, entries]) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[10px] font-display font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <ItemSprite item="calendar" className="h-4 w-4" /> {date}
                </span>
                <div className="flex-1 glow-divider" />
                <span className="text-[9px] text-muted-foreground font-mono">{entries.length}</span>
              </div>
              <div className="panel rounded-lg overflow-hidden">
                <AnimatePresence mode="popLayout">
                  {entries.map(log => (
                    <motion.div key={log.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} layout
                      className="flex items-center py-2 px-3 gap-3 border-b border-border/50 last:border-0 hover:bg-secondary/30 transition-colors">
                      <ItemSprite item={log.action === 'pegar' ? 'login' : 'logout'} className="h-5 w-5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 text-xs">
                          <span className="font-semibold text-foreground">{log.username || '?'}</span>
                          <span className="text-muted-foreground">{log.action === 'pegar' ? '→ pegou' : '← devolveu'}</span>
                          <span className="font-semibold text-primary truncate">{log.boneco_name}</span>
                        </div>
                        {log.notes && <p className="text-[10px] text-muted-foreground truncate mt-0.5">{log.notes}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] text-foreground font-mono">{new Date(log.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                        <p className="text-[9px] text-muted-foreground">{timeAgo(log.created_at)}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <EmptyState icon="history" title="Nenhum repasse registrado" description="Os logs de pegar/devolver bonecos aparecerão aqui." />
          )}
          {logs.length >= limit && (
            <div className="text-center pt-2">
              <Button variant="outline" size="sm" onClick={() => setLimit(l => l + 50)} className="text-xs">Carregar mais</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
