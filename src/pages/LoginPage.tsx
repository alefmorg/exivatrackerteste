import { useState } from 'react';
import { Sword, LogIn, Shield } from 'lucide-react';
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4 hex-subtle">
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-sm relative">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/12 border border-primary/25 flex items-center justify-center">
              <Sword className="h-5 w-5 text-primary" />
            </div>
            <div className="text-left">
              <h1 className="text-xl font-display font-bold text-primary tracking-wider neon-text">EXIVA</h1>
              <p className="text-[9px] text-muted-foreground uppercase tracking-[0.3em] font-mono">TRACKER PRO</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="panel rounded-lg p-5 space-y-4 stripe-top">
          <div className="text-center mb-2">
            <p className="text-xs text-muted-foreground">Acesso restrito ao sistema</p>
          </div>

          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono mb-1.5 block">Email</label>
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="operador@guild.com"
              className="bg-secondary/50 border-border h-9 text-sm"
              required
            />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono mb-1.5 block">Senha</label>
            <Input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-secondary/50 border-border h-9 text-sm"
              required
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded bg-destructive/10 border border-destructive/20">
              <Shield className="h-3 w-3 text-destructive shrink-0" />
              <p className="text-[11px] text-destructive">{error}</p>
            </div>
          )}

          <Button type="submit" className="w-full gap-2 h-9 text-xs font-semibold" disabled={loading}>
            <LogIn className="h-3.5 w-3.5" />
            {loading ? 'Autenticando...' : 'Acessar Sistema'}
          </Button>

          <p className="text-[10px] text-center text-muted-foreground font-mono">
            ACESSO POR CONVITE • ADM ONLY
          </p>
        </form>
      </div>
    </div>
  );
}
