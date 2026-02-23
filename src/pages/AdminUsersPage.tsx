import { useState } from 'react';
import { UserPlus, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!email || !password) {
      toast({ title: 'Email e senha obrigatórios', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: { email, password, username, role },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: 'Usuário criado com sucesso!' });
      setEmail('');
      setPassword('');
      setUsername('');
      setRole('user');
    } catch (err: any) {
      toast({ title: err.message || 'Erro ao criar usuário', variant: 'destructive' });
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-extrabold text-primary neon-text">Gerenciar Usuários</h1>
          <p className="text-sm text-muted-foreground">Criar novas contas de acesso</p>
        </div>
      </div>

      <div className="max-w-md bg-card border border-border rounded-xl p-6 space-y-4">
        <Input placeholder="Nome de usuário" value={username} onChange={e => setUsername(e.target.value)} className="bg-secondary" />
        <Input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="bg-secondary" />
        <Input placeholder="Senha" type="password" value={password} onChange={e => setPassword(e.target.value)} className="bg-secondary" />
        <select
          value={role}
          onChange={e => setRole(e.target.value as 'admin' | 'user')}
          className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm"
        >
          <option value="user">Usuário</option>
          <option value="admin">Admin</option>
        </select>
        <Button onClick={handleCreate} disabled={loading} className="w-full gap-2">
          <UserPlus className="h-4 w-4" />
          {loading ? 'Criando...' : 'Criar Usuário'}
        </Button>
      </div>
    </div>
  );
}
