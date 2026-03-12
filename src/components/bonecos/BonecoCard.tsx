import { Eye, EyeOff, Copy, RefreshCw } from 'lucide-react';
import * as OTPAuth from 'otpauth';
import { Button } from '@/components/ui/button';
import StatusDot from '@/components/StatusDot';
import StatusBadge from '@/components/StatusBadge';
import TotpDisplay from '@/components/TotpDisplay';
import { VocationIcon, ItemSprite, ActivityIcon } from '@/components/TibiaIcons';
import { timeAgo } from '@/lib/utils';
import { AppSettings } from '@/hooks/useSettings';

interface BonecoRow {
  id: string; name: string; email: string; password: string; totp_secret: string;
  world: string; level: number; vocation: string; location: string; used_by: string;
  status: string; activity: string; observations: string; last_access: string;
  full_bless: boolean; tibia_coins: number; magic_level: number;
  fist: number; club: number; sword_skill: number; axe: number; distance: number; shielding: number;
  premium_active: boolean; acessos: string[]; quests: string[];
}

const activityConfig: Record<string, { emoji: string; color: string }> = {
  hunt: { emoji: '⚔', color: 'bg-primary/15 text-primary border-primary/30' },
  war: { emoji: '🔥', color: 'bg-offline/15 text-offline border-offline/30' },
  maker: { emoji: '🔨', color: 'bg-afk/15 text-afk border-afk/30' },
  boss: { emoji: '💀', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
};

function getVocShort(voc: string) {
  if (voc.toLowerCase().includes('knight')) return 'EK';
  if (voc.toLowerCase().includes('paladin')) return 'RP';
  if (voc.toLowerCase().includes('druid')) return 'ED';
  if (voc.toLowerCase().includes('sorcerer')) return 'MS';
  return voc.slice(0, 2).toUpperCase();
}

function getVocBorderColor(voc: string) {
  const v = voc.toLowerCase();
  if (v.includes('knight')) return 'border-l-red-500';
  if (v.includes('paladin')) return 'border-l-yellow-500';
  if (v.includes('druid')) return 'border-l-emerald-500';
  if (v.includes('sorcerer')) return 'border-l-blue-500';
  return 'border-l-primary';
}

interface BonecoCardProps {
  b: BonecoRow;
  settings: AppSettings;
  isAdmin: boolean;
  syncing: boolean;
  visiblePasswords: Set<string>;
  visibleTokens: Set<string>;
  onTogglePassword: (id: string) => void;
  onToggleToken: (id: string) => void;
  onCopy: (text: string) => void;
  onSync: (b: BonecoRow) => void;
  onClaim: (b: BonecoRow) => void;
  onEdit: (b: BonecoRow) => void;
  onDelete: (id: string, name: string) => void;
}

export default function BonecoCard({
  b, settings, isAdmin, syncing, visiblePasswords, visibleTokens,
  onTogglePassword, onToggleToken, onCopy, onSync, onClaim, onEdit, onDelete,
}: BonecoCardProps) {

  return (
    <div className={`panel rounded-lg border-l-2 ${getVocBorderColor(b.vocation)} ${settings.compactMode ? 'p-2.5' : 'p-4'} hover:border-primary/30 transition-all`}>

      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center">
          <VocationIcon vocation={b.vocation} className="h-6 w-6" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground truncate">{b.name}</span>
            <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
              {getVocShort(b.vocation)}
            </span>
            <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
              <ItemSprite item="level" className="h-4 w-4" /> Lv.{b.level}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <ItemSprite item="globe" className="h-4 w-4" /> {b.world || '—'}
            <span className="text-border">•</span>
            <ItemSprite item="location" className="h-4 w-4" /> {b.location || '—'}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusDot status={b.status as any} />
          <StatusBadge status={b.status as any} />
        </div>
      </div>

      {/* Credentials */}
      {settings.showCredentials && (
        <div className="space-y-1.5 text-sm bg-secondary/50 rounded-lg p-3 mb-3">

          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Credenciais
            </span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <ItemSprite item="email" className="h-5 w-5 shrink-0" />
            <span className="font-mono text-xs flex-1 truncate">{b.email || '—'}</span>
            {b.email && <button onClick={() => onCopy(b.email)}><Copy className="h-3.5 w-3.5" /></button>}
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <ItemSprite item="password" className="h-5 w-5 shrink-0" />
            <span className="font-mono text-xs flex-1">
              {visiblePasswords.has(b.id) ? b.password : '••••••••'}
            </span>

            <button onClick={() => onTogglePassword(b.id)}>
              {visiblePasswords.has(b.id) ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>

            <button onClick={() => onCopy(b.password)}>
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <ItemSprite item="token2fa" className="h-5 w-5 shrink-0" />

            {visibleTokens.has(b.id) ? (
              <TotpDisplay secret={b.totp_secret} />
            ) : (
              <span className="font-mono text-xs flex-1">••••••••••••</span>
            )}

            <button onClick={() => onToggleToken(b.id)}>
              {visibleTokens.has(b.id) ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>

            <button
              onClick={() => {
                if (!b.totp_secret) return;

                try {
                  const totp = new OTPAuth.TOTP({
                    secret: OTPAuth.Secret.fromBase32(b.totp_secret),
                    digits: 6,
                    period: 30,
                    algorithm: 'SHA1',
                  });

                  onCopy(totp.generate());
                } catch {
                  onCopy('ERRO');
                }
              }}
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>

        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border text-xs text-muted-foreground">

        <span className="flex items-center gap-1">
          <ItemSprite item="clock" className="h-4 w-4" />
          {timeAgo(b.last_access)}
        </span>

        <div className="flex items-center gap-2">

          <button onClick={() => onSync(b)} disabled={syncing}>
            <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
          </button>

          <Button
            variant={b.used_by ? 'outline' : 'default'}
            size="sm"
            onClick={() => onClaim(b)}
          >
            {b.used_by ? 'Devolver' : 'Pegar'}
          </Button>

          {isAdmin && (
            <>
              <button onClick={() => onEdit(b)}>Editar</button>
              <button onClick={() => onDelete(b.id, b.name)}>Excluir</button>
            </>
          )}

        </div>

      </div>

    </div>
  );
}
