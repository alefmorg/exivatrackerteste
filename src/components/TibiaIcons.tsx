import { Sword, Swords, Shield, Skull, Hammer, Crosshair, Heart, Wand2, Target } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';

// ============================================================
// Tibia Sprite URLs — local sprites in /public/sprites/
// ============================================================

const SPRITE = {
  vocation: {
    knight: '/sprites/outfit_knight.gif',
    paladin: '/sprites/outfit_paladin.gif',
    druid: '/sprites/outfit_druid.gif',
    sorcerer: '/sprites/outfit_sorcerer.gif',
  },
  activity: {
    hunt: '/sprites/enchanted_spear.gif',
    war: '/sprites/war_axe.gif',
    maker: '/sprites/wand_of_vortex.gif',
    boss: '/sprites/demon_helmet.gif',
  },
  items: {
    tibiaCoin: '/sprites/tibia_coin.gif',
    premiumScroll: '/sprites/premium_scroll.gif',
    bless: '/sprites/ankh.gif',
    magicLevel: '/sprites/spellbook.gif',
    sword: '/sprites/magic_plate_armor.gif',
    shield: '/sprites/blessed_shield.gif',
    distance: '/sprites/royal_crossbow.gif',
    club: '/sprites/cranial_basher.gif',
    axe: '/sprites/stonecutter_axe.gif',
    fist: '/sprites/pair_of_iron_fists.gif',
    shielding: '/sprites/mastermind_shield.gif',
    key: '/sprites/parchment.gif',
    quest: '/sprites/old_parchment.gif',
    skull: '/sprites/skull.gif',
    guild: '/sprites/war_horn.gif',
    globe: '/sprites/globe.gif',
    login: '/sprites/green_gem.gif',
    logout: '/sprites/red_gem.gif',
    online: '/sprites/green_gem.gif',
    offline: '/sprites/red_gem.gif',
    afk: '/sprites/yellow_gem.gif',
    scroll: '/sprites/parchment.gif',
    settings: '/sprites/mechanical_fishing_rod.gif',
    dashboard: '/sprites/almanac_of_magic.gif',
    history: '/sprites/parchment.gif',
    users: '/sprites/ring_of_ending.gif',
    exiva: '/sprites/crystal_ball.gif',
    bonecos: '/sprites/golden_figurine.gif',
    email: '/sprites/letter.gif',
    password: '/sprites/parchment.gif',
    token2fa: '/sprites/ferumbras_hat.gif',
    copy: '/sprites/parchment.gif',
    refresh: '/sprites/hourglass.gif',
    live: '/sprites/might_ring.gif',
    star: '/sprites/gold_ingot.gif',
    crown: '/sprites/crown.gif',
    filter: '/sprites/small_sapphire.gif',
    add: '/sprites/small_emerald.gif',
    delete: '/sprites/sudden_death_rune.gif',
    edit: '/sprites/quill.gif',
    search: '/sprites/crystal_ball.gif',
    note: '/sprites/parchment.gif',
    location: '/sprites/compass.gif',
    clock: '/sprites/watch.gif',
    level: '/sprites/gold_ingot.gif',
  },
} as const;

// Reusable sprite component
export function TibiaSprite({ 
  src, 
  alt = '', 
  className = 'h-4 w-4',
  fallback,
}: { 
  src: string; 
  alt?: string; 
  className?: string;
  fallback?: React.ReactNode;
}) {
  return (
    <img 
      src={src} 
      alt={alt} 
      className={`${className} object-contain inline-block`} 
      style={{ imageRendering: 'pixelated' }}
      onError={(e) => {
        if (fallback) {
          (e.target as HTMLImageElement).style.display = 'none';
        }
      }}
    />
  );
}

// Nav icon using sprite
export function NavSprite({ spriteKey, className = 'h-4 w-4' }: { spriteKey: keyof typeof SPRITE.items; className?: string }) {
  return <TibiaSprite src={SPRITE.items[spriteKey]} alt={spriteKey} className={className} />;
}

// Map Tibia vocations to icons
export const VocationIcon = ({ vocation, className = "h-4 w-4" }: { vocation: string; className?: string }) => {
  const settings = useSettings();
  const voc = vocation.toLowerCase();

  if (settings.iconPack === 'tibia') {
    const key = Object.keys(SPRITE.vocation).find(k => voc.includes(k)) as keyof typeof SPRITE.vocation | undefined;
    if (key) {
      return <TibiaSprite src={SPRITE.vocation[key]} alt={vocation} className={className} />;
    }
  }

  if (voc.includes('knight')) return <Sword className={className} />;
  if (voc.includes('paladin')) return <Crosshair className={className} />;
  if (voc.includes('druid')) return <Heart className={className} />;
  if (voc.includes('sorcerer')) return <Wand2 className={className} />;
  return <Shield className={className} />;
};

// Map activities to icons
export const ActivityIcon = ({ activity, className = "h-4 w-4" }: { activity: string; className?: string }) => {
  const settings = useSettings();

  if (settings.iconPack === 'tibia' && SPRITE.activity[activity as keyof typeof SPRITE.activity]) {
    return <TibiaSprite src={SPRITE.activity[activity as keyof typeof SPRITE.activity]} alt={activity} className={className} />;
  }

  switch (activity) {
    case 'hunt': return <Target className={className} />;
    case 'war': return <Swords className={className} />;
    case 'maker': return <Hammer className={className} />;
    case 'boss': return <Skull className={className} />;
    default: return <Shield className={className} />;
  }
};

// Item sprite helper
export function ItemSprite({ item, className = 'h-4 w-4' }: { item: keyof typeof SPRITE.items; className?: string }) {
  return <TibiaSprite src={SPRITE.items[item]} alt={item} className={className} />;
}

// Vocation colors
export const vocationColors: Record<string, string> = {
  'elite knight': 'text-red-400',
  'royal paladin': 'text-yellow-400',
  'elder druid': 'text-emerald-400',
  'master sorcerer': 'text-blue-400',
};

export const getVocationColor = (vocation: string) => {
  return vocationColors[vocation.toLowerCase()] || 'text-muted-foreground';
};

// Activity config with Tibia-style labels
export const activityConfig: Record<string, { icon: typeof Sword; label: string; color: string }> = {
  hunt: { icon: Target, label: '⚔ Hunting', color: 'bg-primary/15 text-primary border-primary/30' },
  war: { icon: Swords, label: '🔥 War', color: 'bg-offline/15 text-offline border-offline/30' },
  maker: { icon: Hammer, label: '🔨 Maker', color: 'bg-afk/15 text-afk border-afk/30' },
  boss: { icon: Skull, label: '💀 Boss', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
};

// Export SPRITE for direct access
export { SPRITE };
