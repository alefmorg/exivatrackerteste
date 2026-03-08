import { Plus, X, Sword, Heart, Crown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

type CharacterStatus = 'online' | 'afk' | 'offline';
type CharacterActivity = '' | 'hunt' | 'war' | 'maker' | 'boss';

export interface BonecoFormData {
  name: string; email: string; password: string; totp_secret: string; world: string; level: number;
  vocation: string; location: string; used_by: string; status: CharacterStatus;
  activity: CharacterActivity; observations: string;
  full_bless: boolean; tibia_coins: number; magic_level: number;
  fist: number; club: number; sword_skill: number; axe: number; distance: number; shielding: number;
  premium_active: boolean; acessos: string[]; quests: string[];
}

interface BonecoFormModalProps {
  form: BonecoFormData;
  setForm: (f: BonecoFormData) => void;
  editId: string | null;
  onSubmit: () => void;
  onCancel: () => void;
  newAcesso: string;
  setNewAcesso: (v: string) => void;
  newQuest: string;
  setNewQuest: (v: string) => void;
}

export default function BonecoFormModal({
  form, setForm, editId, onSubmit, onCancel, newAcesso, setNewAcesso, newQuest, setNewQuest,
}: BonecoFormModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={onCancel}>
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
          {[
            { key: 'magic_level', label: 'Magic Level' },
            { key: 'fist', label: 'Fist' },
            { key: 'club', label: 'Club' },
            { key: 'sword_skill', label: 'Sword' },
            { key: 'axe', label: 'Axe' },
            { key: 'distance', label: 'Distance' },
            { key: 'shielding', label: 'Shielding' },
          ].map(s => (
            <div key={s.key}>
              <label className="text-[10px] text-muted-foreground">{s.label}</label>
              <Input type="number" value={(form as any)[s.key] || ''} onChange={e => setForm({...form, [s.key]: parseInt(e.target.value) || 0})} className="bg-secondary" />
            </div>
          ))}
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
              <Heart className="h-3.5 w-3.5 text-destructive" /> Full Bless
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
              <Switch checked={form.premium_active} onCheckedChange={v => setForm({...form, premium_active: v})} />
              <Crown className="h-3.5 w-3.5 text-warning" /> Premium
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
          <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
          <Button onClick={onSubmit}>{editId ? 'Salvar' : 'Adicionar'}</Button>
        </div>
      </div>
    </div>
  );
}
