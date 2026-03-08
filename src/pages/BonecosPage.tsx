import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { fetchCharacter } from '@/lib/tibia-api';
import * as OTPAuth from 'otpauth';
import { Button } from '@/components/ui/button';
import { ItemSprite } from '@/components/TibiaIcons';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useSettings } from '@/hooks/useSettings';
import ConfirmDialog from '@/components/ConfirmDialog';
import BonecoFilters from '@/components/bonecos/BonecoFilters';
import BonecoFormModal, { type BonecoFormData } from '@/components/bonecos/BonecoFormModal';
import ClaimModal from '@/components/bonecos/ClaimModal';
import BonecoCard from '@/components/bonecos/BonecoCard';
import { SkeletonPage } from '@/components/SkeletonLoader';
import EmptyState from '@/components/EmptyState';

type CharacterStatus = 'online' | 'afk' | 'offline';
type CharacterActivity = '' | 'hunt' | 'war' | 'maker' | 'boss';

interface BonecoRow {
  id: string; name: string; email: string; password: string; totp_secret: string;
  world: string; level: number; vocation: string; location: string; used_by: string;
  status: string; activity: string; observations: string; last_access: string;
  full_bless: boolean; tibia_coins: number; magic_level: number;
  fist: number; club: number; sword_skill: number; axe: number; distance: number; shielding: number;
  premium_active: boolean; acessos: string[]; quests: string[];
}

const EMPTY_FORM: BonecoFormData = {
  name: '', email: '', password: '', totp_secret: '', world: '', level: 0,
  vocation: '', location: '', used_by: '', status: 'offline' as CharacterStatus,
  activity: '' as CharacterActivity, observations: '',
  full_bless: false, tibia_coins: 0, magic_level: 0,
  fist: 0, club: 0, sword_skill: 0, axe: 0, distance: 0, shielding: 0,
  premium_active: false, acessos: [], quests: [],
};

export default function BonecosPage() {
  const { toast } = useToast();
  const { user, isAdminOrAbove: isAdmin } = useAuth();
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
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [showClaimModal, setShowClaimModal] = useState<{ id: string; name: string; action: 'pegar' | 'devolver' } | null>(null);
  const [newAcesso, setNewAcesso] = useState('');
  const [newQuest, setNewQuest] = useState('');
  const [username, setUsername] = useState('');
  const [syncing, setSyncing] = useState<Set<string>>(new Set());
  const [syncAllLoading, setSyncAllLoading] = useState(false);
  const [syncProgress, setSyncProgress] = useState<{ done: number; total: number } | null>(null);
  const [form, setForm] = useState<BonecoFormData>(EMPTY_FORM);

  const fetchBonecos = async () => {
    const { data, error } = await supabase.from('bonecos').select('*').order('created_at', { ascending: false });
    if (!error && data) setBonecos(data as unknown as BonecoRow[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchBonecos();
    if (user) {
      supabase.from('profiles').select('username').eq('user_id', user.id).single().then(({ data }) => {
        setUsername(data?.username || user.email || '');
      });
    }
    const channel = supabase.channel('bonecos-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bonecos' }, () => fetchBonecos())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setNewAcesso(''); setNewQuest('');
    setShowForm(false); setEditId(null);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast({ title: 'Nome obrigatório', variant: 'destructive' }); return; }
    const payload = { ...form, last_access: new Date().toISOString() };
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

  const handleClaim = (boneco: BonecoRow) => {
    setShowClaimModal({ id: boneco.id, name: boneco.name, action: boneco.used_by ? 'devolver' : 'pegar' });
    setClaimNotes('');
  };

  const confirmClaim = async () => {
    if (!showClaimModal || !user) return;
    setClaimingId(showClaimModal.id);
    const isPegar = showClaimModal.action === 'pegar';

    const { error: updateError } = await supabase.from('bonecos').update({
      used_by: isPegar ? username : '',
      last_access: new Date().toISOString(),
    }).eq('id', showClaimModal.id);

    if (updateError) { toast({ title: updateError.message, variant: 'destructive' }); setClaimingId(null); return; }

    await supabase.from('boneco_logs').insert({
      boneco_id: showClaimModal.id, boneco_name: showClaimModal.name,
      user_id: user.id, username, action: showClaimModal.action, notes: claimNotes,
    });

    if (isPegar) {
      const boneco = bonecos.find(b => b.id === showClaimModal.id);
      if (boneco) {
        let totpCode = '';
        if (boneco.totp_secret) {
          try {
            const totp = new OTPAuth.TOTP({ secret: OTPAuth.Secret.fromBase32(boneco.totp_secret), digits: 6, period: 30, algorithm: 'SHA1' });
            totpCode = totp.generate();
          } catch { /* skip */ }
        }
        navigator.clipboard.writeText(`[b]${boneco.name}[/b] | ${boneco.email} | ${boneco.password}${totpCode ? ` | 2FA: ${totpCode}` : ''}`);
      }
    }

    toast({
      title: isPegar ? '📥 Boneco pego!' : '📤 Boneco devolvido!',
      description: isPegar ? `${showClaimModal.name} está com você — credenciais copiadas! 📋` : `${showClaimModal.name} foi liberado`,
    });
    setClaimingId(null); setShowClaimModal(null); setClaimNotes(''); fetchBonecos();
  };

  const togglePassword = (id: string) => setVisiblePasswords(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleToken = (id: string) => setVisibleTokens(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const copyToClipboard = (text: string) => { navigator.clipboard.writeText(text); toast({ title: 'Copiado!' }); };

  const syncBoneco = async (b: BonecoRow) => {
    if (!b.name || syncing.has(b.id)) return;
    setSyncing(prev => new Set(prev).add(b.id));
    try {
      const charData = await fetchCharacter(b.name);
      const char = charData.character;
      if (!char) throw new Error('Char não encontrado');
      const updates: Record<string, any> = {};
      if (char.level && char.level !== b.level) updates.level = char.level;
      if (char.vocation && char.vocation !== b.vocation) updates.vocation = char.vocation;
      if (char.world && char.world !== b.world) updates.world = char.world;
      if (char.residence && char.residence !== b.location) updates.location = char.residence;
      if (char.account_status) updates.premium_active = char.account_status === 'Premium Account';
      if (Object.keys(updates).length > 0) {
        const { error } = await supabase.from('bonecos').update(updates).eq('id', b.id);
        if (error) throw error;
        toast({ title: `✅ ${b.name} atualizado`, description: Object.entries(updates).map(([k, v]) => `${k}: ${v}`).join(', ') });
        fetchBonecos();
      } else {
        toast({ title: `${b.name} já está atualizado` });
      }
    } catch (err: any) {
      toast({ title: `Erro ao sincronizar ${b.name}`, description: err?.message || 'Char não encontrado na API', variant: 'destructive' });
    } finally {
      setSyncing(prev => { const n = new Set(prev); n.delete(b.id); return n; });
    }
  };

  const syncAllBonecos = async () => {
    if (syncAllLoading) return;
    setSyncAllLoading(true);
    setSyncProgress({ done: 0, total: bonecos.length });
    let updated = 0;
    const BATCH_SIZE = 3;
    const BATCH_DELAY = 800;
    for (let i = 0; i < bonecos.length; i += BATCH_SIZE) {
      const batch = bonecos.slice(i, i + BATCH_SIZE);
      await Promise.allSettled(batch.map(async (b) => {
        try {
          const charData = await fetchCharacter(b.name);
          const char = charData.character;
          if (!char) return;
          const updates: Record<string, any> = {};
          if (char.level && char.level !== b.level) updates.level = char.level;
          if (char.vocation && char.vocation !== b.vocation) updates.vocation = char.vocation;
          if (char.world && char.world !== b.world) updates.world = char.world;
          if (char.residence && char.residence !== b.location) updates.location = char.residence;
          if (char.account_status) updates.premium_active = char.account_status === 'Premium Account';
          if (Object.keys(updates).length > 0) { await supabase.from('bonecos').update(updates).eq('id', b.id); updated++; }
        } catch { /* skip */ }
      }));
      setSyncProgress({ done: Math.min(i + BATCH_SIZE, bonecos.length), total: bonecos.length });
      if (i + BATCH_SIZE < bonecos.length) await new Promise(r => setTimeout(r, BATCH_DELAY));
    }
    toast({ title: `🔄 Sync concluído!`, description: `${updated} bonecos atualizados de ${bonecos.length}` });
    setSyncAllLoading(false); setSyncProgress(null); fetchBonecos();
  };

  const availableCount = bonecos.filter(b => !b.used_by).length;
  const onlineCount = bonecos.filter(b => b.status === 'online').length;
  const afkCount = bonecos.filter(b => b.status === 'afk').length;
  const offlineCount = bonecos.filter(b => b.status === 'offline').length;
  const inUseCount = bonecos.filter(b => b.used_by).length;

  const filtered = bonecos.filter(b => {
    if (searchFilter && !b.name.toLowerCase().includes(searchFilter.toLowerCase()) && !b.world.toLowerCase().includes(searchFilter.toLowerCase())) return false;
    if (activityFilter && b.activity !== activityFilter) return false;
    if (statusFilter && b.status !== statusFilter) return false;
    if (vocationFilter && b.vocation !== vocationFilter) return false;
    if (showAvailableOnly && b.used_by) return false;
    if (!settings.showOfflineBonecos && b.status === 'offline') return false;
    return true;
  });

  if (loading) return <SkeletonPage />;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 rounded-full bg-primary" />
          <div>
            <h1 className="text-lg font-display font-bold text-foreground tracking-wide flex items-center gap-2">
              <ItemSprite item="bonecos" className="h-6 w-6" /> CHAR ROSTER
            </h1>
            <div className="text-[10px] text-muted-foreground font-mono">{bonecos.length} personagens registrados</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={syncAllBonecos} disabled={syncAllLoading} variant="outline" size="sm" className="gap-1.5 text-xs">
            <RefreshCw className={`h-3.5 w-3.5 ${syncAllLoading ? 'animate-spin' : ''}`} />
            {syncAllLoading && syncProgress ? `${syncProgress.done}/${syncProgress.total}` : 'Sync Todos'}
          </Button>
          {isAdmin && (
            <Button onClick={() => { resetForm(); setShowForm(true); }} size="sm" className="gap-1.5 text-xs">
              <ItemSprite item="add" className="h-4 w-4" /> Novo Char
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
        {[
          { label: 'TOTAL', value: bonecos.length, color: 'text-foreground' },
          { label: 'ONLINE', value: onlineCount, color: 'text-online' },
          { label: 'AFK', value: afkCount, color: 'text-afk' },
          { label: 'OFFLINE', value: offlineCount, color: 'text-offline' },
          { label: 'EM USO', value: inUseCount, color: 'text-primary' },
        ].map(s => (
          <div key={s.label} className="panel-inset rounded-md p-2 text-center">
            <p className={`text-sm font-bold font-mono ${s.color}`}>{s.value}</p>
            <p className="text-[8px] text-muted-foreground uppercase tracking-[0.15em] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <BonecoFilters
        searchFilter={searchFilter} setSearchFilter={setSearchFilter}
        activityFilter={activityFilter} setActivityFilter={setActivityFilter}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        vocationFilter={vocationFilter} setVocationFilter={setVocationFilter}
        showAvailableOnly={showAvailableOnly} setShowAvailableOnly={setShowAvailableOnly}
        availableCount={availableCount}
      />

      {/* Claim Modal */}
      {showClaimModal && (
        <ClaimModal show={showClaimModal} claimNotes={claimNotes} setClaimNotes={setClaimNotes}
          claimingId={claimingId} onConfirm={confirmClaim} onCancel={() => setShowClaimModal(null)} />
      )}

      {/* Form Modal */}
      {showForm && (
        <BonecoFormModal form={form} setForm={setForm} editId={editId}
          onSubmit={handleSubmit} onCancel={resetForm}
          newAcesso={newAcesso} setNewAcesso={setNewAcesso}
          newQuest={newQuest} setNewQuest={setNewQuest} />
      )}

      {/* Cards Grid */}
      <div className={settings.cardLayout === 'list' ? 'space-y-2' : 'grid grid-cols-1 lg:grid-cols-2 gap-3'}>
        {filtered.map(b => (
          <BonecoCard key={b.id} b={b} settings={settings} isAdmin={isAdmin}
            syncing={syncing.has(b.id)} visiblePasswords={visiblePasswords} visibleTokens={visibleTokens}
            onTogglePassword={togglePassword} onToggleToken={toggleToken}
            onCopy={copyToClipboard} onSync={syncBoneco} onClaim={handleClaim}
            onEdit={handleEdit} onDelete={(id, name) => setDeleteTarget({ id, name })} />
        ))}
      </div>

      {filtered.length === 0 && (
        <EmptyState
          icon="bonecos"
          title="Nenhum boneco encontrado"
          description={bonecos.length > 0 ? 'Tente ajustar os filtros para encontrar o personagem.' : 'Adicione um personagem para começar.'}
        />
      )}

      <ConfirmDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Excluir boneco" description={`Tem certeza que deseja excluir "${deleteTarget?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir" variant="destructive"
        onConfirm={async () => {
          if (!deleteTarget) return;
          await supabase.from('bonecos').delete().eq('id', deleteTarget.id);
          toast({ title: 'Boneco removido' }); setDeleteTarget(null); fetchBonecos();
        }} />
    </div>
  );
}
