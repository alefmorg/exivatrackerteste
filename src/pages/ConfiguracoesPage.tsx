import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Globe, Users, Trash2, RefreshCw, Search, Settings, User, Shield, Save, LogOut, Mail, Key, Clock, Zap, Palette, Bell, Database, Monitor, Eye, EyeOff, ChevronDown, ChevronUp, AlertTriangle, Check, Volume2, VolumeX, Sun, Moon, Layout, Columns, List, Grid3X3, Paintbrush, Image } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { getMonitoredGuilds, addMonitoredGuild, removeMonitoredGuild } from '@/lib/storage';
import { MonitoredGuild } from '@/types/tibia';
import { getGuildWorld } from '@/lib/tibia-api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { loadSettings, saveSettings, applyTheme, THEME_PRESETS, type AppSettings, type ThemePreset, type IconPack, DEFAULT_SETTINGS } from '@/hooks/useSettings';

const WORLDS = ['Antica', 'Secura', 'Gentebra', 'Belobra', 'Lobera', 'Pacera', 'Quintera', 'Solidera', 'Celebra', 'Firmera', 'Gladera', 'Menera', 'Peloria', 'Refugia', 'Talera', 'Venebra', 'Yonabra', 'Zuna'];

function timeAgo(dateStr: string) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'Agora';
  if (min < 60) return `Há ${min} min`;
  return `Há ${Math.floor(min / 60)}h`;
}

type Tab = 'guilds' | 'bonecos' | 'exiva' | 'dashboard' | 'notificacoes' | 'perfil' | 'sistema';

export default function ConfiguracoesPage() {
  const { toast } = useToast();
  const { user, signOut, refreshProfile } = useAuth();
  const [tab, setTab] = useState<Tab>('bonecos');
  const [guilds, setGuilds] = useState<MonitoredGuild[]>([]);
  const [newGuildName, setNewGuildName] = useState('');
  const [newGuildWorld, setNewGuildWorld] = useState('');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [profile, setProfile] = useState({ username: '', email: '' });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwords, setPasswords] = useState({ new1: '', new2: '' });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => { setGuilds(getMonitoredGuilds()); }, []);

  useEffect(() => {
    if (user) {
      setProfile({ username: user.user_metadata?.username || user.email || '', email: user.email || '' });
      supabase.from('profiles').select('username').eq('user_id', user.id).single().then(({ data }) => {
        if (data) setProfile(prev => ({ ...prev, username: data.username }));
      });
    }
  }, [user]);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSaveSettings = () => {
    saveSettings(settings);
    setHasChanges(false);
    toast({ title: '✅ Configurações salvas!' });
  };

  const handleAddGuild = async () => {
    if (!newGuildName.trim()) { toast({ title: 'Informe o nome da guild', variant: 'destructive' }); return; }
    setLoading(true);
    try {
      const world = newGuildWorld || await getGuildWorld(newGuildName.trim());
      const guild: MonitoredGuild = { id: Date.now().toString(36), name: newGuildName.trim(), world, memberCount: 0, lastUpdate: new Date().toISOString() };
      addMonitoredGuild(guild);
      setGuilds(getMonitoredGuilds());
      setNewGuildName(''); setNewGuildWorld('');
      toast({ title: 'Guild adicionada' });
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const handleRemove = (id: string) => {
    removeMonitoredGuild(id);
    setGuilds(getMonitoredGuilds());
    toast({ title: 'Guild removida' });
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    const { error } = await supabase.from('profiles').update({ username: profile.username }).eq('user_id', user.id);
    if (error) { toast({ title: 'Erro ao salvar perfil', variant: 'destructive' }); return; }
    await refreshProfile();
    toast({ title: '✅ Perfil atualizado!' });
  };

  const handleChangePassword = async () => {
    if (passwords.new1 !== passwords.new2) { toast({ title: 'As senhas não coincidem', variant: 'destructive' }); return; }
    if (passwords.new1.length < 6) { toast({ title: 'Mínimo 6 caracteres', variant: 'destructive' }); return; }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: passwords.new1 });
    setChangingPassword(false);
    if (error) { toast({ title: error.message, variant: 'destructive' }); return; }
    setPasswords({ new1: '', new2: '' });
    toast({ title: '✅ Senha alterada!' });
  };

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'bonecos', label: 'Bonecos', icon: Layout },
    { id: 'exiva', label: 'Exiva', icon: Search },
    { id: 'dashboard', label: 'Dashboard', icon: Monitor },
    { id: 'guilds', label: 'Guilds', icon: Globe },
    { id: 'notificacoes', label: 'Notificações', icon: Bell },
    { id: 'perfil', label: 'Perfil', icon: User },
    { id: 'sistema', label: 'Sistema', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Configurações</h1>
            <p className="text-xs text-muted-foreground">Personalize cada aspecto do sistema</p>
          </div>
        </div>
        {hasChanges && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <Button onClick={handleSaveSettings} className="gap-2">
              <Save className="h-4 w-4" /> Salvar Alterações
            </Button>
          </motion.div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-secondary/50 rounded-xl overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              tab === t.id ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}>
            {tab === t.id && (
              <motion.div layoutId="settings-tab" className="absolute inset-0 rounded-lg bg-card border border-border shadow-sm" transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
            )}
            <t.icon className="h-3.5 w-3.5 relative z-10" />
            <span className="relative z-10">{t.label}</span>
          </button>
        ))}
      </div>

      {/* ===== BONECOS TAB ===== */}
      {tab === 'bonecos' && (
        <div className="space-y-4">
          <SettingsSection title="Layout dos Cards" icon={<Layout className="h-4 w-4 text-primary" />}>
            <SettingRow label="Layout" description="Como os cards de bonecos são exibidos">
              <div className="flex gap-1">
                {[
                  { value: 'grid' as const, icon: <Grid3X3 className="h-3.5 w-3.5" />, label: 'Grid' },
                  { value: 'list' as const, icon: <List className="h-3.5 w-3.5" />, label: 'Lista' },
                ].map(opt => (
                  <button key={opt.value} onClick={() => updateSetting('cardLayout', opt.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      settings.cardLayout === opt.value ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary border-border text-muted-foreground'
                    }`}>
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>
            </SettingRow>
            <SettingToggle label="Modo Compacto" description="Reduz o tamanho dos cards" checked={settings.compactMode} onChange={v => updateSetting('compactMode', v)} />
            <SettingToggle label="Mostrar Offline" description="Exibir bonecos offline na lista" checked={settings.showOfflineBonecos} onChange={v => updateSetting('showOfflineBonecos', v)} />
          </SettingsSection>

          <SettingsSection title="Visibilidade" icon={<Eye className="h-4 w-4 text-primary" />}>
            <SettingToggle label="Credenciais" description="Mostrar seção de email, senha e 2FA nos cards" checked={settings.showCredentials} onChange={v => updateSetting('showCredentials', v)} />
            <SettingToggle label="Skills" description="Mostrar skills (ML, Sword, etc.) nos cards" checked={settings.showSkills} onChange={v => updateSetting('showSkills', v)} />
            <SettingToggle label="Quests" description="Mostrar tags de quests completas" checked={settings.showQuests} onChange={v => updateSetting('showQuests', v)} />
            <SettingToggle label="Acessos" description="Mostrar tags de acessos liberados" checked={settings.showAcessos} onChange={v => updateSetting('showAcessos', v)} />
          </SettingsSection>

          <SettingsSection title="Repasse" icon={<RefreshCw className="h-4 w-4 text-primary" />}>
            <SettingToggle label="Auto Devolver" description="Devolver automaticamente sem confirmação" checked={settings.autoClaimReturn} onChange={v => updateSetting('autoClaimReturn', v)} />
          </SettingsSection>
        </div>
      )}

      {/* ===== EXIVA TAB ===== */}
      {tab === 'exiva' && (
        <div className="space-y-4">
          <SettingsSection title="Monitoramento" icon={<Search className="h-4 w-4 text-primary" />}>
            <SettingRow label="Intervalo de Refresh" description={`Atualiza a lista de membros a cada X segundos (mín. 10s)`}>
              <div className="flex items-center gap-2">
                <Input type="number" value={settings.refreshInterval} min={10}
                  onChange={e => updateSetting('refreshInterval', Math.max(10, parseInt(e.target.value) || 60))}
                  className="bg-secondary w-24 text-center" />
                <span className="text-xs text-muted-foreground">seg</span>
              </div>
            </SettingRow>
            <SettingRow label="Colunas na Exiva" description="Quantidade de colunas de categorias (Main, Bomba, Maker, Outros)">
              <div className="flex gap-1">
                {[2, 3, 4].map(n => (
                  <button key={n} onClick={() => updateSetting('exivaColumns', n as 2 | 3 | 4)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      settings.exivaColumns === n ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary border-border text-muted-foreground'
                    }`}>{n} cols</button>
                ))}
              </div>
            </SettingRow>
          </SettingsSection>

          <SettingsSection title="Mortes" icon={<AlertTriangle className="h-4 w-4 text-primary" />}>
            <SettingRow label="Máx. Mortes Exibidas" description="Limite de mortes recentes na seção de mortes">
              <Input type="number" value={settings.maxDeaths} min={5} max={100}
                onChange={e => updateSetting('maxDeaths', Math.max(5, parseInt(e.target.value) || 30))}
                className="bg-secondary w-24 text-center" />
            </SettingRow>
            <SettingToggle label="Auto-buscar Mortes" description="Buscar mortes automaticamente ao carregar a página Exiva" checked={settings.autoFetchDeaths} onChange={v => updateSetting('autoFetchDeaths', v)} />
          </SettingsSection>

          <SettingsSection title="Mundo Padrão" icon={<Globe className="h-4 w-4 text-primary" />}>
            <SettingRow label="Mundo" description="Mundo padrão para filtros e buscas">
              <select value={settings.defaultWorld} onChange={e => updateSetting('defaultWorld', e.target.value)}
                className="h-9 px-3 rounded-lg bg-secondary border border-border text-foreground text-sm">
                <option value="">Nenhum</option>
                {WORLDS.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </SettingRow>
          </SettingsSection>
        </div>
      )}

      {/* ===== DASHBOARD TAB ===== */}
      {tab === 'dashboard' && (
        <div className="space-y-4">
          <SettingsSection title="Atualização" icon={<RefreshCw className="h-4 w-4 text-primary" />}>
            <SettingRow label="Refresh do Dashboard" description="Intervalo em segundos para atualizar dados do dashboard">
              <div className="flex items-center gap-2">
                <Input type="number" value={settings.dashboardRefresh} min={10}
                  onChange={e => updateSetting('dashboardRefresh', Math.max(10, parseInt(e.target.value) || 30))}
                  className="bg-secondary w-24 text-center" />
                <span className="text-xs text-muted-foreground">seg</span>
              </div>
            </SettingRow>
          </SettingsSection>

          <SettingsSection title="Histórico" icon={<Clock className="h-4 w-4 text-primary" />}>
            <SettingRow label="Limite de Logs" description="Quantidade máxima de registros carregados no histórico">
              <Input type="number" value={settings.logLimit} min={10} max={500}
                onChange={e => updateSetting('logLimit', Math.max(10, parseInt(e.target.value) || 50))}
                className="bg-secondary w-24 text-center" />
            </SettingRow>
          </SettingsSection>

          <SettingsSection title="Visual" icon={<Palette className="h-4 w-4 text-primary" />}>
            <SettingToggle label="Animações" description="Habilitar animações e transições no dashboard" checked={settings.animationsEnabled} onChange={v => updateSetting('animationsEnabled', v)} />
          </SettingsSection>
        </div>
      )}

      {/* ===== GUILDS TAB ===== */}
      {tab === 'guilds' && (
        <div className="space-y-4">
          {/* Add Guild */}
          <div className="glass-card rounded-xl p-5">
            <h3 className="font-semibold text-foreground flex items-center gap-2 mb-1">
              <Plus className="h-4 w-4 text-primary" /> Adicionar Guild
            </h3>
            <p className="text-xs text-muted-foreground mb-4">A primeira guild é usada na página Exiva</p>
            <div className="flex gap-3">
              <div className="flex-1">
                <Input value={newGuildName} onChange={e => setNewGuildName(e.target.value)} placeholder="Nome da Guild"
                  className="bg-secondary" onKeyDown={e => e.key === 'Enter' && handleAddGuild()} />
              </div>
              <select value={newGuildWorld} onChange={e => setNewGuildWorld(e.target.value)}
                className="h-10 px-3 rounded-lg bg-secondary border border-border text-foreground text-sm">
                <option value="">Auto-detectar</option>
                {WORLDS.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
              <Button onClick={handleAddGuild} disabled={loading} className="gap-2">
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Adicionar
              </Button>
            </div>
          </div>

          {/* Guild List */}
          <div className="glass-card rounded-xl p-5">
            <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
              <Globe className="h-4 w-4 text-primary" /> Guilds Monitoradas ({guilds.length})
            </h3>
            <div className="divide-y divide-border/30">
              {guilds.map((g, i) => (
                <div key={g.id} className="flex items-center py-3 gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${i === 0 ? 'bg-primary/20 border border-primary/40' : 'bg-secondary border border-border'}`}>
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{g.name}</p>
                      {i === 0 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-semibold">PRINCIPAL</span>}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-3">
                      <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {g.world}</span>
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">{timeAgo(g.lastUpdate)}</span>
                  <button onClick={() => handleRemove(g.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {guilds.length === 0 && <p className="py-6 text-center text-muted-foreground text-sm">Nenhuma guild monitorada</p>}
            </div>
          </div>
        </div>
      )}

      {/* ===== NOTIFICATIONS TAB ===== */}
      {tab === 'notificacoes' && (
        <div className="space-y-4">
          <SettingsSection title="Notificações" icon={<Bell className="h-4 w-4 text-primary" />}>
            <SettingToggle label="Notificações Toast" description="Exibir notificações no canto da tela ao pegar/devolver bonecos"
              checked={settings.toastNotifications} onChange={v => updateSetting('toastNotifications', v)} />
            <SettingToggle label="Notificações Sonoras" description="Emitir som ao receber notificações de repasse"
              checked={settings.soundNotifications} onChange={v => updateSetting('soundNotifications', v)} />
          </SettingsSection>
        </div>
      )}

      {/* ===== PERFIL TAB ===== */}
      {tab === 'perfil' && (
        <div className="space-y-4">
          <SettingsSection title="Informações do Perfil" icon={<User className="h-4 w-4 text-primary" />}>
            <div className="space-y-4 p-1">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Nome de Usuário</label>
                <div className="flex gap-2 max-w-md">
                  <Input value={profile.username} onChange={e => setProfile({ ...profile, username: e.target.value })} className="bg-secondary" />
                  <Button onClick={handleUpdateProfile} className="gap-2 shrink-0"><Save className="h-4 w-4" /> Salvar</Button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
                <Input value={profile.email} disabled className="bg-secondary max-w-md opacity-60" />
                <p className="text-[11px] text-muted-foreground mt-1">O email não pode ser alterado</p>
              </div>
            </div>
          </SettingsSection>

          <SettingsSection title="Alterar Senha" icon={<Key className="h-4 w-4 text-primary" />}>
            <div className="space-y-3 max-w-md p-1">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Nova Senha</label>
                <Input type="password" value={passwords.new1} onChange={e => setPasswords({ ...passwords, new1: e.target.value })} placeholder="Mínimo 6 caracteres" className="bg-secondary" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Confirmar</label>
                <Input type="password" value={passwords.new2} onChange={e => setPasswords({ ...passwords, new2: e.target.value })} placeholder="Repita a senha" className="bg-secondary" />
              </div>
              <Button onClick={handleChangePassword} disabled={changingPassword} className="gap-2">
                {changingPassword ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />} Alterar Senha
              </Button>
            </div>
          </SettingsSection>

          <SettingsSection title="Sessão" icon={<LogOut className="h-4 w-4 text-destructive" />}>
            <div className="p-1">
              <p className="text-sm text-muted-foreground mb-3">Encerrar a sessão atual e voltar à tela de login</p>
              <Button variant="outline" onClick={signOut} className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10">
                <LogOut className="h-4 w-4" /> Sair da Conta
              </Button>
            </div>
          </SettingsSection>
        </div>
      )}

      {/* ===== SISTEMA TAB ===== */}
      {tab === 'sistema' && (
        <div className="space-y-4">
          <SettingsSection title="Informações do Sistema" icon={<Database className="h-4 w-4 text-primary" />}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-1">
              <InfoBox label="Versão" value="2.0.0" />
              <InfoBox label="Auto-refresh" value={`${settings.refreshInterval}s`} highlight />
              <InfoBox label="API" value="TibiaData v4" />
              <InfoBox label="Backend" value="Cloud" highlight />
            </div>
          </SettingsSection>

          <div className="glass-card rounded-xl p-5 border-destructive/20">
            <h3 className="font-semibold text-destructive flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4" /> Zona de Perigo
            </h3>
            <p className="text-sm text-muted-foreground mb-4">Ações que podem afetar dados locais</p>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm" className="border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => {
                localStorage.removeItem('exiva_settings');
                setSettings(DEFAULT_SETTINGS);
                toast({ title: 'Configurações resetadas!', description: 'Valores padrão restaurados.' });
              }}>
                Resetar Configurações
              </Button>
              <Button variant="outline" size="sm" className="border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => {
                localStorage.clear();
                toast({ title: 'Cache limpo!', description: 'Todos os dados locais foram removidos.' });
              }}>
                Limpar Todo Cache
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Save Bar */}
      <AnimatePresence>
        {hasChanges && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <div className="glass-card rounded-xl px-6 py-3 flex items-center gap-4 shadow-2xl border-primary/20">
              <span className="text-sm text-foreground font-medium">Alterações não salvas</span>
              <Button size="sm" variant="ghost" onClick={() => { setSettings(loadSettings()); setHasChanges(false); }}>Descartar</Button>
              <Button size="sm" onClick={handleSaveSettings} className="gap-2"><Save className="h-3.5 w-3.5" /> Salvar</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Reusable Components ---

function SettingsSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-border/30 flex items-center gap-2">
        {icon}
        <h3 className="font-semibold text-foreground text-sm">{title}</h3>
      </div>
      <div className="p-4 space-y-1">{children}</div>
    </div>
  );
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 px-1 rounded-lg hover:bg-secondary/30 transition-colors">
      <div className="flex-1 min-w-0 mr-4">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function SettingToggle({ label, description, checked, onChange }: { label: string; description?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <SettingRow label={label} description={description}>
      <Switch checked={checked} onCheckedChange={onChange} />
    </SettingRow>
  );
}

function InfoBox({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="p-3 rounded-lg bg-secondary/50">
      <p className="text-muted-foreground text-[10px] uppercase tracking-wider">{label}</p>
      <p className={`font-mono font-semibold text-sm ${highlight ? 'text-primary' : 'text-foreground'}`}>{value}</p>
    </div>
  );
}
