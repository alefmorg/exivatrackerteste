import { useState } from 'react';
import { Sword, LogIn } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await signIn(email, password);
    if (error) setError(error);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center neon-box-sm">
            <Sword className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-extrabold text-primary neon-text" style={{ fontFamily: "'MedievalSharp', cursive" }}>EXIVA</h1>
          <p className="text-sm text-muted-foreground mt-1 tracking-widest uppercase">Manager Pro</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 bg-card border border-border rounded-xl p-6">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Email</label>
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="bg-secondary"
              required
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Senha</label>
            <Input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-secondary"
              required
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full gap-2" disabled={loading}>
            <LogIn className="h-4 w-4" />
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Apenas contas criadas por administradores podem acessar.
          </p>
        </form>
      </div>
    </div>
  );
}
