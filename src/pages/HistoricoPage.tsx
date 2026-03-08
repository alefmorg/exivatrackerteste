import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ItemSprite } from '@/components/TibiaIcons';

interface LogRow {
  id: string; boneco_id: string; boneco_name: string; user_id: string;
  username: string; action: string; notes: string; created_at: string;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `${min}m`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 rounded-full bg-primary" />
          <div>
            <h1 className="text-lg font-display font-bold text-foreground tracking-wide flex items-center gap-2">
              <ItemSprite item="history" className="h-5 w-5" /> BATTLE LOG
            </h1>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
              <span>{logs.length} registros</span>
              <span className="text-primary flex items-center gap-1">
                <ItemSprite item="live" className="h-4 w-4 animate-pulse" /> REALTIME
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={exportCSV} className="p-1.5 rounded border border-border hover:border-primary/30 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all">
            <ItemSprite item="scroll" className="h-5 w-5" />
          </button>
          <button onClick={fetchLogs} disabled={loading} className="p-1.5 rounded border border-border hover:border-primary/30 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all">
            <ItemSprite item="refresh" className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {[
          { label: 'TOTAL', value: logs.length.toString(), sprite: 'scroll' as const },
          { label: 'PEGOU', value: pegarCount.toString(), sprite: 'login' as const, highlight: true },
          { label: 'DEVOLVEU', value: devolverCount.toString(), sprite: 'logout' as const },
          { label: 'USERS', value: uniqueUsers.toString(), sprite: 'users' as const },
          { label: 'CHARS', value: uniqueBonecos.toString(), sprite: 'bonecos' as const },
          { label: 'TOP USER', value: mostActive?.[0] || '—', sprite: 'crown' as const, highlight: true },
        ].map(m => (
          <div key={m.label} className="panel-inset rounded-md p-2 text-center">
            <div className="flex items-center justify-center mb-0.5">
              <ItemSprite item={m.sprite} className="h-5 w-5" />
            </div>
            <p className={`text-sm font-bold font-mono ${m.highlight ? 'text-primary' : 'text-foreground'} truncate`}>{m.value}</p>
            <p className="text-[8px] text-muted-foreground uppercase tracking-[0.15em] mt-0.5">{m.label}</p>
          </div>
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
        <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
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
                      <ItemSprite item={log.action === 'pegar' ? 'login' : 'logout'} className="h-4 w-4 shrink-0" />
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
            <div className="text-center py-16 text-muted-foreground">
              <ItemSprite item="history" className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">Nenhum repasse registrado</p>
            </div>
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
