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
  full_bless: boolean;
  tibia_coins: number;
  magic_level: number;
  fist: number;
  club: number;
  sword_skill: number;
  axe: number;
  distance: number;
  shielding: number;
  premium_active: boolean;
  acessos: string[];
  quests: string[];
}

const activityConfig: Record<string, { emoji: string; color: string }> = {
  hunt: {
    emoji: '⚔',
    color: 'bg-primary/15 text-primary border-primary/30'
  },
  war: {
    emoji: '🔥',
    color: 'bg-offline/15 text-offline border-offline/30'
  },
  maker: {
    emoji: '🔨',
    color: 'bg-afk/15 text-afk border-afk/30'
  },
  boss: {
    emoji: '💀',
    color: 'bg-purple-500/15 text-purple-400 border-purple-500/30'
  }
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
  b,
  settings,
  isAdmin,
  syncing,
  visiblePasswords,
  visibleTokens,
  onTogglePassword,
  onToggleToken,
  onCopy,
  onSync,
  onClaim,
  onEdit,
  onDelete
}: BonecoCardProps) {

  return (
    <div
      className={`panel rounded-lg border-l-2 ${getVocBorderColor(b.vocation)} ${
        settings.compactMode ? 'p-2.5' : 'p-4'
      } hover:border-primary/30 transition-all`}
    >

      {/* Header */}
      <div className="flex items-center gap-3 mb-3">

        <div className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center">
          <VocationIcon vocation={b.vocation} className="h-6 w-6" />
        </div>

        <div className="flex-1 min-w-0">

          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground truncate">
              {b.name}
            </span>

            <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
              {getVocShort(b.vocation)}
            </span>

            <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
              <ItemSprite item="level" className="h-4 w-4" />
              Lv.{b.level}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <ItemSprite item="globe" className="h-4 w-4" />
            {b.world || '—'}

            <span className="text-border">•</span>

            <ItemSprite item="location" className="h-4 w-4" />
            {b.location || '—'}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusDot status={b.status as any} />
          <StatusBadge status={b.status as any} />
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3">

        {b.activity && (
          <span
            className={`px-2 py-0.5 rounded border text-[11px] font-medium ${
              activityConfig[b.activity]?.color || ''
            } flex items-center gap-1`}
          >
            <ActivityIcon activity={b.activity} className="h-4 w-4" />
            {b.activity.charAt(0).toUpperCase() + b.activity.slice(1)}
          </span>
        )}

        {b.full_bless && (
          <span className="px-2 py-0.5 rounded border text-[11px] font-medium bg-red-500/10 text-red-400 border-red-500/30 flex items-center gap-1">
            <ItemSprite item="bless" className="h-4 w-4" />
            Full Bless
          </span>
        )}

        {b.premium_active && (
          <span className="px-2 py-0.5 rounded border text-[11px] font-medium bg-yellow-500/10 text-yellow-400 border-yellow-500/30 flex items-center gap-1">
            <ItemSprite item="premiumScroll" className="h-4 w-4" />
            Premium
          </span>
        )}

        {b.tibia_coins > 0 && (
          <span className="px-2 py-0.5 rounded border text-[11px] font-medium bg-amber-500/10 text-amber-400 border-amber-500/30 flex items-center gap-1">
            <ItemSprite item="tibiaCoin" className="h-4 w-4" />
            {b.tibia_coins} TC
          </span>
        )}

        {b.magic_level > 0 && (
          <span className="px-2 py-0.5 rounded border text-[11px] font-medium bg-blue-500/10 text-blue-400 border-blue-500/30 flex items-center gap-1">
            <ItemSprite item="magicLevel" className="h-4 w-4" />
            ML {b.magic_level}
          </span>
        )}

        {b.used_by && (
          <span className="px-2 py-0.5 rounded border text-[11px] font-medium bg-primary/15 text-primary border-primary/30 flex items-center gap-1">
            <ItemSprite item="skull" className="h-4 w-4" />
            {b.used_by}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border text-xs text-muted-foreground">

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <ItemSprite item="clock" className="h-4 w-4" />
            {timeAgo(b.last_access)}
          </span>
        </div>

        <div className="flex items-center gap-2">

          <button
            onClick={() => onSync(b)}
            disabled={syncing}
            className="text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
            title="Sincronizar com TibiaData"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${
                syncing ? 'animate-spin text-primary' : ''
              }`}
            />
          </button>

          <Button
            variant={b.used_by ? 'outline' : 'default'}
            size="sm"
            className={`h-7 text-xs gap-1 ${
              b.used_by
                ? 'border-afk/30 text-afk hover:bg-afk/10'
                : ''
            }`}
            onClick={() => onClaim(b)}
          >
            {b.used_by ? (
              <>
                <ItemSprite item="logout" className="h-4 w-4" />
                Devolver
              </>
            ) : (
              <>
                <ItemSprite item="login" className="h-4 w-4" />
                Pegar
              </>
            )}
          </Button>

          {isAdmin && (
            <>
              <button
                onClick={() => onEdit(b)}
                className="text-primary hover:underline font-medium"
              >
                Editar
              </button>

              <button
                onClick={() => onDelete(b.id, b.name)}
                className="text-offline hover:underline"
              >
                Excluir
              </button>
            </>
          )}

        </div>
      </div>

      {b.observations && (
        <p className="text-[11px] text-muted-foreground mt-2 italic flex items-center gap-1">
          <ItemSprite item="note" className="h-4 w-4" />
          {b.observations}
        </p>
      )}

    </div>
  );
}
