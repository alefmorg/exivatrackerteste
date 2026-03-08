import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ItemSprite } from '@/components/TibiaIcons';
import { useAuth, type AppRole } from '@/hooks/useAuth';
import { timeAgo } from '@/lib/utils';

interface UserRow {
  id: string;
  email: string;
  username: string;
  role: AppRole;
  created_at: string;
  last_sign_in_at: string | null;
}

// timeAgo imported from utils

export default function AdminUsersPage() {
  const { toast } = useToast();
  const { isMasterAdmin } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  
  // Create user form
  const [showCreate, setShowCreate] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<AppRole>('user');
  const [creating, setCreating] = useState(false);

  // Inline actions
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editUsername, setEditUsername] = useState('');
  const [resetPwUser, setResetPwUser] = useState<string | null>(null);
  const [newPw, setNewPw] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: { action: 'list' },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setUsers(data.users || []);
    } catch (err: any) {
      toast({ title: 'Erro ao carregar usuários', description: err.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async () => {
    if (!email || !password) { toast({ title: 'Email e senha obrigatórios', variant: 'destructive' }); return; }
    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: { email, password, username, role },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: '✅ Usuário criado!' });
      setEmail(''); setPassword(''); setUsername(''); setRole('user'); setShowCreate(false);
      fetchUsers();
    } catch (err: any) {
      toast({ title: err.message, variant: 'destructive' });
    }
    setCreating(false);
  };

  const handleChangeRole = async (userId: string, newRole: 'admin' | 'user') => {
    try {
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: { action: 'update_role', user_id: userId, role: newRole },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: `Papel alterado para ${newRole}` });
      fetchUsers();
    } catch (err: any) {
      toast({ title: err.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (userId: string, userEmail: string) => {
    if (!confirm(`Excluir o usuário ${userEmail}? Esta ação é irreversível.`)) return;
    try {
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: { action: 'delete', user_id: userId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: 'Usuário excluído' });
      fetchUsers();
    } catch (err: any) {
      toast({ title: err.message, variant: 'destructive' });
    }
  };

  const handleResetPw = async (userId: string) => {
    if (newPw.length < 6) { toast({ title: 'Mínimo 6 caracteres', variant: 'destructive' }); return; }
    try {
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: { action: 'reset_password', user_id: userId, new_password: newPw },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: 'Senha resetada!' });
      setResetPwUser(null); setNewPw('');
    } catch (err: any) {
      toast({ title: err.message, variant: 'destructive' });
    }
  };

  const handleUpdateUsername = async (userId: string) => {
    if (!editUsername.trim()) return;
    try {
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: { action: 'update_username', user_id: userId, username: editUsername },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: 'Username atualizado!' });
      setEditingUser(null); setEditUsername('');
      fetchUsers();
    } catch (err: any) {
      toast({ title: err.message, variant: 'destructive' });
    }
  };

  const filtered = users.filter(u => {
    if (!searchFilter) return true;
    const q = searchFilter.toLowerCase();
    return u.email.toLowerCase().includes(q) || u.username.toLowerCase().includes(q);
  });

  const adminCount = users.filter(u => u.role === 'admin').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <ItemSprite item="shield" className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Gerenciar Usuários</h1>
            <p className="text-xs text-muted-foreground">{users.length} usuários • {adminCount} admins</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading} className="gap-2">
            <ItemSprite item="refresh" className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button size="sm" onClick={() => setShowCreate(!showCreate)} className="gap-2">
            <ItemSprite item="add" className="h-4 w-4" /> Novo Usuário
          </Button>
        </div>
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden">
            <div className="glass-card rounded-xl p-5 space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <ItemSprite item="add" className="h-5 w-5" /> Criar Novo Usuário
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Username</label>
                  <Input placeholder="Nome de exibição" value={username} onChange={e => setUsername(e.target.value)} className="bg-secondary" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Email</label>
                  <Input placeholder="email@exemplo.com" type="email" value={email} onChange={e => setEmail(e.target.value)} className="bg-secondary" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Senha</label>
                  <Input placeholder="Mín. 6 caracteres" type="password" value={password} onChange={e => setPassword(e.target.value)} className="bg-secondary" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Papel</label>
                  <select value={role} onChange={e => setRole(e.target.value as 'admin' | 'user')}
                    className="w-full h-10 px-3 rounded-lg bg-secondary border border-border text-foreground text-sm">
                    <option value="user">Usuário</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowCreate(false)}>Cancelar</Button>
                <Button size="sm" onClick={handleCreate} disabled={creating} className="gap-2">
                  {creating ? <ItemSprite item="refresh" className="h-4 w-4 animate-spin" /> : <ItemSprite item="add" className="h-4 w-4" />}
                  Criar
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <ItemSprite item="search" className="h-4 w-4" />
        </div>
        <Input value={searchFilter} onChange={e => setSearchFilter(e.target.value)}
          placeholder="Buscar por email ou username..." className="pl-9 bg-secondary border-border" />
      </div>

      {/* Users List */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-2">
          {filtered.map(u => (
            <motion.div key={u.id} layout
              className="glass-card rounded-xl p-4 hover:border-primary/20 transition-all">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  u.role === 'admin' ? 'bg-primary/20 border border-primary/30' : 'bg-secondary border border-border'
                }`}>
                {u.role === 'admin' ? <ItemSprite item="crown" className="h-5 w-5" /> : <ItemSprite item="user" className="h-5 w-5" />}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {editingUser === u.id ? (
                      <div className="flex items-center gap-1">
                        <Input value={editUsername} onChange={e => setEditUsername(e.target.value)}
                          className="h-7 text-sm bg-secondary w-40" onKeyDown={e => e.key === 'Enter' && handleUpdateUsername(u.id)} />
                        <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => handleUpdateUsername(u.id)}>OK</Button>
                        <Button variant="ghost" size="sm" className="h-7 px-1" onClick={() => setEditingUser(null)}><X className="h-3 w-3" /></Button>
                      </div>
                    ) : (
                      <>
                        <span className="font-semibold text-foreground truncate">{u.username}</span>
                        <button onClick={() => { setEditingUser(u.id); setEditUsername(u.username); }}
                          className="text-muted-foreground hover:text-primary"><ItemSprite item="edit" className="h-4 w-4" /></button>
                      </>
                    )}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                      u.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'
                    }`}>{u.role.toUpperCase()}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-1"><ItemSprite item="email" className="h-4 w-4" /> {u.email}</span>
                    <span className="flex items-center gap-1"><ItemSprite item="clock" className="h-4 w-4" /> {timeAgo(u.last_sign_in_at)}</span>
                  </div>
                </div>

                {/* Reset Password inline */}
                {resetPwUser === u.id && (
                  <div className="flex items-center gap-1">
                    <Input type="password" value={newPw} onChange={e => setNewPw(e.target.value)}
                      placeholder="Nova senha" className="h-7 text-xs bg-secondary w-32" onKeyDown={e => e.key === 'Enter' && handleResetPw(u.id)} />
                    <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => handleResetPw(u.id)}>OK</Button>
                    <Button variant="ghost" size="sm" className="h-7 px-1" onClick={() => setResetPwUser(null)}><X className="h-3 w-3" /></Button>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <select value={u.role} onChange={e => handleChangeRole(u.id, e.target.value as 'admin' | 'user')}
                    className="text-[11px] px-2 py-1 rounded-md bg-secondary border border-border text-foreground cursor-pointer">
                    <option value="user">Usuário</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button onClick={() => { setResetPwUser(u.id); setNewPw(''); }}
                    className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-primary transition-colors" title="Resetar senha">
                    <ItemSprite item="key" className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(u.id, u.email)}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" title="Excluir">
                    <ItemSprite item="delete" className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <ItemSprite item="users" className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="text-lg font-medium">Nenhum usuário encontrado</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
