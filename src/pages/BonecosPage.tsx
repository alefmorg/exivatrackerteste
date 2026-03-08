import { useState, useEffect } from 'react';
import { Plus, Search, Swords, Mail, Key, Globe, MapPin, User, Eye, EyeOff, Copy, Clock, Sword, Shield, Gem, Crown, Star, ClipboardCopy, Sparkles, Heart, X, Tag, ArrowRightLeft, LogIn, LogOut, Filter } from 'lucide-react';
import * as OTPAuth from 'otpauth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import StatCard from '@/components/StatCard';
import StatusDot from '@/components/StatusDot';
import StatusBadge from '@/components/StatusBadge';
import TotpDisplay from '@/components/TotpDisplay';
import { VocationIcon, getVocationColor } from '@/components/TibiaIcons';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from '@/components/ui/switch';
import { useSettings } from '@/hooks/useSettings';

type CharacterStatus = 'online' | 'afk' | 'offline';
type CharacterActivity = '' | 'hunt' | 'war' | 'maker' | 'boss';

interface BonecoRow {
  id: string; name: string; email: string; password: string; totp_secret: string;
  world: string; level: number; vocation: string; location: string; used_by: string;
  status: string; activity: string; observations: string; last_access: string;
  full_bless: boolean; tibia_coins: number; magic_level: number;
  fist: number; club: number; sword_skill: number; axe: number; distance: number; shielding: number;
  premium_active: boolean;
  acessos: string[]; quests: string[];
}

const ACTIVITIES: { value: CharacterActivity | ''; label: string; emoji: string }[] = [
  { value: '', label: 'Todos', emoji: '📋' },
  { value: 'hunt', label: 'Hunt', emoji: '⚔' },
  { value: 'war', label: 'War', emoji: '🔥' },
  { value: 'maker', label: 'Maker', emoji: '🔨' },
  { value: 'boss', label: 'Boss', emoji: '💀' },
];

const VOCATIONS = ['', 'Elite Knight', 'Royal Paladin', 'Elder Druid', 'Master Sorcerer'];
const STATUSES: CharacterStatus[] = ['online', 'afk', 'offline'];

const activityConfig: Record<string, { emoji: string; color: string }> = {
  hunt: { emoji: '⚔', color: 'bg-primary/15 text-primary border-primary/30' },
  war: { emoji: '🔥', color: 'bg-offline/15 text-offline border-offline/30' },
  maker: { emoji: '🔨', color: 'bg-afk/15 text-afk border-afk/30' },
  boss: { emoji: '💀', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
};

function timeAgo(dateStr: string) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'Agora';
  if (min < 60) return `${min} min`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours}h atrás`;
  return `${Math.floor(hours / 24)}d atrás`;
}

function getVocShort(voc: string) {
  if (voc.toLowerCase().includes('knight')) return 'EK';
  if (voc.toLowerCase().includes('paladin')) return 'RP';
  if (voc.toLowerCase().includes('druid')) return 'ED';
  if (voc.toLowerCase().includes('sorcerer')) return 'MS';
  return voc.slice(0, 2).toUpperCase();
}

function getVocBorderColor(voc: string) {
  const v = voc.toLowerCase();
  if (v.includes('knight')) return 'border-l-red-500';
  if (v.includes('paladin')) return 'border-l-yellow-500';
  if (v.includes('druid')) return 'border-l-emerald-500';
  if (v.includes('sorcerer')) return 'border-l-blue-500';
  return 'border-l-primary';
}

export default function BonecosPage() {
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const settings = useSettings();
  const [bonecos, setBonecos] = useState<BonecoRow[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [activityFilter, setActivityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [vocationFilter, setVocationFilter] = useState('');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [visibleTokens, setVisibleTokens] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [claimNotes, setClaimNotes] = useState('');
  const [showClaimModal, setShowClaimModal] = useState<{ id: string; name: string; action: 'pegar' | 'devolver' } | null>(null);
  const [newAcesso, setNewAcesso] = useState('');
  const [newQuest, setNewQuest] = useState('');
  const [username, setUsername] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', password: '', totp_secret: '', world: '', level: 0,
    vocation: '', location: '', used_by: '', status: 'offline' as CharacterStatus,
    activity: '' as CharacterActivity, observations: '',
    full_bless: false, tibia_coins: 0, magic_level: 0,
    fist: 0, club: 0, sword_skill: 0, axe: 0, distance: 0, shielding: 0,
    premium_active: false, acessos: [] as string[], quests: [] as string[],
  });

  const fetchBonecos = async () => {
    const { data, error } = await supabase.from('bonecos').select('*').order('created_at', { ascending: false });
    if (!error && data) setBonecos(data as unknown as BonecoRow[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchBonecos();
    // Fetch username for logging
    if (user) {
      supabase.from('profiles').select('username').eq('user_id', user.id).single().then(({ data }) => {
        setUsername(data?.username || user.email || '');
      });
    }
    // Realtime subscription
    const channel = supabase
      .channel('bonecos-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bonecos' }, () => {
        fetchBonecos();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast({ title: 'Nome obrigatório', variant: 'destructive' }); return; }
    const payload = {
      name: form.name, email: form.email, password: form.password, totp_secret: form.totp_secret,
      world: form.world, level: form.level, vocation: form.vocation, location: form.location,
      used_by: form.used_by, status: form.status, activity: form.activity, observations: form.observations,
      last_access: new Date().toISOString(),
      full_bless: form.full_bless, tibia_coins: form.tibia_coins, magic_level: form.magic_level,
      fist: form.fist, club: form.club, sword_skill: form.sword_skill, axe: form.axe,
      distance: form.distance, shielding: form.shielding, premium_active: form.premium_active,
      acessos: form.acessos, quests: form.quests,
    };
    if (editId) {
      const { error } = await supabase.from('bonecos').update(payload).eq('id', editId);
      if (error) { toast({ title: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Boneco atualizado' });
    } else {
      const { error } = await supabase.from('bonecos').insert(payload);
      if (error) { toast({ title: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Boneco adicionado' });
    }
    resetForm(); fetchBonecos();
  };

  const resetForm = () => {
    setForm({ name: '', email: '', password: '', totp_secret: '', world: '', level: 0, vocation: '', location: '', used_by: '', status: 'offline', activity: '', observations: '', full_bless: false, tibia_coins: 0, magic_level: 0, fist: 0, club: 0, sword_skill: 0, axe: 0, distance: 0, shielding: 0, premium_active: false, acessos: [], quests: [] });
    setNewAcesso(''); setNewQuest('');
    setShowForm(false); setEditId(null);
  };

  const handleEdit = (b: BonecoRow) => {
    setForm({
      name: b.name, email: b.email, password: b.password, totp_secret: b.totp_secret,
      world: b.world, level: b.level, vocation: b.vocation, location: b.location,
      used_by: b.used_by, status: b.status as CharacterStatus, activity: b.activity as CharacterActivity,
      observations: b.observations, full_bless: b.full_bless, tibia_coins: b.tibia_coins,
      magic_level: b.magic_level, fist: b.fist, club: b.club, sword_skill: b.sword_skill,
      axe: b.axe, distance: b.distance, shielding: b.shielding, premium_active: b.premium_active,
      acessos: b.acessos || [], quests: b.quests || [],
    });
    setEditId(b.id); setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este boneco?')) return;
    await supabase.from('bonecos').delete().eq('id', id);
    toast({ title: 'Boneco removido' }); fetchBonecos();
  };

  const handleClaim = async (boneco: BonecoRow) => {
    if (boneco.used_by) {
      // Return
      setShowClaimModal({ id: boneco.id, name: boneco.name, action: 'devolver' });
    } else {
      // Take
      setShowClaimModal({ id: boneco.id, name: boneco.name, action: 'pegar' });
    }
    setClaimNotes('');
  };

  const confirmClaim = async () => {
    if (!showClaimModal || !user) return;
    setClaimingId(showClaimModal.id);
    const isPegar = showClaimModal.action === 'pegar';
    
    // Update boneco
    const { error: updateError } = await supabase.from('bonecos').update({
      used_by: isPegar ? username : '',
      status: isPegar ? 'online' : 'offline',
      last_access: new Date().toISOString(),
    }).eq('id', showClaimModal.id);

    if (updateError) {
      toast({ title: updateError.message, variant: 'destructive' });
      setClaimingId(null);
      return;
    }

    // Log the action
    await supabase.from('boneco_logs').insert({
      boneco_id: showClaimModal.id,
      boneco_name: showClaimModal.name,
      user_id: user.id,
      username: username,
      action: showClaimModal.action,
      notes: claimNotes,
    });

    toast({
      title: isPegar ? '📥 Boneco pego!' : '📤 Boneco devolvido!',
      description: `${showClaimModal.name} ${isPegar ? 'está com você agora' : 'foi liberado'}`,
    });
    
    setClaimingId(null);
    setShowClaimModal(null);
    setClaimNotes('');
    fetchBonecos();
  };

  const togglePassword = (id: string) => {
    setVisiblePasswords(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleToken = (id: string) => {
    setVisibleTokens(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text); toast({ title: 'Copiado!' });
  };

  const copyAllCredentials = (b: BonecoRow) => {
    let totpCode = '';
    if (b.totp_secret) {
      try {
        const totp = new OTPAuth.TOTP({ secret: OTPAuth.Secret.fromBase32(b.totp_secret), digits: 6, period: 30, algorithm: 'SHA1' });
        totpCode = totp.generate();
      } catch { totpCode = 'ERRO'; }
    }
    const text = `Email: ${b.email}\nSenha: ${b.password}${totpCode ? `\n2FA: ${totpCode}` : ''}`;
    navigator.clipboard.writeText(text);
    toast({ title: '📋 Credenciais copiadas!', description: `Email, senha${totpCode ? ' e código 2FA' : ''} copiados.` });
  };

  const onlineCount = bonecos.filter(b => b.status === 'online').length;
  const afkCount = bonecos.filter(b => b.status === 'afk').length;
  const offlineCount = bonecos.filter(b => b.status === 'offline').length;
  const inUseCount = bonecos.filter(b => b.used_by).length;
  const availableCount = bonecos.filter(b => !b.used_by).length;

  const filtered = bonecos.filter(b => {
    if (searchFilter && !b.name.toLowerCase().includes(searchFilter.toLowerCase()) && !b.world.toLowerCase().includes(searchFilter.toLowerCase())) return false;
    if (activityFilter && b.activity !== activityFilter) return false;
    if (statusFilter && b.status !== statusFilter) return false;
    if (vocationFilter && b.vocation !== vocationFilter) return false;
    if (showAvailableOnly && b.used_by) return false;
    return true;
  });

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Swords className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Bloco de Bonecos</h1>
            <p className="text-xs text-muted-foreground">Gerenciamento e repasse de personagens</p>
          </div>
        </div>
        {isAdmin && (
          <Button onClick={() => { resetForm(); setShowForm(true); }} className="gap-2">
            <Plus className="h-4 w-4" /> Novo Boneco
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 my-6">
        <StatCard icon={<Swords className="h-5 w-5" />} value={bonecos.length} label="Total" color="primary" />
        <StatCard icon={<span className="w-3 h-3 rounded-full bg-online" />} value={onlineCount} label="Online" color="online" />
        <StatCard icon={<span className="w-3 h-3 rounded-full bg-afk" />} value={afkCount} label="AFK" color="afk" />
        <StatCard icon={<span className="w-3 h-3 rounded-full bg-offline" />} value={offlineCount} label="Offline" color="offline" />
        <StatCard icon={<ArrowRightLeft className="h-5 w-5" />} value={inUseCount} label="Em Uso" color="primary" />
      </div>

      {/* Filters */}
      <div className="space-y-3 mb-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={searchFilter} onChange={e => setSearchFilter(e.target.value)} placeholder="Buscar por nome ou mundo..." className="pl-9 bg-secondary border-border" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {/* Activity */}
          <div className="flex gap-1">
            {ACTIVITIES.map(a => (
              <button key={a.value} onClick={() => setActivityFilter(activityFilter === a.value ? '' : a.value)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${activityFilter === a.value ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary border-border text-muted-foreground hover:text-foreground'}`}>
                {a.emoji} {a.label}
              </button>
            ))}
          </div>
          <span className="text-border">|</span>
          {/* Status */}
          <div className="flex gap-1">
            {STATUSES.map(s => (
              <button key={s} onClick={() => setStatusFilter(statusFilter === s ? '' : s)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1 ${statusFilter === s ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary border-border text-muted-foreground hover:text-foreground'}`}>
                <StatusDot status={s} size="sm" /> {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <span className="text-border">|</span>
          {/* Vocation */}
          <select value={vocationFilter} onChange={e => setVocationFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg text-xs bg-secondary border border-border text-foreground">
            <option value="">Todas Vocs</option>
            {VOCATIONS.filter(Boolean).map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <span className="text-border">|</span>
          {/* Available only */}
          <label className="flex items-center gap-1.5 cursor-pointer text-xs text-muted-foreground">
            <Switch checked={showAvailableOnly} onCheckedChange={setShowAvailableOnly} />
            Disponíveis ({availableCount})
          </label>
        </div>
      </div>

      {/* Claim Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setShowClaimModal(null)}>
          <div className="w-full max-w-sm bg-card border border-border rounded-xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
              {showClaimModal.action === 'pegar' ? <LogIn className="h-5 w-5 text-primary" /> : <LogOut className="h-5 w-5 text-afk" />}
              {showClaimModal.action === 'pegar' ? 'Pegar' : 'Devolver'} Boneco
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              {showClaimModal.action === 'pegar' ? 'Você vai pegar' : 'Você vai devolver'} <strong className="text-primary">{showClaimModal.name}</strong>
            </p>
            <Input
              placeholder="Notas (opcional) — ex: vai huntar em Roshamuul"
              value={claimNotes}
              onChange={e => setClaimNotes(e.target.value)}
              className="bg-secondary mb-4"
              onKeyDown={e => e.key === 'Enter' && confirmClaim()}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setShowClaimModal(null)}>Cancelar</Button>
              <Button onClick={confirmClaim} disabled={claimingId === showClaimModal.id}
                className={showClaimModal.action === 'pegar' ? '' : 'bg-afk hover:bg-afk/90 text-afk-foreground'}>
                {claimingId === showClaimModal.id ? 'Processando...' : showClaimModal.action === 'pegar' ? '📥 Pegar' : '📤 Devolver'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => resetForm()}>
          <div className="w-full max-w-2xl bg-card border border-border rounded-xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
              <Sword className="h-5 w-5" />
              {editId ? 'Editar' : 'Novo'} Boneco
            </h2>

            {/* Basic Info */}
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-semibold">Informações Básicas</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Input placeholder="Nome do Char" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="bg-secondary" />
              <select value={form.vocation} onChange={e => setForm({...form, vocation: e.target.value})} className="px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm">
                <option value="">Vocação</option>
                <option value="Elite Knight">Elite Knight</option>
                <option value="Royal Paladin">Royal Paladin</option>
                <option value="Elder Druid">Elder Druid</option>
                <option value="Master Sorcerer">Master Sorcerer</option>
              </select>
              <Input placeholder="Mundo" value={form.world} onChange={e => setForm({...form, world: e.target.value})} className="bg-secondary" />
              <Input placeholder="Level" type="number" value={form.level || ''} onChange={e => setForm({...form, level: parseInt(e.target.value) || 0})} className="bg-secondary" />
              <Input placeholder="Localização" value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="bg-secondary" />
              <Input placeholder="Em uso por" value={form.used_by} onChange={e => setForm({...form, used_by: e.target.value})} className="bg-secondary" />
            </div>

            {/* Credentials */}
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-semibold">Credenciais</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Input placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="bg-secondary" />
              <Input placeholder="Senha" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="bg-secondary" />
              <Input placeholder="Chave 2FA (Base32)" value={form.totp_secret} onChange={e => setForm({...form, totp_secret: e.target.value.toUpperCase().replace(/[^A-Z2-7=]/g, '')})} className="col-span-2 bg-secondary font-mono text-xs" />
            </div>

            {/* Skills */}
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-semibold">Skills</p>
            <div className="grid grid-cols-4 gap-3 mb-4">
              <div><label className="text-[10px] text-muted-foreground">Magic Level</label><Input type="number" value={form.magic_level || ''} onChange={e => setForm({...form, magic_level: parseInt(e.target.value) || 0})} className="bg-secondary" /></div>
              <div><label className="text-[10px] text-muted-foreground">Fist</label><Input type="number" value={form.fist || ''} onChange={e => setForm({...form, fist: parseInt(e.target.value) || 0})} className="bg-secondary" /></div>
              <div><label className="text-[10px] text-muted-foreground">Club</label><Input type="number" value={form.club || ''} onChange={e => setForm({...form, club: parseInt(e.target.value) || 0})} className="bg-secondary" /></div>
              <div><label className="text-[10px] text-muted-foreground">Sword</label><Input type="number" value={form.sword_skill || ''} onChange={e => setForm({...form, sword_skill: parseInt(e.target.value) || 0})} className="bg-secondary" /></div>
              <div><label className="text-[10px] text-muted-foreground">Axe</label><Input type="number" value={form.axe || ''} onChange={e => setForm({...form, axe: parseInt(e.target.value) || 0})} className="bg-secondary" /></div>
              <div><label className="text-[10px] text-muted-foreground">Distance</label><Input type="number" value={form.distance || ''} onChange={e => setForm({...form, distance: parseInt(e.target.value) || 0})} className="bg-secondary" /></div>
              <div><label className="text-[10px] text-muted-foreground">Shielding</label><Input type="number" value={form.shielding || ''} onChange={e => setForm({...form, shielding: parseInt(e.target.value) || 0})} className="bg-secondary" /></div>
            </div>

            {/* Status & Extras */}
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-semibold">Status & Extras</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value as CharacterStatus})} className="px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm">
                <option value="online">Online</option>
                <option value="afk">AFK</option>
                <option value="offline">Offline</option>
              </select>
              <select value={form.activity} onChange={e => setForm({...form, activity: e.target.value as CharacterActivity})} className="px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm">
                <option value="">Sem atividade</option>
                <option value="hunt">Hunt</option>
                <option value="war">War</option>
                <option value="maker">Maker</option>
                <option value="boss">Boss</option>
              </select>
              <div>
                <label className="text-[10px] text-muted-foreground">Tibia Coins</label>
                <Input type="number" value={form.tibia_coins || ''} onChange={e => setForm({...form, tibia_coins: parseInt(e.target.value) || 0})} className="bg-secondary" />
              </div>
              <div className="flex items-center gap-6 py-2">
                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <Switch checked={form.full_bless} onCheckedChange={v => setForm({...form, full_bless: v})} />
                  <Heart className="h-3.5 w-3.5 text-red-400" /> Full Bless
                </label>
                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <Switch checked={form.premium_active} onCheckedChange={v => setForm({...form, premium_active: v})} />
                  <Crown className="h-3.5 w-3.5 text-yellow-400" /> Premium
                </label>
              </div>
            </div>

            <Input placeholder="Observações" value={form.observations} onChange={e => setForm({...form, observations: e.target.value})} className="bg-secondary mb-4" />

            {/* Acessos Tags */}
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-semibold">Acessos</p>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.acessos.map((a, i) => (
                <span key={i} className="px-2 py-0.5 rounded border text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border-emerald-500/30 flex items-center gap-1">
                  {a}
                  <button type="button" onClick={() => setForm({...form, acessos: form.acessos.filter((_, j) => j !== i)})}><X className="h-3 w-3" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 mb-4">
              <Input placeholder="Ex: Inqui, POI, Banuta..." value={newAcesso} onChange={e => setNewAcesso(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && newAcesso.trim()) { e.preventDefault(); setForm({...form, acessos: [...form.acessos, newAcesso.trim()]}); setNewAcesso(''); }}}
                className="bg-secondary flex-1" />
              <Button type="button" variant="outline" size="sm" onClick={() => { if (newAcesso.trim()) { setForm({...form, acessos: [...form.acessos, newAcesso.trim()]}); setNewAcesso(''); }}}>
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Quests Tags */}
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-semibold">Quests Completas</p>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.quests.map((q, i) => (
                <span key={i} className="px-2 py-0.5 rounded border text-[11px] font-medium bg-blue-500/10 text-blue-400 border-blue-500/30 flex items-center gap-1">
                  {q}
                  <button type="button" onClick={() => setForm({...form, quests: form.quests.filter((_, j) => j !== i)})}><X className="h-3 w-3" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 mb-4">
              <Input placeholder="Ex: Outfit Quest, Warzones..." value={newQuest} onChange={e => setNewQuest(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && newQuest.trim()) { e.preventDefault(); setForm({...form, quests: [...form.quests, newQuest.trim()]}); setNewQuest(''); }}}
                className="bg-secondary flex-1" />
              <Button type="button" variant="outline" size="sm" onClick={() => { if (newQuest.trim()) { setForm({...form, quests: [...form.quests, newQuest.trim()]}); setNewQuest(''); }}}>
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={resetForm}>Cancelar</Button>
              <Button onClick={handleSubmit}>{editId ? 'Salvar' : 'Adicionar'}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map(b => (
          <div key={b.id} className={`rounded-xl border border-border border-l-4 ${getVocBorderColor(b.vocation)} bg-card p-5 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5`}>
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center ${getVocationColor(b.vocation)}`}>
                <VocationIcon vocation={b.vocation} className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground truncate">{b.name}</span>
                  <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">{getVocShort(b.vocation)}</span>
                  <span className="text-xs text-muted-foreground font-mono">Lv.{b.level}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <Globe className="h-3 w-3" /> {b.world || '—'}
                  <span className="text-border">•</span>
                  <MapPin className="h-3 w-3" /> {b.location || '—'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusDot status={b.status as any} />
                <StatusBadge status={b.status as any} />
              </div>
            </div>

            {/* Tags row */}
            <div className="flex flex-wrap items-center gap-1.5 mb-3">
              {b.activity && (
                <span className={`px-2 py-0.5 rounded border text-[11px] font-medium ${activityConfig[b.activity]?.color || ''}`}>
                  {activityConfig[b.activity]?.emoji} {b.activity.charAt(0).toUpperCase() + b.activity.slice(1)}
                </span>
              )}
              {b.full_bless && (
                <span className="px-2 py-0.5 rounded border text-[11px] font-medium bg-red-500/10 text-red-400 border-red-500/30 flex items-center gap-1">
                  <Heart className="h-3 w-3" /> Full Bless
                </span>
              )}
              {b.premium_active && (
                <span className="px-2 py-0.5 rounded border text-[11px] font-medium bg-yellow-500/10 text-yellow-400 border-yellow-500/30 flex items-center gap-1">
                  <Crown className="h-3 w-3" /> Premium
                </span>
              )}
              {b.tibia_coins > 0 && (
                <span className="px-2 py-0.5 rounded border text-[11px] font-medium bg-amber-500/10 text-amber-400 border-amber-500/30 flex items-center gap-1">
                  <Gem className="h-3 w-3" /> {b.tibia_coins} TC
                </span>
              )}
              {b.magic_level > 0 && (
                <span className="px-2 py-0.5 rounded border text-[11px] font-medium bg-blue-500/10 text-blue-400 border-blue-500/30 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> ML {b.magic_level}
                </span>
              )}
              {b.used_by && (
                <span className="px-2 py-0.5 rounded border text-[11px] font-medium bg-primary/15 text-primary border-primary/30 flex items-center gap-1">
                  <User className="h-3 w-3" /> {b.used_by}
                </span>
              )}
            </div>

            {/* Acessos & Quests */}
            {((b.acessos && b.acessos.length > 0) || (b.quests && b.quests.length > 0)) && (
              <div className="flex flex-wrap items-center gap-1.5 mb-3">
                {b.acessos?.map((a, i) => (
                  <span key={`a-${i}`} className="px-2 py-0.5 rounded border text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border-emerald-500/30">🔑 {a}</span>
                ))}
                {b.quests?.map((q, i) => (
                  <span key={`q-${i}`} className="px-2 py-0.5 rounded border text-[11px] font-medium bg-blue-500/10 text-blue-400 border-blue-500/30">📜 {q}</span>
                ))}
              </div>
            )}

            {/* Credentials */}
            <div className="space-y-1.5 text-sm bg-secondary/50 rounded-lg p-3 mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Credenciais</span>
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5 text-primary hover:text-primary" onClick={() => copyAllCredentials(b)}>
                  <ClipboardCopy className="h-3.5 w-3.5" /> Copiar Tudo
                </Button>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="font-mono text-xs flex-1 truncate">{b.email || '—'}</span>
                {b.email && <button onClick={() => copyToClipboard(b.email)} className="text-muted-foreground hover:text-primary"><Copy className="h-3.5 w-3.5" /></button>}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Key className="h-3.5 w-3.5 shrink-0" />
                <span className="font-mono text-xs flex-1">{visiblePasswords.has(b.id) ? b.password : '••••••••'}</span>
                <button onClick={() => togglePassword(b.id)} className="text-muted-foreground hover:text-primary">
                  {visiblePasswords.has(b.id) ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
                <button onClick={() => copyToClipboard(b.password)} className="text-muted-foreground hover:text-primary"><Copy className="h-3.5 w-3.5" /></button>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Shield className="h-3.5 w-3.5 shrink-0" />
                {visibleTokens.has(b.id) ? (
                  <div className="flex-1 flex items-center gap-2">
                    <span className="font-mono text-xs">{b.totp_secret}</span>
                    <TotpDisplay secret={b.totp_secret} />
                  </div>
                ) : (
                  <span className="font-mono text-xs flex-1">••••••••••••</span>
                )}
                <button onClick={() => toggleToken(b.id)} className="text-muted-foreground hover:text-primary">
                  {visibleTokens.has(b.id) ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
                <button onClick={() => copyToClipboard(b.totp_secret)} className="text-muted-foreground hover:text-primary"><Copy className="h-3.5 w-3.5" /></button>
              </div>
            </div>

            {/* Skills bar */}
            {(b.magic_level > 0 || b.sword_skill > 0 || b.axe > 0 || b.distance > 0 || b.shielding > 0) && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-muted-foreground mb-3 px-1">
                {b.sword_skill > 0 && <span>⚔ Sword: {b.sword_skill}</span>}
                {b.axe > 0 && <span>🪓 Axe: {b.axe}</span>}
                {b.club > 0 && <span>🔨 Club: {b.club}</span>}
                {b.distance > 0 && <span>🎯 Dist: {b.distance}</span>}
                {b.shielding > 0 && <span>🛡 Shield: {b.shielding}</span>}
                {b.fist > 0 && <span>👊 Fist: {b.fist}</span>}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-border text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {timeAgo(b.last_access)}</span>
              </div>
              <div className="flex items-center gap-2">
                {/* Claim/Return button - available to all users */}
                <Button
                  variant={b.used_by ? 'outline' : 'default'}
                  size="sm"
                  className={`h-7 text-xs gap-1 ${b.used_by ? 'border-afk/30 text-afk hover:bg-afk/10' : ''}`}
                  onClick={() => handleClaim(b)}
                >
                  {b.used_by ? <><LogOut className="h-3 w-3" /> Devolver</> : <><LogIn className="h-3 w-3" /> Pegar</>}
                </Button>
                {isAdmin && (
                  <>
                    <button onClick={() => handleEdit(b)} className="text-primary hover:underline font-medium">Editar</button>
                    <button onClick={() => handleDelete(b.id)} className="text-offline hover:underline">Excluir</button>
                  </>
                )}
              </div>
            </div>

            {b.observations && (
              <p className="text-[11px] text-muted-foreground mt-2 italic">💬 {b.observations}</p>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Swords className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Nenhum boneco encontrado</p>
          {bonecos.length > 0 && <p className="text-sm mt-1">Tente ajustar os filtros</p>}
        </div>
      )}
    </div>
  );
}
