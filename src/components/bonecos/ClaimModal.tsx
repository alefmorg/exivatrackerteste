import { LogIn, LogOut } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ClaimModalProps {
  show: { id: string; name: string; action: 'pegar' | 'devolver' };
  claimNotes: string;
  setClaimNotes: (v: string) => void;
  claimingId: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ClaimModal({ show, claimNotes, setClaimNotes, claimingId, onConfirm, onCancel }: ClaimModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={onCancel}>
      <div className="w-full max-w-sm bg-card border border-border rounded-xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
          {show.action === 'pegar' ? <LogIn className="h-5 w-5 text-primary" /> : <LogOut className="h-5 w-5 text-afk" />}
          {show.action === 'pegar' ? 'Pegar' : 'Devolver'} Boneco
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          {show.action === 'pegar' ? 'Você vai pegar' : 'Você vai devolver'} <strong className="text-primary">{show.name}</strong>
        </p>
        <Input
          placeholder="Notas (opcional) — ex: vai huntar em Roshamuul"
          value={claimNotes}
          onChange={e => setClaimNotes(e.target.value)}
          className="bg-secondary mb-4"
          onKeyDown={e => e.key === 'Enter' && onConfirm()}
        />
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
          <Button onClick={onConfirm} disabled={claimingId === show.id}
            className={show.action === 'pegar' ? '' : 'bg-afk hover:bg-afk/90 text-afk-foreground'}>
            {claimingId === show.id ? 'Processando...' : show.action === 'pegar' ? '📥 Pegar' : '📤 Devolver'}
          </Button>
        </div>
      </div>
    </div>
  );
}
