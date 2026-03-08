import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Globe, Users, Trash2, RefreshCw, Search, Settings, User, Shield, Save, LogOut, Mail, Key, Clock, Zap, Palette, Bell, Database, Monitor, Eye, EyeOff, ChevronDown, ChevronUp, AlertTriangle, Check, Volume2, VolumeX, Sun, Moon, Layout, Columns, List, Grid3X3, Paintbrush, Image, X, RotateCcw } from 'lucide-react';
import { ALL_SPRITES, ICON_SLOTS, DEFAULT_ICON_MAP, TibiaSprite, getIconPath } from '@/components/TibiaIcons';
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

type Tab = 'guilds' | 'bonecos' | 'exiva' | 'dashboard' | 'notificacoes' | 'perfil' | 'sistema' | 'visual';

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
    applyTheme(settings.theme);
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
    { id: 'visual', label: 'Visual', icon: Paintbrush },
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
          <div className="w-1 h-8 rounded-full bg-primary" />
          <div>
            <h1 className="text-lg font-display font-bold text-foreground tracking-wide">SETTINGS</h1>
            <div className="text-[10px] text-muted-foreground font-mono">Configuração do sistema</div>
          </div>
        </div>
        {hasChanges && (
          <Button onClick={handleSaveSettings} size="sm" className="gap-1.5 text-xs">
            <Save className="h-3.5 w-3.5" /> Salvar
          </Button>
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

      {/* ===== VISUAL TAB ===== */}
      {tab === 'visual' && (
        <div className="space-y-4">
          <SettingsSection title="Tema de Cores" icon={<Palette className="h-4 w-4 text-primary" />}>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-1">
              {(Object.entries(THEME_PRESETS) as [ThemePreset, typeof THEME_PRESETS[ThemePreset]][]).map(([key, preset]) => (
                <button key={key} onClick={() => updateSetting('theme', key)}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    settings.theme === key 
                      ? 'border-primary bg-primary/10 shadow-lg' 
                      : 'border-border/50 bg-secondary/30 hover:border-border hover:bg-secondary/60'
                  }`}>
                  <div className="w-8 h-8 rounded-full shadow-lg" style={{ backgroundColor: preset.preview, boxShadow: `0 0 16px ${preset.preview}40` }} />
                  <span className="text-xs font-semibold text-foreground">{preset.label}</span>
                  {settings.theme === key && (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-2.5 w-2.5 text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground px-1 pt-2">Salve para aplicar o novo tema.</p>
          </SettingsSection>

          <SettingsSection title="Pacote de Ícones" icon={<Image className="h-4 w-4 text-primary" />}>
            <div className="grid grid-cols-2 gap-3 p-1 max-w-md">
              {([
                { value: 'lucide' as IconPack, label: 'Lucide (Padrão)', desc: 'Ícones minimalistas e vetorizados' },
                { value: 'tibia' as IconPack, label: 'Tibia Sprites', desc: 'Sprites pixelados do jogo' },
              ]).map(opt => (
                <button key={opt.value} onClick={() => updateSetting('iconPack', opt.value)}
                  className={`flex flex-col items-start gap-1 p-4 rounded-xl border-2 transition-all text-left ${
                    settings.iconPack === opt.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border/50 bg-secondary/30 hover:border-border'
                  }`}>
                  <span className="text-sm font-semibold text-foreground">{opt.label}</span>
                  <span className="text-[11px] text-muted-foreground">{opt.desc}</span>
                  {settings.iconPack === opt.value && (
                    <div className="self-end mt-1">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </SettingsSection>

          <SettingsSection title="Personalizar Ícones" icon={<Paintbrush className="h-4 w-4 text-primary" />}>
            <p className="text-[11px] text-muted-foreground px-1 pb-2">Clique em qualquer ícone para trocar pelo sprite que preferir. Use "Reset" para voltar ao padrão.</p>
            <IconCustomizer settings={settings} onUpdate={(customIcons) => updateSetting('customIcons', customIcons)} />
          </SettingsSection>

          <SettingsSection title="Animações" icon={<Zap className="h-4 w-4 text-primary" />}>
            <SettingToggle label="Animações" description="Habilitar transições e efeitos de movimento" checked={settings.animationsEnabled} onChange={v => updateSetting('animationsEnabled', v)} />
          </SettingsSection>
        </div>
      )}

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

// --- Icon Customizer ---

function IconCustomizer({ settings, onUpdate }: { settings: AppSettings; onUpdate: (customIcons: Record<string, string>) => void }) {
  const [pickerSlot, setPickerSlot] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  const groups = ICON_SLOTS.reduce((acc, slot) => {
    if (!acc[slot.group]) acc[slot.group] = [];
    acc[slot.group].push(slot);
    return acc;
  }, {} as Record<string, typeof ICON_SLOTS>);

  const handleSelect = (slot: string, spriteKey: string) => {
    const newCustom = { ...settings.customIcons, [slot]: spriteKey };
    // If same as default, remove override
    if (DEFAULT_ICON_MAP[slot] === spriteKey) {
      delete newCustom[slot];
    }
    onUpdate(newCustom);
    setPickerSlot(null);
    setSearchFilter('');
  };

  const handleReset = (slot: string) => {
    const newCustom = { ...settings.customIcons };
    delete newCustom[slot];
    onUpdate(newCustom);
  };

  const handleResetAll = () => {
    onUpdate({});
  };

  const filteredSprites = Object.entries(ALL_SPRITES).filter(([key, sprite]) =>
    !searchFilter || sprite.label.toLowerCase().includes(searchFilter.toLowerCase()) || sprite.category.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const spriteCategories = filteredSprites.reduce((acc, [key, sprite]) => {
    if (!acc[sprite.category]) acc[sprite.category] = [];
    acc[sprite.category].push({ key, ...sprite });
    return acc;
  }, {} as Record<string, { key: string; path: string; label: string; category: string }[]>);

  return (
    <div className="space-y-4">
      <div className="flex justify-end px-1">
        <button onClick={handleResetAll} className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors">
          <RotateCcw className="h-3 w-3" /> Resetar todos
        </button>
      </div>

      {Object.entries(groups).map(([groupName, slots]) => (
        <div key={groupName}>
          <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">{groupName}</h4>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {slots.map(slot => {
              const currentKey = settings.customIcons[slot.key] || DEFAULT_ICON_MAP[slot.key];
              const isCustom = !!settings.customIcons[slot.key];
              const path = getIconPath(slot.key, settings.customIcons);
              return (
                <div key={slot.key} className="relative group">
                  <button
                    onClick={() => setPickerSlot(pickerSlot === slot.key ? null : slot.key)}
                    className={`w-full flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all hover:scale-105 ${
                      pickerSlot === slot.key
                        ? 'border-primary bg-primary/10 shadow-lg'
                        : isCustom
                          ? 'border-primary/40 bg-primary/5'
                          : 'border-border/40 bg-secondary/30 hover:border-border'
                    }`}
                  >
                    <TibiaSprite src={path} alt={slot.label} className="h-8 w-8" />
                    <span className="text-[10px] font-medium text-foreground truncate w-full text-center">{slot.label}</span>
                  </button>
                  {isCustom && (
                    <button onClick={(e) => { e.stopPropagation(); handleReset(slot.key); }}
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="h-2.5 w-2.5 text-destructive-foreground" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Sprite Picker Modal */}
      <AnimatePresence>
        {pickerSlot && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={() => { setPickerSlot(null); setSearchFilter(''); }}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[80vh] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-border/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TibiaSprite src={getIconPath(pickerSlot, settings.customIcons)} className="h-6 w-6" />
                  <h3 className="font-semibold text-foreground text-sm">
                    Escolher ícone para: <span className="text-primary">{ICON_SLOTS.find(s => s.key === pickerSlot)?.label}</span>
                  </h3>
                </div>
                <button onClick={() => { setPickerSlot(null); setSearchFilter(''); }} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-3 border-b border-border/30">
                <input
                  type="text"
                  value={searchFilter}
                  onChange={e => setSearchFilter(e.target.value)}
                  placeholder="Buscar sprite..."
                  className="w-full h-9 px-3 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  autoFocus
                />
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {Object.entries(spriteCategories).map(([cat, sprites]) => (
                  <div key={cat}>
                    <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">{cat} ({sprites.length})</h4>
                    <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-1.5">
                      {sprites.map(sprite => {
                        const currentKey = settings.customIcons[pickerSlot] || DEFAULT_ICON_MAP[pickerSlot];
                        const isActive = currentKey === sprite.key;
                        return (
                          <button
                            key={sprite.key}
                            onClick={() => handleSelect(pickerSlot, sprite.key)}
                            title={sprite.label}
                            className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all hover:scale-110 ${
                              isActive
                                ? 'border-primary bg-primary/15 shadow-md'
                                : 'border-transparent hover:border-border hover:bg-secondary/50'
                            }`}
                          >
                            <TibiaSprite src={sprite.path} alt={sprite.label} className="h-8 w-8" />
                            <span className="text-[8px] text-muted-foreground truncate w-full text-center">{sprite.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
