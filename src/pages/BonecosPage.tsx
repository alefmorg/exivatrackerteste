import { useState, useEffect } from 'react';
import { Plus, Search, Swords, Mail, Key, Globe, MapPin, User, Eye, EyeOff, Copy, Clock, Sword, Shield, Gem, Crown, ClipboardCopy, Sparkles, Heart } from 'lucide-react';
import * as OTPAuth from 'otpauth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import StatCard from '@/components/StatCard';
import StatusDot from '@/components/StatusDot';
import StatusBadge from '@/components/StatusBadge';
import TotpDisplay from '@/components/TotpDisplay';
import { VocationIcon, getVocationColor } from '@/components/TibiaIcons';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from '@/components/ui/switch';

type CharacterStatus = 'online' | 'afk' | 'offline';
type CharacterActivity = '' | 'hunt' | 'war' | 'maker' | 'boss';

interface BonecoRow {
  id: string; name: string; email: string; password: string; totp_secret: string;
  world: string; level: number; vocation: string; location: string; used_by: string;
  status: string; activity: string; observations: string; last_access: string;
  full_bless: boolean; tibia_coins: number; magic_level: number;
  fist: number; club: number; sword_skill: number; axe: number; distance: number; shielding: number;
  premium_active: boolean;
}

const ACTIVITIES: { value: CharacterActivity | ''; label: string; emoji: string }[] = [
  { value: '', label: 'Todos', emoji: '📋' },
  { value: 'hunt', label: 'Hunt', emoji: '⚔' },
  { value: 'war', label: 'War', emoji: '🔥' },
  { value: 'maker', label: 'Maker', emoji: '🔨' },
  { value: 'boss', label: 'Boss', emoji: '💀' },
];

const activityConfig: Record<string, { emoji: string; color: string }> = {
  hunt: { emoji: '⚔', color: 'bg-[hsl(var(--online)/0.12)] text-online border-[hsl(var(--online)/0.25)]' },
  war: { emoji: '🔥', color: 'bg-[hsl(var(--offline)/0.12)] text-offline border-[hsl(var(--offline)/0.25)]' },
  maker: { emoji: '🔨', color: 'bg-[hsl(var(--afk)/0.12)] text-afk border-[hsl(var(--afk)/0.25)]' },
  boss: { emoji: '💀', color: 'bg-[hsl(272_72%_47%/0.12)] text-[hsl(272_72%_60%)] border-[hsl(272_72%_47%/0.25)]' },
};

function timeAgo(dateStr: string) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'Agora';
  if (min < 60) return `${min}min`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function getVocShort(voc: string) {
  if (voc.toLowerCase().includes('knight')) return 'EK';
  if (voc.toLowerCase().includes('paladin')) return 'RP';
  if (voc.toLowerCase().includes('druid')) return 'ED';
  if (voc.toLowerCase().includes('sorcerer')) return 'MS';
  return voc.slice(0, 2).toUpperCase();
}

function getVocClass(voc: string) {
  const v = voc.toLowerCase();
  if (v.includes('knight')) return 'voc-ek';
  if (v.includes('paladin')) return 'voc-rp';
  if (v.includes('druid')) return 'voc-ed';
  if (v.includes('sorcerer')) return 'voc-ms';
  return '';
}

export default function BonecosPage() {
  const { toast } = useToast();
  const [bonecos, setBonecos] = useState<BonecoRow[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [activityFilter, setActivityFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [visibleTokens, setVisibleTokens] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '', email: '', password: '', totp_secret: '', world: '', level: 0,
    vocation: '', location: '', used_by: '', status: 'offline' as CharacterStatus,
    activity: '' as CharacterActivity, observations: '',
    full_bless: false, tibia_coins: 0, magic_level: 0,
    fist: 0, club: 0, sword_skill: 0, axe: 0, distance: 0, shielding: 0,
    premium_active: false,
  });

  const fetchBonecos = async () => {
    const { data, error } = await supabase.from('bonecos').select('*').order('created_at', { ascending: false });
    if (!error && data) setBonecos(data as unknown as BonecoRow[]);
    setLoading(false);
  };

  useEffect(() => { fetchBonecos(); }, []);

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
    setForm({ name: '', email: '', password: '', totp_secret: '', world: '', level: 0, vocation: '', location: '', used_by: '', status: 'offline', activity: '', observations: '', full_bless: false, tibia_coins: 0, magic_level: 0, fist: 0, club: 0, sword_skill: 0, axe: 0, distance: 0, shielding: 0, premium_active: false });
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
    });
    setEditId(b.id); setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('bonecos').delete().eq('id', id);
    toast({ title: 'Boneco removido' }); fetchBonecos();
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

  const filtered = bonecos.filter(b => {
    if (searchFilter && !b.name.toLowerCase().includes(searchFilter.toLowerCase())) return false;
    if (activityFilter && b.activity !== activityFilter) return false;
    return true;
  });

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-tibia font-bold text-primary gold-glow">⚔ Bloco de Bonecos</h1>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }} size="sm" className="gap-1.5 text-xs">
          <Plus className="h-3.5 w-3.5" /> Novo Boneco
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <StatCard icon={<Swords className="h-4 w-4" />} value={bonecos.length} label="Total" color="primary" />
        <StatCard icon={<span className="w-2.5 h-2.5 rounded-full bg-online" />} value={onlineCount} label="Online" color="online" />
        <StatCard icon={<span className="w-2.5 h-2.5 rounded-full bg-afk" />} value={afkCount} label="AFK" color="afk" />
        <StatCard icon={<span className="w-2.5 h-2.5 rounded-full bg-offline" />} value={offlineCount} label="Offline" color="offline" />
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-5">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input value={searchFilter} onChange={e => setSearchFilter(e.target.value)} placeholder="Buscar boneco..." className="pl-9 h-9 text-sm bg-secondary border-border" />
        </div>
        <div className="flex gap-0.5 bg-secondary rounded-lg p-0.5 border border-border">
          {ACTIVITIES.map(a => (
            <button key={a.value} onClick={() => setActivityFilter(activityFilter === a.value ? '' : a.value)}
              className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${activityFilter === a.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              {a.emoji} {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[hsl(220_8%_8%/0.85)] backdrop-blur-sm" onClick={() => resetForm()}>
          <div className="w-full max-w-2xl bg-card border border-border rounded-lg p-5 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-tibia font-bold text-primary mb-4">{editId ? '✏ Editar' : '⚔ Novo'} Boneco</h2>

            <div className="section-header mb-2">Informações Básicas</div>
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              <Input placeholder="Nome do Char" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="bg-secondary h-9 text-sm" />
              <select value={form.vocation} onChange={e => setForm({...form, vocation: e.target.value})} className="px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm h-9">
                <option value="">Vocação</option>
                <option value="Elite Knight">Elite Knight</option>
                <option value="Royal Paladin">Royal Paladin</option>
                <option value="Elder Druid">Elder Druid</option>
                <option value="Master Sorcerer">Master Sorcerer</option>
              </select>
              <Input placeholder="Mundo" value={form.world} onChange={e => setForm({...form, world: e.target.value})} className="bg-secondary h-9 text-sm" />
              <Input placeholder="Level" type="number" value={form.level || ''} onChange={e => setForm({...form, level: parseInt(e.target.value) || 0})} className="bg-secondary h-9 text-sm" />
              <Input placeholder="Localização" value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="bg-secondary h-9 text-sm" />
              <Input placeholder="Em uso por" value={form.used_by} onChange={e => setForm({...form, used_by: e.target.value})} className="bg-secondary h-9 text-sm" />
            </div>

            <div className="section-header mb-2">Credenciais</div>
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              <Input placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="bg-secondary h-9 text-sm" />
              <Input placeholder="Senha" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="bg-secondary h-9 text-sm" />
              <Input placeholder="Chave 2FA (Base32)" value={form.totp_secret} onChange={e => setForm({...form, totp_secret: e.target.value.toUpperCase().replace(/[^A-Z2-7=]/g, '')})} className="col-span-2 bg-secondary h-9 text-sm font-mono" />
            </div>

            <div className="section-header mb-2">Skills</div>
            <div className="grid grid-cols-4 gap-2.5 mb-4">
              {[
                { key: 'magic_level', label: 'Magic Lv' },
                { key: 'fist', label: 'Fist' },
                { key: 'club', label: 'Club' },
                { key: 'sword_skill', label: 'Sword' },
                { key: 'axe', label: 'Axe' },
                { key: 'distance', label: 'Distance' },
                { key: 'shielding', label: 'Shielding' },
              ].map(s => (
                <div key={s.key}>
                  <label className="text-[10px] text-muted-foreground mb-0.5 block">{s.label}</label>
                  <Input type="number" value={(form as any)[s.key] || ''} onChange={e => setForm({...form, [s.key]: parseInt(e.target.value) || 0})} className="bg-secondary h-8 text-sm" />
                </div>
              ))}
            </div>

            <div className="section-header mb-2">Status & Extras</div>
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value as CharacterStatus})} className="px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm h-9">
                <option value="online">Online</option>
                <option value="afk">AFK</option>
                <option value="offline">Offline</option>
              </select>
              <select value={form.activity} onChange={e => setForm({...form, activity: e.target.value as CharacterActivity})} className="px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm h-9">
                <option value="">Sem atividade</option>
                <option value="hunt">Hunt</option>
                <option value="war">War</option>
                <option value="maker">Maker</option>
                <option value="boss">Boss</option>
              </select>
              <div>
                <label className="text-[10px] text-muted-foreground mb-0.5 block">Tibia Coins</label>
                <Input type="number" value={form.tibia_coins || ''} onChange={e => setForm({...form, tibia_coins: parseInt(e.target.value) || 0})} className="bg-secondary h-8 text-sm" />
              </div>
              <div className="flex items-center gap-5 py-2">
                <label className="flex items-center gap-1.5 text-sm text-foreground cursor-pointer">
                  <Switch checked={form.full_bless} onCheckedChange={v => setForm({...form, full_bless: v})} />
                  <Heart className="h-3 w-3 text-[hsl(var(--offline))]" /> Bless
                </label>
                <label className="flex items-center gap-1.5 text-sm text-foreground cursor-pointer">
                  <Switch checked={form.premium_active} onCheckedChange={v => setForm({...form, premium_active: v})} />
                  <Crown className="h-3 w-3 text-primary" /> Premy
                </label>
              </div>
            </div>

            <Input placeholder="Observações" value={form.observations} onChange={e => setForm({...form, observations: e.target.value})} className="bg-secondary h-9 text-sm mb-4" />

            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={resetForm}>Cancelar</Button>
              <Button size="sm" onClick={handleSubmit}>{editId ? 'Salvar' : 'Adicionar'}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filtered.map(b => (
          <div key={b.id} className={`tibia-card border-l-[3px] ${getVocClass(b.vocation)} p-4`}>
            {/* Header row */}
            <div className="flex items-start gap-3 mb-3">
              <div className={`w-9 h-9 rounded flex items-center justify-center shrink-0 bg-secondary ${getVocationColor(b.vocation)}`}>
                <VocationIcon vocation={b.vocation} className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground text-sm truncate">{b.name}</span>
                  <span className="skill-badge-value text-[10px]">{getVocShort(b.vocation)}</span>
                  <span className="text-xs text-muted-foreground font-mono">Lv.{b.level}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                  <Globe className="h-3 w-3" />{b.world || '—'}
                  <span className="opacity-30">•</span>
                  <MapPin className="h-3 w-3" />{b.location || '—'}
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <StatusDot status={b.status as any} />
                <StatusBadge status={b.status as any} />
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-1.5 mb-3">
              {b.activity && (
                <span className={`tag-pill ${activityConfig[b.activity]?.color || ''}`}>
                  {activityConfig[b.activity]?.emoji} {b.activity.charAt(0).toUpperCase() + b.activity.slice(1)}
                </span>
              )}
              {b.full_bless && (
                <span className="tag-pill bg-[hsl(var(--offline)/0.1)] text-offline border-[hsl(var(--offline)/0.2)]">
                  <Heart className="h-3 w-3" /> Full Bless
                </span>
              )}
              {b.premium_active && (
                <span className="tag-pill bg-[hsl(var(--primary)/0.1)] text-primary border-[hsl(var(--primary)/0.2)]">
                  <Crown className="h-3 w-3" /> Premium
                </span>
              )}
              {b.tibia_coins > 0 && (
                <span className="tag-pill bg-[hsl(var(--primary)/0.08)] text-primary border-[hsl(var(--primary)/0.15)]">
                  <Gem className="h-3 w-3" /> {b.tibia_coins} TC
                </span>
              )}
            </div>

            {/* Skills row - ExevoPan inspired */}
            {(b.magic_level > 0 || b.sword_skill > 0 || b.axe > 0 || b.distance > 0 || b.shielding > 0) && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {b.magic_level > 0 && (
                  <div className="skill-badge"><Sparkles className="h-3 w-3 text-[hsl(var(--voc-ms))]" /><span className="text-muted-foreground">ML</span><span className="skill-badge-value">{b.magic_level}</span></div>
                )}
                {b.sword_skill > 0 && (
                  <div className="skill-badge"><Sword className="h-3 w-3 text-[hsl(var(--voc-ek))]" /><span className="text-muted-foreground">Sword</span><span className="skill-badge-value">{b.sword_skill}</span></div>
                )}
                {b.axe > 0 && (
                  <div className="skill-badge"><span className="text-muted-foreground">🪓 Axe</span><span className="skill-badge-value">{b.axe}</span></div>
                )}
                {b.club > 0 && (
                  <div className="skill-badge"><span className="text-muted-foreground">🔨 Club</span><span className="skill-badge-value">{b.club}</span></div>
                )}
                {b.distance > 0 && (
                  <div className="skill-badge"><span className="text-muted-foreground">🎯 Dist</span><span className="skill-badge-value">{b.distance}</span></div>
                )}
                {b.shielding > 0 && (
                  <div className="skill-badge"><Shield className="h-3 w-3 text-muted-foreground" /><span className="text-muted-foreground">Shld</span><span className="skill-badge-value">{b.shielding}</span></div>
                )}
              </div>
            )}

            {/* Credentials section */}
            <div className="bg-secondary/60 rounded p-2.5 mb-3 space-y-1.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Credenciais</span>
                <button onClick={() => copyAllCredentials(b)} className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 font-medium transition-colors">
                  <ClipboardCopy className="h-3 w-3" /> Copiar Tudo
                </button>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Mail className="h-3 w-3 shrink-0" />
                <span className="font-mono flex-1 truncate text-[11px]">{b.email || '—'}</span>
                {b.email && <button onClick={() => copyToClipboard(b.email)} className="hover:text-primary transition-colors"><Copy className="h-3 w-3" /></button>}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Key className="h-3 w-3 shrink-0" />
                <span className="font-mono flex-1 text-[11px]">{visiblePasswords.has(b.id) ? b.password : '••••••••'}</span>
                <button onClick={() => togglePassword(b.id)} className="hover:text-primary transition-colors">
                  {visiblePasswords.has(b.id) ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </button>
                <button onClick={() => copyToClipboard(b.password)} className="hover:text-primary transition-colors"><Copy className="h-3 w-3" /></button>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Shield className="h-3 w-3 shrink-0" />
                {visibleTokens.has(b.id) ? (
                  <div className="flex-1 flex items-center gap-2">
                    <span className="font-mono text-[11px]">{b.totp_secret}</span>
                    <TotpDisplay secret={b.totp_secret} />
                  </div>
                ) : (
                  <span className="font-mono text-[11px] flex-1">••••••••••••</span>
                )}
                <button onClick={() => toggleToken(b.id)} className="hover:text-primary transition-colors">
                  {visibleTokens.has(b.id) ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </button>
                <button onClick={() => copyToClipboard(b.totp_secret)} className="hover:text-primary transition-colors"><Copy className="h-3 w-3" /></button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <div className="flex items-center gap-3">
                {b.used_by && <span className="flex items-center gap-1"><User className="h-3 w-3" /> <span className="text-primary font-medium">{b.used_by}</span></span>}
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {timeAgo(b.last_access)}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleEdit(b)} className="text-primary hover:underline font-medium">Editar</button>
                <button onClick={() => handleDelete(b.id)} className="text-offline hover:underline">Excluir</button>
              </div>
            </div>

            {b.observations && (
              <p className="text-[11px] text-muted-foreground mt-2 italic opacity-70">💬 {b.observations}</p>
            )}
          </div>
        ))}
      </div>

      {bonecos.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Swords className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="font-tibia text-primary/60">Nenhum boneco cadastrado</p>
          <p className="text-xs mt-1">Clique em "Novo Boneco" para começar</p>
        </div>
      )}
    </div>
  );
}
