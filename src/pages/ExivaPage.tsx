import { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, MapPin, Clock, Pencil, Users, UserCheck, UserX } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import StatCard from '@/components/StatCard';
import StatusDot from '@/components/StatusDot';
import StatusBadge from '@/components/StatusBadge';
import { fetchGuildMembers } from '@/lib/tibia-api';
import { getAnnotations, saveAnnotation, getMonitoredGuilds } from '@/lib/storage';
import { GuildMember } from '@/types/tibia';
import { useToast } from '@/hooks/use-toast';

export default function ExivaPage() {
  const { toast } = useToast();
  const [guildName, setGuildName] = useState('');
  const [members, setMembers] = useState<GuildMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline'>('all');
  const [vocFilter, setVocFilter] = useState<string>('all');
  const [editingAnnotation, setEditingAnnotation] = useState<string | null>(null);
  const [annotationText, setAnnotationText] = useState('');
  const [lastUpdate, setLastUpdate] = useState('');

  const annotations = getAnnotations();

  const doFetch = useCallback(async (name: string) => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const data = await fetchGuildMembers(name.trim());
      // Merge annotations
      const withAnnotations = data.map(m => ({
        ...m,
        annotation: annotations[m.name] || '',
      }));
      setMembers(withAnnotations);
      setLastUpdate(new Date().toLocaleTimeString('pt-BR'));
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [annotations, toast]);

  const handleSearch = () => {
    doFetch(guildName);
  };

  // Auto-refresh
  useEffect(() => {
    if (!guildName.trim() || members.length === 0) return;
    const interval = setInterval(() => doFetch(guildName), 60000);
    return () => clearInterval(interval);
  }, [guildName, members.length, doFetch]);

  // Load first monitored guild
  useEffect(() => {
    const guilds = getMonitoredGuilds();
    if (guilds.length > 0 && !guildName) {
      setGuildName(guilds[0].name);
      doFetch(guilds[0].name);
    }
  }, []);

  const onlineCount = members.filter(m => m.status === 'online').length;
  const offlineCount = members.filter(m => m.status === 'offline').length;

  const vocations = [...new Set(members.map(m => m.vocation))].sort();

  const filtered = members.filter(m => {
    if (searchFilter && !m.name.toLowerCase().includes(searchFilter.toLowerCase())) return false;
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;
    if (vocFilter !== 'all' && m.vocation !== vocFilter) return false;
    return true;
  });

  const handleSaveAnnotation = (charName: string) => {
    saveAnnotation(charName, annotationText);
    setMembers(prev => prev.map(m => m.name === charName ? { ...m, annotation: annotationText } : m));
    setEditingAnnotation(null);
    toast({ title: 'Anotação salva' });
  };

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-primary neon-text mb-1">Exiva</h1>
      <p className="text-muted-foreground mb-6">Monitoramento de membros da guild</p>

      {/* Search */}
      <div className="flex gap-3 mb-6 p-4 rounded-lg border border-border bg-card">
        <Input
          value={guildName}
          onChange={e => setGuildName(e.target.value)}
          placeholder="Ex: Warriors of Light"
          className="flex-1 bg-secondary border-border"
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={loading} className="gap-2">
          {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Buscar Guild
        </Button>
      </div>

      {/* Stats */}
      {members.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <StatCard icon={<Users className="h-5 w-5" />} value={members.length} label="Total Membros" color="primary" />
            <StatCard icon={<UserCheck className="h-5 w-5" />} value={onlineCount} label="Online" color="online" />
            <StatCard icon={<UserX className="h-5 w-5" />} value={offlineCount} label="Offline" color="offline" />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                placeholder="Buscar por nome..."
                className="bg-secondary border-border"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm"
            >
              <option value="all">Todos</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
            <select
              value={vocFilter}
              onChange={e => setVocFilter(e.target.value)}
              className="px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm"
            >
              <option value="all">Todas Vocações</option>
              {vocations.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>

          {lastUpdate && (
            <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
              <Clock className="h-3 w-3" /> Última atualização: {lastUpdate} • Auto-refresh a cada 60s
            </p>
          )}

          {/* Members */}
          <div className="rounded-lg border border-border bg-card">
            <div className="p-4 border-b border-border flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Membros ({filtered.length})</h2>
            </div>
            <div className="divide-y divide-border">
              {filtered.map(m => (
                <div key={m.name} className="flex items-center px-4 py-3 hover:bg-secondary/50 transition-colors gap-4">
                  <StatusDot status={m.status} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{m.name}</span>
                      <span className="text-xs text-muted-foreground font-mono">{m.level}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{m.vocation}</span>
                  </div>
                  {m.lastLocation && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {m.lastLocation}
                    </div>
                  )}
                  {/* Annotation */}
                  <div className="flex items-center gap-2">
                    {editingAnnotation === m.name ? (
                      <div className="flex gap-1">
                        <Input
                          value={annotationText}
                          onChange={e => setAnnotationText(e.target.value)}
                          placeholder="Anotação..."
                          className="h-7 text-xs w-32 bg-secondary"
                          onKeyDown={e => e.key === 'Enter' && handleSaveAnnotation(m.name)}
                        />
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handleSaveAnnotation(m.name)}>
                          OK
                        </Button>
                      </div>
                    ) : (
                      <>
                        {m.annotation && (
                          <span className="text-xs px-2 py-0.5 rounded bg-primary/15 text-primary border border-primary/30 font-medium">
                            {m.annotation}
                          </span>
                        )}
                        {!m.annotation && <span className="text-xs text-muted-foreground">Sem anotação</span>}
                        <button
                          onClick={() => {
                            setEditingAnnotation(m.name);
                            setAnnotationText(m.annotation || '');
                          }}
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" /> {m.lastUpdate || 'Agora'}
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  Nenhum membro encontrado
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
