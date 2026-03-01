import { useState, useEffect } from 'react';
import { Plus, Search, Swords, Mail, Key, Globe, MapPin, User, Eye, EyeOff, Copy, Clock, Sword, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import TotpDisplay from '@/components/TotpDisplay';
import { VocationIcon, getVocationColor } from '@/components/TibiaIcons';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type CharacterStatus = 'online' | 'afk' | 'offline';
type CharacterActivity = '' | 'hunt' | 'war' | 'maker' | 'boss';

interface BonecoRow {
  id: string;
  name: string;
  email: string;
  password: string;
  totp_secret: string;
  world: string;
  level: number;
  vocation: string;
  location: string;
  used_by: string;
  status: string;
  activity: string;
  observations: string;
  last_access: string;
}

const ACTIVITIES: { value: CharacterActivity | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'hunt', label: '⚔ Hunt' },
  { value: 'war', label: '🔥 War' },
  { value: 'maker', label: '🔨 Maker' },
  { value: 'boss', label: '💀 Boss' },
];

const activityConfig: Record<string, { emoji: string; color: string }> = {
  hunt: { emoji: '⚔', color: 'bg-primary/15 text-primary border-primary/30' },
  war: { emoji: '🔥', color: 'bg-offline/15 text-offline border-offline/30' },
  maker: { emoji: '🔨', color: 'bg-afk/15 text-afk border-afk/30' },
  boss: { emoji: '💀', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
};

function getVocStripe(vocation: string) {
  const v = vocation.toLowerCase();
  if (v.includes('knight')) return 'voc-stripe-ek';
  if (v.includes('paladin')) return 'voc-stripe-rp';
  if (v.includes('druid')) return 'voc-stripe-ed';
  if (v.includes('sorcerer')) return 'voc-stripe-ms';
  return '';
}

function timeAgo(dateStr: string) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'Agora';
  if (min < 60) return `${min}m`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '', email: '', password: '', totp_secret: '', world: '', level: 0,
    vocation: '', location: '', used_by: '', status: 'offline' as CharacterStatus, activity: '' as CharacterActivity, observations: '',
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
    setForm({ name: '', email: '', password: '', totp_secret: '', world: '', level: 0, vocation: '', location: '', used_by: '', status: 'offline', activity: '', observations: '' });
    setShowForm(false); setEditId(null);
  };

  const handleEdit = (b: BonecoRow) => {
    setForm({
      name: b.name, email: b.email, password: b.password, totp_secret: b.totp_secret,
      world: b.world, level: b.level, vocation: b.vocation, location: b.location,
      used_by: b.used_by, status: b.status as CharacterStatus, activity: b.activity as CharacterActivity, observations: b.observations,
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
    navigator.clipboard.writeText(text);
    toast({ title: 'Copiado!' });
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
    <div className="max-w-6xl mx-auto">
      {/* Header - asymmetric with decorative line */}
      <div className="flex items-end justify-between mb-2">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-primary/60 font-mono mb-1">── Guild Roster ──</p>
          <h1 className="text-3xl font-extrabold text-primary neon-text" style={{ fontFamily: "'MedievalSharp', cursive" }}>
            Bloco de Bonecos
          </h1>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }} variant="outline" className="gap-2 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary rounded-none">
          <Plus className="h-4 w-4" /> Recrutar
        </Button>
      </div>
      <div className="glow-divider mb-6" />

      {/* Stats - compact horizontal strip */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        <StatCard icon={<Swords className="h-5 w-5" />} value={bonecos.length} label="Roster" color="primary" />
        <StatCard icon={<span className="w-2.5 h-2.5 rounded-full bg-online animate-pulse-neon" />} value={onlineCount} label="Online" color="online" />
        <StatCard icon={<span className="w-2.5 h-2.5 rounded-full bg-afk" />} value={afkCount} label="AFK" color="afk" />
        <StatCard icon={<span className="w-2.5 h-2.5 rounded-full bg-offline" />} value={offlineCount} label="Offline" color="offline" />
      </div>

      {/* Filters - terminal style */}
      <div className="flex gap-2 mb-5 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input value={searchFilter} onChange={e => setSearchFilter(e.target.value)} placeholder="search..." className="pl-9 bg-background border-border rounded-none font-mono text-xs h-9" />
        </div>
        <div className="flex">
          {ACTIVITIES.map(a => (
            <button key={a.value} onClick={() => setActivityFilter(activityFilter === a.value ? '' : a.value)}
              className={`px-3 py-1.5 text-xs font-mono border-y border-r first:border-l first:rounded-none last:rounded-none transition-all
                ${activityFilter === a.value
                  ? 'bg-primary/15 text-primary border-primary/30'
                  : 'bg-background border-border text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}>
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Character Roster - list style instead of cards */}
      <div className="border border-border bg-card/30 backdrop-blur-sm">
        {/* Table Header */}
        <div className="grid grid-cols-[3fr_1fr_1fr_1fr_1fr_80px] gap-0 px-4 py-2 border-b border-border bg-secondary/30 text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-mono">
          <span>Personagem</span>
          <span>Mundo</span>
          <span>Status</span>
          <span>Atividade</span>
          <span>Último</span>
          <span className="text-right">Ações</span>
        </div>

        {filtered.length === 0 && bonecos.length > 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Nenhum resultado encontrado
          </div>
        )}

        {filtered.map((b, i) => (
          <div key={b.id} className={`animate-slide-up border-b border-border/50 last:border-b-0 ${getVocStripe(b.vocation)}`} style={{ animationDelay: `${i * 30}ms` }}>
            {/* Main Row */}
            <div
              className="grid grid-cols-[3fr_1fr_1fr_1fr_1fr_80px] gap-0 px-4 py-3 items-center cursor-pointer hover:bg-secondary/20 transition-colors"
              onClick={() => setExpandedId(expandedId === b.id ? null : b.id)}
            >
              {/* Character info */}
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-sm bg-secondary/80 border border-border flex items-center justify-center ${getVocationColor(b.vocation)}`}>
                  <VocationIcon vocation={b.vocation} className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground truncate">{b.name}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">Lv.{b.level}</span>
                  </div>
                  <span className={`text-[10px] ${getVocationColor(b.vocation)}`}>{b.vocation || '—'}</span>
                </div>
              </div>

              {/* World */}
              <span className="text-xs text-muted-foreground font-mono">{b.world || '—'}</span>

              {/* Status */}
              <StatusBadge status={b.status as any} />

              {/* Activity */}
              <div>
                {b.activity ? (
                  <span className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono border ${activityConfig[b.activity]?.color || ''}`}>
                    {activityConfig[b.activity]?.emoji} {b.activity}
                  </span>
                ) : (
                  <span className="text-[10px] text-muted-foreground/50">—</span>
                )}
              </div>

              {/* Last access */}
              <span className="text-[10px] font-mono text-muted-foreground">{timeAgo(b.last_access)}</span>

              {/* Actions */}
              <div className="flex items-center justify-end gap-1">
                <button onClick={(e) => { e.stopPropagation(); handleEdit(b); }} className="p-1.5 text-muted-foreground hover:text-primary transition-colors">
                  <span className="text-[10px] font-mono uppercase tracking-wider">Edit</span>
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(b.id); }} className="p-1.5 text-muted-foreground hover:text-offline transition-colors">
                  <span className="text-[10px] font-mono uppercase tracking-wider">Del</span>
                </button>
              </div>
            </div>

            {/* Expanded Details Panel */}
            {expandedId === b.id && (
              <div className="px-4 pb-4 pt-1 bg-secondary/10 border-t border-border/30 animate-slide-up">
                <div className="grid grid-cols-3 gap-4">
                  {/* Credentials */}
                  <div className="space-y-2">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-primary/60 font-mono mb-1">Credenciais</p>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-3 w-3 shrink-0" />
                      <span className="font-mono text-[11px] flex-1 truncate">{b.email || '—'}</span>
                      {b.email && <button onClick={() => copyToClipboard(b.email)} className="hover:text-primary"><Copy className="h-3 w-3" /></button>}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Key className="h-3 w-3 shrink-0" />
                      <span className="font-mono text-[11px] flex-1">{visiblePasswords.has(b.id) ? b.password : '••••••••'}</span>
                      <button onClick={() => togglePassword(b.id)} className="hover:text-primary">
                        {visiblePasswords.has(b.id) ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </button>
                      <button onClick={() => copyToClipboard(b.password)} className="hover:text-primary"><Copy className="h-3 w-3" /></button>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Shield className="h-3 w-3 shrink-0" />
                      {visibleTokens.has(b.id) ? (
                        <div className="flex-1 flex items-center gap-2">
                          <span className="font-mono text-[10px] truncate">{b.totp_secret}</span>
                          <TotpDisplay secret={b.totp_secret} />
                        </div>
                      ) : (
                        <span className="font-mono text-[11px] flex-1">••••••••••</span>
                      )}
                      <button onClick={() => toggleToken(b.id)} className="hover:text-primary">
                        {visibleTokens.has(b.id) ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </button>
                      <button onClick={() => copyToClipboard(b.totp_secret)} className="hover:text-primary"><Copy className="h-3 w-3" /></button>
                    </div>
                  </div>

                  {/* Location & Usage */}
                  <div className="space-y-2">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-primary/60 font-mono mb-1">Localização</p>
                    <div className="flex items-center gap-2 text-muted-foreground text-xs">
                      <Globe className="h-3 w-3" />
                      <span>{b.world || '—'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-xs">
                      <MapPin className="h-3 w-3" />
                      <span>{b.location || '—'}</span>
                    </div>
                    {b.used_by && (
                      <div className="flex items-center gap-2 text-muted-foreground text-xs">
                        <User className="h-3 w-3" />
                        <span>Em uso por <span className="text-primary font-medium">{b.used_by}</span></span>
                      </div>
                    )}
                  </div>

                  {/* Observations */}
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-primary/60 font-mono mb-1">Observações</p>
                    <p className="text-xs text-muted-foreground">{b.observations || 'Nenhuma observação.'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {bonecos.length === 0 && (
        <div className="border border-border/50 border-dashed py-16 text-center">
          <Sword className="h-10 w-10 mx-auto mb-3 text-primary/20" />
          <p className="text-muted-foreground text-sm">Nenhum guerreiro no roster</p>
          <p className="text-[10px] text-muted-foreground/60 font-mono mt-1">Clique em "Recrutar" para adicionar</p>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-sm" onClick={() => resetForm()}>
          <div className="w-full max-w-lg bg-card border border-primary/20 p-6 shadow-2xl rpg-frame animate-slide-up" onClick={e => e.stopPropagation()}>
            <p className="text-[10px] uppercase tracking-[0.3em] text-primary/60 font-mono mb-1">── {editId ? 'Editar' : 'Recrutar'} ──</p>
            <h2 className="text-xl font-bold text-primary mb-4" style={{ fontFamily: "'MedievalSharp', cursive" }}>
              {editId ? 'Editar Guerreiro' : 'Novo Guerreiro'}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Nome" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="bg-secondary rounded-none font-mono text-xs" />
              <Input placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="bg-secondary rounded-none font-mono text-xs" />
              <Input placeholder="Senha" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="bg-secondary rounded-none font-mono text-xs" />
              <Input placeholder="Chave 2FA (Base32)" value={form.totp_secret} onChange={e => setForm({...form, totp_secret: e.target.value.toUpperCase().replace(/[^A-Z2-7=]/g, '')})} className="bg-secondary rounded-none font-mono text-xs" />
              <Input placeholder="Mundo" value={form.world} onChange={e => setForm({...form, world: e.target.value})} className="bg-secondary rounded-none font-mono text-xs" />
              <Input placeholder="Level" type="number" value={form.level || ''} onChange={e => setForm({...form, level: parseInt(e.target.value) || 0})} className="bg-secondary rounded-none font-mono text-xs" />
              <select value={form.vocation} onChange={e => setForm({...form, vocation: e.target.value})} className="px-3 py-2 bg-secondary border border-border text-foreground text-xs font-mono">
                <option value="">Vocação</option>
                <option value="Elite Knight">Elite Knight</option>
                <option value="Royal Paladin">Royal Paladin</option>
                <option value="Elder Druid">Elder Druid</option>
                <option value="Master Sorcerer">Master Sorcerer</option>
              </select>
              <Input placeholder="Localização" value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="bg-secondary rounded-none font-mono text-xs" />
              <Input placeholder="Em uso por" value={form.used_by} onChange={e => setForm({...form, used_by: e.target.value})} className="bg-secondary rounded-none font-mono text-xs" />
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value as CharacterStatus})} className="px-3 py-2 bg-secondary border border-border text-foreground text-xs font-mono">
                <option value="online">Online</option>
                <option value="afk">AFK</option>
                <option value="offline">Offline</option>
              </select>
              <select value={form.activity} onChange={e => setForm({...form, activity: e.target.value as CharacterActivity})} className="col-span-2 px-3 py-2 bg-secondary border border-border text-foreground text-xs font-mono">
                <option value="">Sem atividade</option>
                <option value="hunt">⚔ Hunt</option>
                <option value="war">🔥 War</option>
                <option value="maker">🔨 Maker</option>
                <option value="boss">💀 Boss</option>
              </select>
              <Input placeholder="Observações" value={form.observations} onChange={e => setForm({...form, observations: e.target.value})} className="col-span-2 bg-secondary rounded-none font-mono text-xs" />
            </div>
            <div className="glow-divider my-4" />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={resetForm} className="rounded-none text-xs font-mono">Cancelar</Button>
              <Button onClick={handleSubmit} className="rounded-none text-xs font-mono">{editId ? 'Salvar' : 'Recrutar'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
