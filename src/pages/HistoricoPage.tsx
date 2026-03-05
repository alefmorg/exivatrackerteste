import { useState, useEffect } from 'react';
import { ArrowRightLeft, Clock, Search, Filter, RefreshCw, Download } from 'lucide-react';
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
  const d = new Date(dateStr);
  return d.toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'Agora';
  if (min < 60) return `${min}min atrás`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours}h atrás`;
  return `${Math.floor(hours / 24)}d atrás`;
}

export default function HistoricoPage() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [actionFilter, setActionFilter] = useState<'' | 'pegar' | 'devolver'>('');
  const [limit, setLimit] = useState(50);

  const fetchLogs = async () => {
    setLoading(true);
    let query = supabase
      .from('boneco_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (actionFilter) {
      query = query.eq('action', actionFilter);
    }

    const { data, error } = await query;
    if (error) {
      toast({ title: 'Erro ao carregar histórico', variant: 'destructive' });
    } else {
      setLogs(data as LogRow[]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, [actionFilter, limit]);

  const filtered = logs.filter(l => {
    if (!searchFilter) return true;
    const q = searchFilter.toLowerCase();
    return l.boneco_name.toLowerCase().includes(q) || l.username.toLowerCase().includes(q);
  });

  // Group by date
  const grouped = filtered.reduce<Record<string, LogRow[]>>((acc, log) => {
    const date = new Date(log.created_at).toLocaleDateString('pt-BR');
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {});

  const exportCSV = () => {
    const header = 'Data,Ação,Boneco,Usuário,Notas\n';
    const rows = filtered.map(l =>
      `"${formatDate(l.created_at)}","${l.action}","${l.boneco_name}","${l.username}","${l.notes}"`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historico_repasses_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <ArrowRightLeft className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Histórico de Repasses</h1>
            <p className="text-xs text-muted-foreground">Registro completo de quem pegou e devolveu cada boneco</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2">
            <Download className="h-4 w-4" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Atualizar
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 my-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={searchFilter} onChange={e => setSearchFilter(e.target.value)}
            placeholder="Buscar por boneco ou usuário..." className="pl-9 bg-secondary border-border" />
        </div>
        <div className="flex gap-1">
          {[
            { value: '' as const, label: '📋 Todos' },
            { value: 'pegar' as const, label: '📥 Pegou' },
            { value: 'devolver' as const, label: '📤 Devolveu' },
          ].map(f => (
            <button key={f.value} onClick={() => setActionFilter(actionFilter === f.value ? '' : f.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${actionFilter === f.value ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary border-border text-muted-foreground hover:text-foreground'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{logs.length}</p>
          <p className="text-xs text-muted-foreground">Total de Registros</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-primary">{logs.filter(l => l.action === 'pegar').length}</p>
          <p className="text-xs text-muted-foreground">Vezes Pegou</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-afk">{logs.filter(l => l.action === 'devolver').length}</p>
          <p className="text-xs text-muted-foreground">Vezes Devolveu</p>
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
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{date}</span>
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">{entries.length} registros</span>
              </div>
              <div className="space-y-1">
                {entries.map(log => (
                  <div key={log.id} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-card border border-border hover:border-primary/20 transition-colors">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${log.action === 'pegar' ? 'bg-primary/15 text-primary' : 'bg-afk/15 text-afk'}`}>
                      {log.action === 'pegar' ? '📥' : '📤'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{log.username || 'Desconhecido'}</span>
                        <span className="text-sm text-muted-foreground">{log.action === 'pegar' ? 'pegou' : 'devolveu'}</span>
                        <span className="text-sm font-medium text-primary">{log.boneco_name}</span>
                      </div>
                      {log.notes && (
                        <p className="text-xs text-muted-foreground mt-0.5 italic">💬 {log.notes}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                      <p className="text-[10px] text-muted-foreground">{timeAgo(log.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <ArrowRightLeft className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Nenhum repasse registrado</p>
            </div>
          )}
          {logs.length >= limit && (
            <div className="text-center">
              <Button variant="outline" onClick={() => setLimit(l => l + 50)}>Carregar mais</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
