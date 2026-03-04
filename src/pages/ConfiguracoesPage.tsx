import { useState, useEffect } from 'react';
import { Plus, Globe, Users, Trash2, RefreshCw, Search, Settings, User, Shield, Save, LogOut, Mail, Key, Clock, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { getMonitoredGuilds, addMonitoredGuild, removeMonitoredGuild } from '@/lib/storage';
import { MonitoredGuild } from '@/types/tibia';
import { getGuildWorld } from '@/lib/tibia-api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const WORLDS = ['Antica', 'Secura', 'Gentebra', 'Belobra', 'Lobera', 'Pacera', 'Quintera', 'Solidera', 'Celebra', 'Firmera', 'Gladera', 'Menera', 'Peloria', 'Refugia', 'Talera', 'Venebra', 'Yonabra', 'Zuna'];

// Settings stored in localStorage
const SETTINGS_KEY = 'exiva_settings';

interface AppSettings {
  refreshInterval: number; // seconds
  maxDeaths: number;
  defaultWorld: string;
  showOfflineBonecos: boolean;
  compactMode: boolean;
  autoFetchDeaths: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  refreshInterval: 60,
  maxDeaths: 30,
  defaultWorld: '',
  showOfflineBonecos: true,
  compactMode: false,
  autoFetchDeaths: true,
};

function loadSettings(): AppSettings {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch { return DEFAULT_SETTINGS; }
}

function saveSettings(s: AppSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

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
  const { user, signOut } = useAuth();
  const [tab, setTab] = useState<'guilds' | 'sistema' | 'perfil'>('guilds');
  const [guilds, setGuilds] = useState<MonitoredGuild[]>([]);
  const [newGuildName, setNewGuildName] = useState('');
  const [newGuildWorld, setNewGuildWorld] = useState('');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [profile, setProfile] = useState({ username: '', email: '' });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new1: '', new2: '' });

  useEffect(() => {
    setGuilds(getMonitoredGuilds());
  }, []);

  useEffect(() => {
    if (user) {
      setProfile({ username: user.user_metadata?.username || user.email || '', email: user.email || '' });
      supabase.from('profiles').select('username').eq('user_id', user.id).single().then(({ data }) => {
        if (data) setProfile(prev => ({ ...prev, username: data.username }));
      });
    }
  }, [user]);

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

  const handleSaveSettings = () => {
    saveSettings(settings);
    toast({ title: 'Configurações salvas!' });
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    const { error } = await supabase.from('profiles').update({ username: profile.username }).eq('user_id', user.id);
    if (error) { toast({ title: 'Erro ao salvar perfil', variant: 'destructive' }); return; }
    toast({ title: 'Perfil atualizado!' });
  };

  const handleChangePassword = async () => {
    if (passwords.new1 !== passwords.new2) { toast({ title: 'As senhas não coincidem', variant: 'destructive' }); return; }
    if (passwords.new1.length < 6) { toast({ title: 'Senha deve ter pelo menos 6 caracteres', variant: 'destructive' }); return; }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: passwords.new1 });
    setChangingPassword(false);
    if (error) { toast({ title: error.message, variant: 'destructive' }); return; }
    setPasswords({ current: '', new1: '', new2: '' });
    toast({ title: 'Senha alterada com sucesso!' });
  };

  const tabs = [
    { id: 'guilds' as const, label: 'Guilds', icon: Search },
    { id: 'sistema' as const, label: 'Sistema', icon: Settings },
    { id: 'perfil' as const, label: 'Perfil', icon: User },
  ];

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-primary neon-text mb-1">Configurações</h1>
      <p className="text-muted-foreground mb-6">Gerencie guilds, sistema e seu perfil</p>

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

      {/* ===== GUILDS TAB ===== */}
      {tab === 'guilds' && (
        <div className="space-y-6">
          {/* Add Guild */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="font-semibold text-foreground flex items-center gap-2 mb-1">
              <Plus className="h-4 w-4 text-primary" /> Adicionar Guild para Monitorar
            </h3>
            <p className="text-sm text-muted-foreground mb-4">A primeira guild da lista será usada na página Exiva</p>
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
                  <option value="">Auto-detectar</option>
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

          {/* Guild List */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
              <Globe className="h-4 w-4 text-primary" /> Guilds Monitoradas ({guilds.length})
            </h3>
            <div className="divide-y divide-border">
              {guilds.map((g, index) => (
                <div key={g.id} className="flex items-center py-3 gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${index === 0 ? 'bg-primary/20 border border-primary/40' : 'bg-primary/10'}`}>
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{g.name}</p>
                      {index === 0 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-semibold">EXIVA</span>}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-3">
                      <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {g.world}</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {g.memberCount} membros</span>
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">{timeAgo(g.lastUpdate)}</span>
                  <button onClick={() => handleRemove(g.id)} className="text-muted-foreground hover:text-destructive transition-colors">
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

      {/* ===== SISTEMA TAB ===== */}
      {tab === 'sistema' && (
        <div className="space-y-6">
          {/* General Settings */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
              <Zap className="h-4 w-4 text-primary" /> Configurações Gerais
            </h3>
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    <Clock className="h-3.5 w-3.5 inline mr-1.5" />
                    Intervalo de Refresh (segundos)
                  </label>
                  <Input
                    type="number"
                    value={settings.refreshInterval}
                    onChange={e => setSettings({ ...settings, refreshInterval: Math.max(10, parseInt(e.target.value) || 60) })}
                    className="bg-secondary"
                    min={10}
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">Mínimo 10 segundos. Padrão: 60s</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    Máx. Mortes Exibidas
                  </label>
                  <Input
                    type="number"
                    value={settings.maxDeaths}
                    onChange={e => setSettings({ ...settings, maxDeaths: Math.max(5, parseInt(e.target.value) || 30) })}
                    className="bg-secondary"
                    min={5}
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">Quantidade de mortes recentes na Exiva</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    <Globe className="h-3.5 w-3.5 inline mr-1.5" />
                    Mundo Padrão
                  </label>
                  <select
                    value={settings.defaultWorld}
                    onChange={e => setSettings({ ...settings, defaultWorld: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-secondary border border-border text-foreground text-sm"
                  >
                    <option value="">Nenhum</option>
                    {WORLDS.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
              </div>

              <div className="border-t border-border pt-4 space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-foreground">Mostrar Bonecos Offline</p>
                    <p className="text-[11px] text-muted-foreground">Exibir bonecos offline na lista de bonecos</p>
                  </div>
                  <Switch checked={settings.showOfflineBonecos} onCheckedChange={v => setSettings({ ...settings, showOfflineBonecos: v })} />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-foreground">Modo Compacto</p>
                    <p className="text-[11px] text-muted-foreground">Reduzir tamanho dos cards de bonecos</p>
                  </div>
                  <Switch checked={settings.compactMode} onCheckedChange={v => setSettings({ ...settings, compactMode: v })} />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-foreground">Auto-buscar Mortes</p>
                    <p className="text-[11px] text-muted-foreground">Buscar mortes automaticamente ao carregar Exiva</p>
                  </div>
                  <Switch checked={settings.autoFetchDeaths} onCheckedChange={v => setSettings({ ...settings, autoFetchDeaths: v })} />
                </label>
              </div>
            </div>

            <div className="flex justify-end mt-5">
              <Button onClick={handleSaveSettings} className="gap-2">
                <Save className="h-4 w-4" /> Salvar Configurações
              </Button>
            </div>
          </div>

          {/* System Info */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
              <Settings className="h-4 w-4 text-primary" /> Informações do Sistema
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="p-3 rounded-lg bg-secondary">
                <p className="text-muted-foreground text-xs">Versão</p>
                <p className="font-mono font-medium">1.0.0</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary">
                <p className="text-muted-foreground text-xs">Auto-refresh</p>
                <p className="font-mono font-medium text-primary">{settings.refreshInterval}s</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary">
                <p className="text-muted-foreground text-xs">API</p>
                <p className="font-mono font-medium">TibiaData v4</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary">
                <p className="text-muted-foreground text-xs">Backend</p>
                <p className="font-mono font-medium text-primary">Cloud</p>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-5">
            <h3 className="font-semibold text-destructive flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4" /> Zona de Perigo
            </h3>
            <p className="text-sm text-muted-foreground mb-4">Ações irreversíveis</p>
            <div className="flex gap-3">
              <Button variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => {
                localStorage.clear();
                toast({ title: 'Cache limpo!', description: 'Dados locais foram removidos.' });
              }}>
                Limpar Cache Local
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ===== PERFIL TAB ===== */}
      {tab === 'perfil' && (
        <div className="space-y-6">
          {/* Profile Info */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
              <User className="h-4 w-4 text-primary" /> Informações do Perfil
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  <User className="h-3.5 w-3.5 inline mr-1.5" /> Nome de Usuário
                </label>
                <Input
                  value={profile.username}
                  onChange={e => setProfile({ ...profile, username: e.target.value })}
                  className="bg-secondary max-w-md"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  <Mail className="h-3.5 w-3.5 inline mr-1.5" /> Email
                </label>
                <Input
                  value={profile.email}
                  disabled
                  className="bg-secondary max-w-md opacity-60"
                />
                <p className="text-[11px] text-muted-foreground mt-1">O email não pode ser alterado</p>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleUpdateProfile} className="gap-2">
                  <Save className="h-4 w-4" /> Salvar Perfil
                </Button>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
              <Key className="h-4 w-4 text-primary" /> Alterar Senha
            </h3>
            <div className="space-y-3 max-w-md">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Nova Senha</label>
                <Input
                  type="password"
                  value={passwords.new1}
                  onChange={e => setPasswords({ ...passwords, new1: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  className="bg-secondary"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Confirmar Nova Senha</label>
                <Input
                  type="password"
                  value={passwords.new2}
                  onChange={e => setPasswords({ ...passwords, new2: e.target.value })}
                  placeholder="Repita a nova senha"
                  className="bg-secondary"
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleChangePassword} disabled={changingPassword} className="gap-2">
                  {changingPassword ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
                  Alterar Senha
                </Button>
              </div>
            </div>
          </div>

          {/* Session */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="font-semibold text-foreground flex items-center gap-2 mb-2">
              <LogOut className="h-4 w-4 text-primary" /> Sessão
            </h3>
            <p className="text-sm text-muted-foreground mb-4">Encerrar sessão atual</p>
            <Button variant="outline" onClick={signOut} className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10">
              <LogOut className="h-4 w-4" /> Sair da Conta
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
