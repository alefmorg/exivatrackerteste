import { Sword, Swords, Shield, Skull, Hammer, Crosshair, Heart, Wand2, Target } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';

// ============================================================
// Tibia Sprite URLs — using TibiaWiki fandom redirect (reliable)
// ============================================================

const SPRITE = {
  // Vocations (outfit GIFs)
  vocation: {
    knight: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Outfit_Citizen_Male_Addon_3.gif',
    paladin: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Outfit_Hunter_Male_Addon_3.gif',
    druid: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Outfit_Summoner_Male_Addon_3.gif',
    sorcerer: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Outfit_Mage_Male_Addon_3.gif',
  },
  // Activities (item GIFs)
  activity: {
    hunt: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Enchanted_Spear.gif',
    war: 'https://tibia.fandom.com/wiki/Special:Redirect/file/War_Axe.gif',
    maker: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Wand_of_Vortex.gif',
    boss: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Demon_Helmet.gif',
  },
  // Items & UI
  items: {
    tibiaCoin: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Tibia_Coin.gif',
    premiumScroll: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Premium_Scroll.gif',
    bless: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Ankh.gif',
    magicLevel: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Spellbook.gif',
    sword: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Magic_Plate_Armor.gif',
    shield: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Blessed_Shield.gif',
    distance: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Royal_Crossbow.gif',
    club: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Cranial_Basher.gif',
    axe: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Stonecutter_Axe.gif',
    fist: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Pair_of_Iron_Fists.gif',
    shielding: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Mastermind_Shield.gif',
    key: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Key_0000.gif',
    quest: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Old_Parchment_%28Brown%29.gif',
    skull: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Skull.gif',
    guild: 'https://tibia.fandom.com/wiki/Special:Redirect/file/War_Horn.gif',
    globe: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Globe.gif',
    login: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Green_Gem.gif',
    logout: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Red_Gem.gif',
    online: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Green_Gem.gif',
    offline: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Red_Gem.gif',
    afk: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Yellow_Gem.gif',
    scroll: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Parchment.gif',
    settings: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Mechanical_Fishing_Rod.gif',
    dashboard: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Almanac_of_Magic.gif',
    history: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Book_%28Erta%29.gif',
    users: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Ring_of_Ending.gif',
    exiva: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Crystal_Ball.gif',
    bonecos: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Golden_Figurine.gif',
    email: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Letter.gif',
    password: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Key_0555.gif',
    token2fa: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Ferumbras%27_Hat.gif',
    copy: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Parchment.gif',
    refresh: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Hourglass.gif',
    live: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Might_Ring.gif',
    star: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Gold_Ingot.gif',
    crown: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Crown.gif',
    filter: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Small_Sapphire.gif',
    add: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Small_Emerald.gif',
    delete: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Sudden_Death_Rune.gif',
    edit: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Quill.gif',
    search: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Crystal_Ball.gif',
    note: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Document_%28Technical_Issues%29.gif',
    location: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Compass.gif',
    clock: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Watch.gif',
    level: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Experience_Charm.gif',
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
