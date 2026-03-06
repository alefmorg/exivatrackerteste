import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRightLeft, Clock, Search, RefreshCw, Download, Users, TrendingUp, Calendar, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LogRow {
  id: string;
  boneco_id: string;
  boneco_name: string;
  user_id: string;
  username: string;
  action: string;
  notes: string;
  created_at: string;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'Agora';
  if (min < 60) return `${min}min`;
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
    let query = supabase
      .from('boneco_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (actionFilter) query = query.eq('action', actionFilter);
    const { data, error } = await query;
    if (error) toast({ title: 'Erro ao carregar histórico', variant: 'destructive' });
    else setLogs(data as LogRow[]);
    setLoading(false);
  }, [actionFilter, limit, toast]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  // Real-time new logs
  useEffect(() => {
    const channel = supabase
      .channel('historico-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'boneco_logs' }, (payload) => {
        const newLog = payload.new as LogRow;
        setLogs(prev => [newLog, ...prev].slice(0, limit));
      })
      .subscribe();
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

  // Stats
  const uniqueUsers = new Set(logs.map(l => l.username)).size;
  const uniqueBonecos = new Set(logs.map(l => l.boneco_name)).size;
  const pegarCount = logs.filter(l => l.action === 'pegar').length;
  const devolverCount = logs.filter(l => l.action === 'devolver').length;

  // Most active user
  const userCounts = logs.reduce<Record<string, number>>((acc, l) => {
    acc[l.username] = (acc[l.username] || 0) + 1;
    return acc;
  }, {});
  const mostActive = Object.entries(userCounts).sort((a, b) => b[1] - a[1])[0];

  // Most used boneco
  const bonecoCounts = logs.reduce<Record<string, number>>((acc, l) => {
    acc[l.boneco_name] = (acc[l.boneco_name] || 0) + 1;
    return acc;
  }, {});
  const mostUsed = Object.entries(bonecoCounts).sort((a, b) => b[1] - a[1])[0];

  const exportCSV = () => {
    const header = 'Data,Ação,Boneco,Usuário,Notas\n';
    const rows = filtered.map(l =>
      `"${formatDate(l.created_at)}","${l.action}","${l.boneco_name}","${l.username}","${l.notes}"`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historico_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <ArrowRightLeft className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Histórico de Repasses</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              Registro completo em tempo real
              <span className="flex items-center gap-1 text-primary">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-neon" /> LIVE
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2 text-xs">
            <Download className="h-3.5 w-3.5" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading} className="gap-2 text-xs">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <SmallStat label="Total" value={logs.length} icon={<Calendar className="h-4 w-4" />} />
        <SmallStat label="Pegou" value={pegarCount} icon={<span>📥</span>} color="primary" />
        <SmallStat label="Devolveu" value={devolverCount} icon={<span>📤</span>} color="afk" />
        <SmallStat label="Usuários" value={uniqueUsers} icon={<Users className="h-4 w-4" />} />
        <SmallStat label="Bonecos" value={uniqueBonecos} icon={<TrendingUp className="h-4 w-4" />} />
        <div className="glass-card rounded-xl p-3 text-center">
          <p className="text-[10px] text-muted-foreground mb-1">Mais Ativo</p>
          <p className="text-sm font-bold text-primary truncate">{mostActive ? mostActive[0] : '—'}</p>
          <p className="text-[10px] text-muted-foreground">{mostActive ? `${mostActive[1]} ações` : ''}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={searchFilter} onChange={e => setSearchFilter(e.target.value)}
            placeholder="Buscar por boneco ou usuário..." className="pl-9 bg-secondary border-border" />
        </div>
        <div className="flex gap-1">
          {([
            { value: '' as const, label: '📋 Todos', count: logs.length },
            { value: 'pegar' as const, label: '📥 Pegou', count: pegarCount },
            { value: 'devolver' as const, label: '📤 Devolveu', count: devolverCount },
          ]).map(f => (
            <button key={f.value} onClick={() => setActionFilter(actionFilter === f.value ? '' : f.value)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                actionFilter === f.value
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20'
                  : 'bg-secondary border-border text-muted-foreground hover:text-foreground hover:border-primary/30'
              }`}>
              {f.label} <span className="font-mono ml-1 opacity-70">{f.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, entries]) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" /> {date}
                </span>
                <div className="flex-1 glow-divider" />
                <span className="text-[11px] text-muted-foreground">{entries.length} registros</span>
              </div>
              <div className="space-y-1">
                <AnimatePresence mode="popLayout">
                  {entries.map(log => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      layout
                      className="flex items-center gap-3 px-4 py-3 rounded-xl glass-card-hover"
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm shrink-0 ${
                        log.action === 'pegar' ? 'bg-primary/15 text-primary' : 'bg-afk/15 text-afk'
                      }`}>
                        {log.action === 'pegar' ? '📥' : '📤'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium text-foreground">{log.username || '?'}</span>
                          <span className="text-sm text-muted-foreground">{log.action === 'pegar' ? 'pegou' : 'devolveu'}</span>
                          <span className="text-sm font-medium text-primary">{log.boneco_name}</span>
                        </div>
                        {log.notes && <p className="text-[11px] text-muted-foreground mt-0.5 italic truncate">💬 {log.notes}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-foreground font-mono">{new Date(log.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                        <p className="text-[10px] text-muted-foreground">{timeAgo(log.created_at)}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <ArrowRightLeft className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="text-lg font-medium">Nenhum repasse registrado</p>
              <p className="text-sm mt-1">Os registros aparecerão aqui automaticamente</p>
            </div>
          )}
          {logs.length >= limit && (
            <div className="text-center pt-4">
              <Button variant="outline" onClick={() => setLimit(l => l + 50)} className="gap-2">
                Carregar mais
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SmallStat({ label, value, icon, color = 'foreground' }: { label: string; value: number; icon: React.ReactNode; color?: string }) {
  const colorClass = color === 'primary' ? 'text-primary' : color === 'afk' ? 'text-afk' : 'text-foreground';
  return (
    <div className="glass-card rounded-xl p-3 text-center">
      <div className="flex justify-center mb-1 text-muted-foreground">{icon}</div>
      <p className={`text-lg font-bold ${colorClass}`}>{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
