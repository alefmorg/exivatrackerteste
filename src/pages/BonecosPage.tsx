import { useState, useEffect } from 'react';
import { Plus, Search, Shield, Mail, Key, Globe, MapPin, User, Eye, EyeOff, Copy, Clock, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import StatCard from '@/components/StatCard';
import StatusDot from '@/components/StatusDot';
import StatusBadge from '@/components/StatusBadge';
import { Boneco, CharacterActivity, CharacterStatus } from '@/types/tibia';
import { getBonecos, saveBonecos, addBoneco, updateBoneco, deleteBoneco } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

const ACTIVITIES: { value: CharacterActivity | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'hunt', label: 'Hunt' },
  { value: 'war', label: 'War' },
  { value: 'maker', label: 'Maker' },
  { value: 'boss', label: 'Boss' },
];

const activityColors: Record<string, string> = {
  hunt: 'bg-primary/15 text-primary border-primary/30',
  war: 'bg-offline/15 text-offline border-offline/30',
  maker: 'bg-afk/15 text-afk border-afk/30',
  boss: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
};

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function generateToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

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
  const [bonecos, setBonecos] = useState<Boneco[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [activityFilter, setActivityFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [visibleTokens, setVisibleTokens] = useState<Set<string>>(new Set());
  const [form, setForm] = useState<Partial<Boneco>>({
    name: '', email: '', password: '', token: '', world: '', level: 0,
    vocation: '', location: '', usedBy: '', status: 'offline', activity: '', observations: '',
  });

  useEffect(() => {
    setBonecos(getBonecos());
  }, []);

  const save = (list: Boneco[]) => {
    setBonecos(list);
    saveBonecos(list);
  };

  const handleSubmit = () => {
    if (!form.name?.trim()) { toast({ title: 'Nome obrigatório', variant: 'destructive' }); return; }

    if (editId) {
      const updated = { ...form, id: editId, lastAccess: new Date().toISOString() } as Boneco;
      const list = bonecos.map(b => b.id === editId ? updated : b);
      save(list);
      toast({ title: 'Boneco atualizado' });
    } else {
      const newBoneco: Boneco = {
        ...form as Boneco,
        id: generateId(),
        lastAccess: new Date().toISOString(),
      };
      const list = [...bonecos, newBoneco];
      save(list);
      toast({ title: 'Boneco adicionado' });
    }
    resetForm();
  };

  const resetForm = () => {
    setForm({ name: '', email: '', password: '', token: '', world: '', level: 0, vocation: '', location: '', usedBy: '', status: 'offline', activity: '', observations: '' });
    setShowForm(false);
    setEditId(null);
  };

  const handleEdit = (b: Boneco) => {
    setForm(b);
    setEditId(b.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    save(bonecos.filter(b => b.id !== id));
    toast({ title: 'Boneco removido' });
  };

  const togglePassword = (id: string) => {
    setVisiblePasswords(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleToken = (id: string) => {
    setVisibleTokens(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
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

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-3xl font-extrabold text-primary neon-text">Bloco de Bonecos</h1>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> Novo Boneco
        </Button>
      </div>
      <p className="text-muted-foreground mb-6">Gerenciamento de personagens secundários</p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<Shield className="h-5 w-5" />} value={bonecos.length} label="Total" color="primary" />
        <StatCard icon={<span className="w-3 h-3 rounded-full bg-online" />} value={onlineCount} label="Online" color="online" />
        <StatCard icon={<span className="w-3 h-3 rounded-full bg-afk" />} value={afkCount} label="AFK" color="afk" />
        <StatCard icon={<span className="w-3 h-3 rounded-full bg-offline" />} value={offlineCount} label="Offline" color="offline" />
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchFilter}
            onChange={e => setSearchFilter(e.target.value)}
            placeholder="Buscar boneco..."
            className="pl-9 bg-secondary border-border"
          />
        </div>
        <div className="flex gap-1">
          {ACTIVITIES.map(a => (
            <button
              key={a.value}
              onClick={() => setActivityFilter(activityFilter === a.value ? '' : a.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                activityFilter === a.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-secondary border-border text-muted-foreground hover:text-foreground'
              }`}
            >
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
              <div className="flex gap-1">
                <Input placeholder="Token" type="password" value={form.token} onChange={e => setForm({...form, token: e.target.value})} className="bg-secondary flex-1" />
                <Button type="button" variant="outline" size="icon" className="shrink-0" onClick={() => setForm({...form, token: generateToken()})} title="Gerar token">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
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
              <Input placeholder="Em uso por" value={form.usedBy} onChange={e => setForm({...form, usedBy: e.target.value})} className="bg-secondary" />
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
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">{b.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">{b.vocation}</span>
              </div>
              <StatusDot status={b.status} />
              <span className="text-xs text-muted-foreground font-mono">Lv. {b.level}</span>
              <StatusBadge status={b.status} />
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
              <div className="flex items-center gap-2 text-muted-foreground">
                <Shield className="h-3.5 w-3.5" />
                <span className="font-mono text-xs flex-1">{visibleTokens.has(b.id) ? b.token : '••••••••••••'}</span>
                <button onClick={() => toggleToken(b.id)} className="text-muted-foreground hover:text-primary">
                  {visibleTokens.has(b.id) ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
                <button onClick={() => copyToClipboard(b.token)} className="text-muted-foreground hover:text-primary"><Copy className="h-3.5 w-3.5" /></button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {b.world || '—'}</span>
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {b.location || '—'}</span>
              </div>
              <div className="flex items-center gap-2">
                {b.usedBy && <span className="flex items-center gap-1"><User className="h-3 w-3" /> Em uso por <span className="text-primary font-medium">{b.usedBy}</span></span>}
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs">
              <div>
                {b.activity && (
                  <span className={`px-2 py-0.5 rounded border text-xs font-medium ${activityColors[b.activity] || ''}`}>
                    {b.activity.charAt(0).toUpperCase() + b.activity.slice(1)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Último acesso: {timeAgo(b.lastAccess)}
                </span>
                <button onClick={() => handleEdit(b)} className="text-primary hover:underline">Editar</button>
                <button onClick={() => handleDelete(b.id)} className="text-offline hover:underline">Excluir</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {bonecos.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Shield className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Nenhum boneco cadastrado</p>
          <p className="text-sm">Clique em "Novo Boneco" para começar</p>
        </div>
      )}
    </div>
  );
}
