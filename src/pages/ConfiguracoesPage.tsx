import { useState, useEffect } from 'react';
import { Plus, Globe, Users, Trash2, RefreshCw, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getMonitoredGuilds, addMonitoredGuild, removeMonitoredGuild, saveMonitoredGuilds } from '@/lib/storage';
import { MonitoredGuild } from '@/types/tibia';
import { getGuildWorld } from '@/lib/tibia-api';
import { useToast } from '@/hooks/use-toast';

const WORLDS = ['Antica', 'Secura', 'Gentebra', 'Belobra', 'Lobera', 'Pacera', 'Quintera', 'Solidera', 'Celebra', 'Firmera', 'Gladera', 'Menera', 'Peloria', 'Refugia', 'Talera', 'Venebra', 'Yonabra', 'Zuna'];

function timeAgo(dateStr: string) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'Agora';
  if (min < 60) return `Há ${min} min`;
  return `Há ${Math.floor(min / 60)}h`;
}

export default function ConfiguracoesPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState<'guilds' | 'usuarios' | 'sistema' | 'perfil'>('guilds');
  const [guilds, setGuilds] = useState<MonitoredGuild[]>([]);
  const [newGuildName, setNewGuildName] = useState('');
  const [newGuildWorld, setNewGuildWorld] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setGuilds(getMonitoredGuilds());
  }, []);

  const handleAddGuild = async () => {
    if (!newGuildName.trim()) { toast({ title: 'Informe o nome da guild', variant: 'destructive' }); return; }
    setLoading(true);
    try {
      const world = newGuildWorld || await getGuildWorld(newGuildName.trim());
      const guild: MonitoredGuild = {
        id: Date.now().toString(36),
        name: newGuildName.trim(),
        world,
        memberCount: 0,
        lastUpdate: new Date().toISOString(),
      };
      addMonitoredGuild(guild);
      setGuilds(getMonitoredGuilds());
      setNewGuildName('');
      setNewGuildWorld('');
      toast({ title: 'Guild adicionada' });
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (id: string) => {
    removeMonitoredGuild(id);
    setGuilds(getMonitoredGuilds());
    toast({ title: 'Guild removida' });
  };

  const tabs = [
    { id: 'guilds', label: 'Guilds', icon: Search },
    { id: 'usuarios', label: 'Usuários', icon: Users },
    { id: 'sistema', label: 'Sistema', icon: Globe },
    { id: 'perfil', label: 'Perfil', icon: Users },
  ] as const;

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-primary neon-text mb-1">Configurações</h1>
      <p className="text-muted-foreground mb-6">Gerencie guilds, usuários e configurações do sistema</p>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 bg-secondary rounded-lg w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'guilds' && (
        <div className="space-y-6">
          {/* Add Guild */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="font-semibold text-foreground flex items-center gap-2 mb-1">
              <Plus className="h-4 w-4 text-primary" /> Adicionar Guild para Monitorar
            </h3>
            <p className="text-sm text-muted-foreground mb-4">Insira o nome e mundo da guild que deseja monitorar</p>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-sm font-medium text-foreground mb-1 block">Nome da Guild</label>
                <Input
                  value={newGuildName}
                  onChange={e => setNewGuildName(e.target.value)}
                  placeholder="Ex: Warriors of Light"
                  className="bg-secondary"
                  onKeyDown={e => e.key === 'Enter' && handleAddGuild()}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Mundo</label>
                <select
                  value={newGuildWorld}
                  onChange={e => setNewGuildWorld(e.target.value)}
                  className="h-10 px-3 rounded-lg bg-secondary border border-border text-foreground text-sm"
                >
                  <option value="">Selecione...</option>
                  {WORLDS.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
              <div className="flex items-end">
                <Button onClick={handleAddGuild} disabled={loading} className="gap-2">
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Adicionar
                </Button>
              </div>
            </div>
          </div>

          {/* Monitored Guilds */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
              <Globe className="h-4 w-4 text-primary" /> Guilds Monitoradas ({guilds.length})
            </h3>
            <div className="divide-y divide-border">
              {guilds.map(g => (
                <div key={g.id} className="flex items-center py-3 gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{g.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-3">
                      <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {g.world}</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {g.memberCount} membros</span>
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">{timeAgo(g.lastUpdate)}</span>
                  <button onClick={() => handleRemove(g.id)} className="text-muted-foreground hover:text-offline transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {guilds.length === 0 && (
                <p className="py-6 text-center text-muted-foreground text-sm">Nenhuma guild monitorada</p>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'usuarios' && (
        <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
          <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Gerenciamento de Usuários</p>
          <p className="text-sm">Ative o Lovable Cloud para sistema de autenticação e permissões</p>
        </div>
      )}

      {tab === 'sistema' && (
        <div className="rounded-lg border border-border bg-card p-5 space-y-4">
          <h3 className="font-semibold text-foreground">Sistema</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 rounded-lg bg-secondary">
              <p className="text-muted-foreground">Versão</p>
              <p className="font-mono font-medium">1.0.0</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary">
              <p className="text-muted-foreground">Auto-refresh</p>
              <p className="font-mono font-medium text-primary">60s</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary">
              <p className="text-muted-foreground">API</p>
              <p className="font-mono font-medium">TibiaData v4</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary">
              <p className="text-muted-foreground">Storage</p>
              <p className="font-mono font-medium">localStorage</p>
            </div>
          </div>
        </div>
      )}

      {tab === 'perfil' && (
        <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
          <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Perfil do Usuário</p>
          <p className="text-sm">Ative o Lovable Cloud para gerenciar seu perfil</p>
        </div>
      )}
    </div>
  );
}
