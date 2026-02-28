import { useState, useEffect } from 'react';
import { Plus, Search, Swords, Mail, Key, Globe, MapPin, User, Eye, EyeOff, Copy, Clock, Sword, Shield, Skull, Target, Hammer } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import StatCard from '@/components/StatCard';
import StatusDot from '@/components/StatusDot';
import StatusBadge from '@/components/StatusBadge';
import TotpDisplay from '@/components/TotpDisplay';
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
  { value: 'hunt', label: 'Hunt' },
  { value: 'war', label: 'War' },
  { value: 'maker', label: 'Maker' },
  { value: 'boss', label: 'Boss' },
];

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
    resetForm();
    fetchBonecos();
  };

  const resetForm = () => {
    setForm({ name: '', email: '', password: '', totp_secret: '', world: '', level: 0, vocation: '', location: '', used_by: '', status: 'offline', activity: '', observations: '' });
    setShowForm(false);
    setEditId(null);
  };

  const handleEdit = (b: BonecoRow) => {
    setForm({
      name: b.name, email: b.email, password: b.password, totp_secret: b.totp_secret,
      world: b.world, level: b.level, vocation: b.vocation, location: b.location,
      used_by: b.used_by, status: b.status as CharacterStatus, activity: b.activity as CharacterActivity, observations: b.observations,
    });
    setEditId(b.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('bonecos').delete().eq('id', id);
    toast({ title: 'Boneco removido' });
    fetchBonecos();
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
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-3xl font-extrabold text-primary neon-text" style={{ fontFamily: "'MedievalSharp', cursive" }}>⚔ Bloco de Bonecos</h1>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> Novo Boneco
        </Button>
      </div>
      <p className="text-muted-foreground mb-6">Gerenciamento de personagens secundários</p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<Swords className="h-5 w-5" />} value={bonecos.length} label="Total" color="primary" />
        <StatCard icon={<span className="w-3 h-3 rounded-full bg-online" />} value={onlineCount} label="Online" color="online" />
        <StatCard icon={<span className="w-3 h-3 rounded-full bg-afk" />} value={afkCount} label="AFK" color="afk" />
        <StatCard icon={<span className="w-3 h-3 rounded-full bg-offline" />} value={offlineCount} label="Offline" color="offline" />
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={searchFilter} onChange={e => setSearchFilter(e.target.value)} placeholder="Buscar boneco..." className="pl-9 bg-secondary border-border" />
        </div>
        <div className="flex gap-1">
          {ACTIVITIES.map(a => (
            <button key={a.value} onClick={() => setActivityFilter(activityFilter === a.value ? '' : a.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${activityFilter === a.value ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary border-border text-muted-foreground hover:text-foreground'}`}>
              {a.label || 'Todos'}
            </button>
          ))}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => resetForm()}>
          <div className="w-full max-w-lg bg-card border border-border rounded-xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-primary mb-4">{editId ? 'Editar' : 'Novo'} Boneco</h2>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Nome" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="bg-secondary" />
              <Input placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="bg-secondary" />
              <Input placeholder="Senha" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="bg-secondary" />
              <Input placeholder="Chave 2FA (Base32)" value={form.totp_secret} onChange={e => setForm({...form, totp_secret: e.target.value.toUpperCase().replace(/[^A-Z2-7=]/g, '')})} className="bg-secondary font-mono text-xs" />
              <Input placeholder="Mundo" value={form.world} onChange={e => setForm({...form, world: e.target.value})} className="bg-secondary" />
              <Input placeholder="Level" type="number" value={form.level || ''} onChange={e => setForm({...form, level: parseInt(e.target.value) || 0})} className="bg-secondary" />
              <select value={form.vocation} onChange={e => setForm({...form, vocation: e.target.value})} className="px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm">
                <option value="">Vocação</option>
                <option value="Elite Knight">Elite Knight</option>
                <option value="Royal Paladin">Royal Paladin</option>
                <option value="Elder Druid">Elder Druid</option>
                <option value="Master Sorcerer">Master Sorcerer</option>
              </select>
              <Input placeholder="Localização" value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="bg-secondary" />
              <Input placeholder="Em uso por" value={form.used_by} onChange={e => setForm({...form, used_by: e.target.value})} className="bg-secondary" />
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value as CharacterStatus})} className="px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm">
                <option value="online">Online</option>
                <option value="afk">AFK</option>
                <option value="offline">Offline</option>
              </select>
              <select value={form.activity} onChange={e => setForm({...form, activity: e.target.value as CharacterActivity})} className="col-span-2 px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm">
                <option value="">Sem atividade</option>
                <option value="hunt">Hunt</option>
                <option value="war">War</option>
                <option value="maker">Maker</option>
                <option value="boss">Boss</option>
              </select>
              <Input placeholder="Observações" value={form.observations} onChange={e => setForm({...form, observations: e.target.value})} className="col-span-2 bg-secondary" />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="ghost" onClick={resetForm}>Cancelar</Button>
              <Button onClick={handleSubmit}>{editId ? 'Salvar' : 'Adicionar'}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map(b => (
          <div key={b.id} className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-colors">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Sword className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2"><span className="font-bold text-foreground">{b.name}</span></div>
                <span className="text-xs text-muted-foreground">{b.vocation}</span>
              </div>
              <StatusDot status={b.status as any} />
              <span className="text-xs text-muted-foreground font-mono">Lv. {b.level}</span>
              <StatusBadge status={b.status as any} />
            </div>

            {/* Info rows */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                <span className="font-mono text-xs flex-1">{b.email || '—'}</span>
                {b.email && <button onClick={() => copyToClipboard(b.email)} className="text-muted-foreground hover:text-primary"><Copy className="h-3.5 w-3.5" /></button>}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Key className="h-3.5 w-3.5" />
                <span className="font-mono text-xs flex-1">{visiblePasswords.has(b.id) ? b.password : '••••••••'}</span>
                <button onClick={() => togglePassword(b.id)} className="text-muted-foreground hover:text-primary">
                  {visiblePasswords.has(b.id) ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
                <button onClick={() => copyToClipboard(b.password)} className="text-muted-foreground hover:text-primary"><Copy className="h-3.5 w-3.5" /></button>
              </div>
              {/* TOTP 2FA */}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Shield className="h-3.5 w-3.5" />
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

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {b.world || '—'}</span>
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {b.location || '—'}</span>
              </div>
              <div className="flex items-center gap-2">
                {b.used_by && <span className="flex items-center gap-1"><User className="h-3 w-3" /> Em uso por <span className="text-primary font-medium">{b.used_by}</span></span>}
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs">
              <div>
                {b.activity && (
                  <span className={`px-2 py-0.5 rounded border text-xs font-medium ${activityConfig[b.activity]?.color || ''}`}>
                    {activityConfig[b.activity]?.emoji} {b.activity.charAt(0).toUpperCase() + b.activity.slice(1)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> Último acesso: {timeAgo(b.last_access)}</span>
                <button onClick={() => handleEdit(b)} className="text-primary hover:underline">Editar</button>
                <button onClick={() => handleDelete(b.id)} className="text-offline hover:underline">Excluir</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {bonecos.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Swords className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Nenhum boneco cadastrado</p>
          <p className="text-sm">Clique em "Novo Boneco" para começar</p>
        </div>
      )}
    </div>
  );
}
