import { Sword, Swords, Shield, Skull, Hammer, Crosshair, Heart, Wand2, Target } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';

// ============================================================
// ALL available sprites — used for the sprite picker
// ============================================================

export const ALL_SPRITES: Record<string, { path: string; label: string; category: string }> = {
  // Weapons
  magic_plate_armor: { path: '/sprites/magic_plate_armor.gif', label: 'Magic Plate Armor', category: 'Armaduras' },
  golden_armor: { path: '/sprites/golden_armor.gif', label: 'Golden Armor', category: 'Armaduras' },
  demon_armor: { path: '/sprites/demon_armor.gif', label: 'Demon Armor', category: 'Armaduras' },
  blessed_shield: { path: '/sprites/blessed_shield.gif', label: 'Blessed Shield', category: 'Escudos' },
  great_shield: { path: '/sprites/great_shield.gif', label: 'Great Shield', category: 'Escudos' },
  mastermind_shield: { path: '/sprites/mastermind_shield.gif', label: 'Mastermind Shield', category: 'Escudos' },
  medusa_shield: { path: '/sprites/medusa_shield.gif', label: 'Medusa Shield', category: 'Escudos' },
  magic_shield: { path: '/sprites/magic_shield.gif', label: 'Magic Shield', category: 'Escudos' },
  magic_sword: { path: '/sprites/magic_sword.gif', label: 'Magic Sword', category: 'Espadas' },
  fire_sword: { path: '/sprites/fire_sword.gif', label: 'Fire Sword', category: 'Espadas' },
  giant_sword: { path: '/sprites/giant_sword.gif', label: 'Giant Sword', category: 'Espadas' },
  stonecutter_axe: { path: '/sprites/stonecutter_axe.gif', label: 'Stonecutter Axe', category: 'Machados' },
  fire_axe: { path: '/sprites/fire_axe.gif', label: 'Fire Axe', category: 'Machados' },
  cranial_basher: { path: '/sprites/cranial_basher.gif', label: 'Cranial Basher', category: 'Clavas' },
  thunder_hammer: { path: '/sprites/thunder_hammer.gif', label: 'Thunder Hammer', category: 'Clavas' },
  royal_crossbow: { path: '/sprites/royal_crossbow.gif', label: 'Royal Crossbow', category: 'Distância' },
  crossbow: { path: '/sprites/crossbow.gif', label: 'Crossbow', category: 'Distância' },
  enchanted_spear: { path: '/sprites/enchanted_spear.gif', label: 'Enchanted Spear', category: 'Distância' },
  assassin_star: { path: '/sprites/assassin_star.gif', label: 'Assassin Star', category: 'Distância' },
  pair_of_iron_fists: { path: '/sprites/pair_of_iron_fists.gif', label: 'Iron Fists', category: 'Fist' },
  war_axe: { path: '/sprites/war_axe.gif', label: 'War Axe', category: 'Machados' },
  nightmare_blade: { path: '/sprites/nightmare_blade.gif', label: 'Nightmare Blade', category: 'Espadas' },
  bright_sword: { path: '/sprites/bright_sword.gif', label: 'Bright Sword', category: 'Espadas' },
  serpent_sword: { path: '/sprites/serpent_sword.gif', label: 'Serpent Sword', category: 'Espadas' },
  ice_rapier: { path: '/sprites/ice_rapier.gif', label: 'Ice Rapier', category: 'Espadas' },
  djinn_blade: { path: '/sprites/djinn_blade.gif', label: 'Djinn Blade', category: 'Espadas' },
  magic_longsword: { path: '/sprites/magic_longsword.gif', label: 'Magic Longsword', category: 'Espadas' },
  arcane_staff: { path: '/sprites/arcane_staff.gif', label: 'Arcane Staff', category: 'Clavas' },
  skull_staff: { path: '/sprites/skull_staff.gif', label: 'Skull Staff', category: 'Clavas' },
  hammer_of_wrath: { path: '/sprites/hammer_of_wrath.gif', label: 'Hammer of Wrath', category: 'Clavas' },
  heavy_mace: { path: '/sprites/heavy_mace.gif', label: 'Heavy Mace', category: 'Clavas' },
  obsidian_truncheon: { path: '/sprites/obsidian_truncheon.gif', label: 'Obsidian Truncheon', category: 'Clavas' },
  // Wands/Rods
  wand_of_vortex: { path: '/sprites/wand_of_vortex.gif', label: 'Wand of Vortex', category: 'Varinhas' },
  wand_of_inferno: { path: '/sprites/wand_of_inferno.gif', label: 'Wand of Inferno', category: 'Varinhas' },
  hailstorm_rod: { path: '/sprites/hailstorm_rod.gif', label: 'Hailstorm Rod', category: 'Varinhas' },
  spellbook: { path: '/sprites/spellbook.gif', label: 'Spellbook', category: 'Varinhas' },
  // Items
  tibia_coin: { path: '/sprites/tibia_coin.gif', label: 'Tibia Coin', category: 'Items' },
  gold_ingot: { path: '/sprites/gold_ingot.gif', label: 'Gold Ingot', category: 'Items' },
  crystal_ball: { path: '/sprites/crystal_ball.gif', label: 'Crystal Ball', category: 'Items' },
  golden_figurine: { path: '/sprites/golden_figurine.gif', label: 'Golden Figurine', category: 'Items' },
  skull: { path: '/sprites/skull.gif', label: 'Skull', category: 'Items' },
  ankh: { path: '/sprites/ankh.gif', label: 'Ankh', category: 'Items' },
  premium_scroll: { path: '/sprites/premium_scroll.gif', label: 'Premium Scroll', category: 'Items' },
  crown: { path: '/sprites/crown.gif', label: 'Crown', category: 'Items' },
  demon_helmet: { path: '/sprites/demon_helmet.gif', label: 'Demon Helmet', category: 'Items' },
  mystic_turban: { path: '/sprites/mystic_turban.gif', label: 'Mystic Turban', category: 'Items' },
  soul_orb: { path: '/sprites/soul_orb.gif', label: 'Soul Orb', category: 'Items' },
  demon_trophy: { path: '/sprites/demon_trophy.gif', label: 'Demon Trophy', category: 'Items' },
  ferumbras_hat: { path: '/sprites/ferumbras_hat.gif', label: "Ferumbras' Hat", category: 'Items' },
  hourglass: { path: '/sprites/hourglass.gif', label: 'Hourglass', category: 'Items' },
  compass: { path: '/sprites/compass.gif', label: 'Compass', category: 'Items' },
  watch: { path: '/sprites/watch.gif', label: 'Watch', category: 'Items' },
  globe: { path: '/sprites/globe.gif', label: 'Globe', category: 'Items' },
  letter: { path: '/sprites/letter.gif', label: 'Letter', category: 'Items' },
  parchment: { path: '/sprites/parchment.gif', label: 'Parchment', category: 'Items' },
  old_parchment: { path: '/sprites/old_parchment.gif', label: 'Old Parchment', category: 'Items' },
  quill: { path: '/sprites/quill.gif', label: 'Quill', category: 'Items' },
  almanac_of_magic: { path: '/sprites/almanac_of_magic.gif', label: 'Almanac of Magic', category: 'Items' },
  war_horn: { path: '/sprites/war_horn.gif', label: 'War Horn', category: 'Items' },
  mechanical_fishing_rod: { path: '/sprites/mechanical_fishing_rod.gif', label: 'Mechanical Fishing Rod', category: 'Items' },
  // Gems & Shards
  green_gem: { path: '/sprites/green_gem.gif', label: 'Green Gem', category: 'Gemas' },
  red_gem: { path: '/sprites/red_gem.gif', label: 'Red Gem', category: 'Gemas' },
  yellow_gem: { path: '/sprites/yellow_gem.gif', label: 'Yellow Gem', category: 'Gemas' },
  small_sapphire: { path: '/sprites/small_sapphire.gif', label: 'Small Sapphire', category: 'Gemas' },
  small_emerald: { path: '/sprites/small_emerald.gif', label: 'Small Emerald', category: 'Gemas' },
  blue_crystal_shard: { path: '/sprites/blue_crystal_shard.gif', label: 'Blue Crystal Shard', category: 'Gemas' },
  green_crystal_shard: { path: '/sprites/green_crystal_shard.gif', label: 'Green Crystal Shard', category: 'Gemas' },
  violet_crystal_shard: { path: '/sprites/violet_crystal_shard.gif', label: 'Violet Crystal Shard', category: 'Gemas' },
  // Rings
  might_ring: { path: '/sprites/might_ring.gif', label: 'Might Ring', category: 'Anéis' },
  stealth_ring: { path: '/sprites/stealth_ring.gif', label: 'Stealth Ring', category: 'Anéis' },
  death_ring: { path: '/sprites/death_ring.gif', label: 'Death Ring', category: 'Anéis' },
  life_ring: { path: '/sprites/life_ring.gif', label: 'Life Ring', category: 'Anéis' },
  ring_of_ending: { path: '/sprites/ring_of_ending.gif', label: 'Ring of Ending', category: 'Anéis' },
  // Runes
  sudden_death_rune: { path: '/sprites/sudden_death_rune.gif', label: 'Sudden Death', category: 'Runas' },
  // Outfits
  outfit_knight: { path: '/sprites/outfit_knight.gif', label: 'Citizen (Knight)', category: 'Outfits' },
  outfit_paladin: { path: '/sprites/outfit_paladin.gif', label: 'Hunter (Paladin)', category: 'Outfits' },
  outfit_druid: { path: '/sprites/outfit_druid.gif', label: 'Summoner (Druid)', category: 'Outfits' },
  outfit_sorcerer: { path: '/sprites/outfit_sorcerer.gif', label: 'Mage (Sorcerer)', category: 'Outfits' },
};

// ============================================================
// Default icon assignments (slot → sprite key)
// ============================================================

export const DEFAULT_ICON_MAP: Record<string, string> = {
  // Nav
  nav_dashboard: 'almanac_of_magic',
  nav_exiva: 'crystal_ball',
  nav_bonecos: 'golden_figurine',
  nav_history: 'parchment',
  nav_users: 'ring_of_ending',
  nav_settings: 'mechanical_fishing_rod',
  nav_brand: 'crystal_ball',
  // Status
  status_online: 'green_gem',
  status_offline: 'red_gem',
  status_afk: 'yellow_gem',
  status_live: 'might_ring',
  // UI Actions
  ui_skull: 'skull',
  ui_tibia_coin: 'tibia_coin',
  ui_bless: 'ankh',
  ui_premium: 'premium_scroll',
  ui_level: 'gold_ingot',
  ui_crown: 'crown',
  // Credentials
  cred_email: 'letter',
  cred_password: 'parchment',
  cred_2fa: 'ferumbras_hat',
  // Skills
  skill_magic: 'spellbook',
  skill_sword: 'magic_plate_armor',
  skill_axe: 'stonecutter_axe',
  skill_club: 'cranial_basher',
  skill_distance: 'royal_crossbow',
  skill_shielding: 'mastermind_shield',
  skill_fist: 'pair_of_iron_fists',
};

// Customizable icon slots with labels
export const ICON_SLOTS: { key: string; label: string; group: string }[] = [
  // Nav
  { key: 'nav_dashboard', label: 'Dashboard', group: 'Navegação' },
  { key: 'nav_exiva', label: 'Exiva', group: 'Navegação' },
  { key: 'nav_bonecos', label: 'Bonecos', group: 'Navegação' },
  { key: 'nav_history', label: 'Histórico', group: 'Navegação' },
  { key: 'nav_users', label: 'Usuários', group: 'Navegação' },
  { key: 'nav_settings', label: 'Config', group: 'Navegação' },
  { key: 'nav_brand', label: 'Logo', group: 'Navegação' },
  // Status
  { key: 'status_online', label: 'Online', group: 'Status' },
  { key: 'status_offline', label: 'Offline', group: 'Status' },
  { key: 'status_afk', label: 'AFK', group: 'Status' },
  { key: 'status_live', label: 'LIVE', group: 'Status' },
  // UI
  { key: 'ui_skull', label: 'Usuário', group: 'Interface' },
  { key: 'ui_tibia_coin', label: 'Tibia Coins', group: 'Interface' },
  { key: 'ui_bless', label: 'Bless', group: 'Interface' },
  { key: 'ui_premium', label: 'Premium', group: 'Interface' },
  { key: 'ui_level', label: 'Level', group: 'Interface' },
  { key: 'ui_crown', label: 'Coroa / Admin', group: 'Interface' },
  // Credentials
  { key: 'cred_email', label: 'Email', group: 'Credenciais' },
  { key: 'cred_password', label: 'Senha', group: 'Credenciais' },
  { key: 'cred_2fa', label: '2FA Token', group: 'Credenciais' },
  // Skills
  { key: 'skill_magic', label: 'Magic Level', group: 'Skills' },
  { key: 'skill_sword', label: 'Sword', group: 'Skills' },
  { key: 'skill_axe', label: 'Axe', group: 'Skills' },
  { key: 'skill_club', label: 'Club', group: 'Skills' },
  { key: 'skill_distance', label: 'Distance', group: 'Skills' },
  { key: 'skill_shielding', label: 'Shielding', group: 'Skills' },
  { key: 'skill_fist', label: 'Fist', group: 'Skills' },
];

// ============================================================
// Get the resolved sprite path for a slot
// ============================================================

export function getIconPath(slot: string, customIcons?: Record<string, string>): string {
  const spriteKey = customIcons?.[slot] || DEFAULT_ICON_MAP[slot];
  if (!spriteKey) return '/sprites/parchment.gif';
  return ALL_SPRITES[spriteKey]?.path || '/sprites/parchment.gif';
}

// ============================================================
// Backward compat: SPRITE object using defaults
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
} as const;

// Reusable sprite component
export function TibiaSprite({ 
  src, 
  alt = '', 
  className = 'h-5 w-5',
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

// Slot-based sprite (uses settings customIcons)
export function SlotSprite({ slot, className = 'h-5 w-5' }: { slot: string; className?: string }) {
  const settings = useSettings();
  const path = getIconPath(slot, settings.customIcons);
  return <TibiaSprite src={path} alt={slot} className={className} />;
}

// Nav icon using slot system
export function NavSprite({ spriteKey, className = 'h-5 w-5' }: { spriteKey: string; className?: string }) {
  const slotMap: Record<string, string> = {
    dashboard: 'nav_dashboard',
    exiva: 'nav_exiva',
    bonecos: 'nav_bonecos',
    history: 'nav_history',
    users: 'nav_users',
    settings: 'nav_settings',
  };
  return <SlotSprite slot={slotMap[spriteKey] || spriteKey} className={className} />;
}

// Item sprite using slot system
export function ItemSprite({ item, className = 'h-5 w-5' }: { item: string; className?: string }) {
  const slotMap: Record<string, string> = {
    exiva: 'nav_brand',
    skull: 'ui_skull',
    live: 'status_live',
    tibiaCoin: 'ui_tibia_coin',
    bless: 'ui_bless',
    premiumScroll: 'ui_premium',
    level: 'ui_level',
    crown: 'ui_crown',
    online: 'status_online',
    offline: 'status_offline',
    afk: 'status_afk',
    login: 'status_online',
    logout: 'status_offline',
    email: 'cred_email',
    password: 'cred_password',
    token2fa: 'cred_2fa',
    magicLevel: 'skill_magic',
    sword: 'skill_sword',
    axe: 'skill_axe',
    club: 'skill_club',
    distance: 'skill_distance',
    shielding: 'skill_shielding',
    fist: 'skill_fist',
  };
  const slot = slotMap[item];
  if (slot) return <SlotSprite slot={slot} className={className} />;
  // Fallback to direct sprite path
  const directMap: Record<string, string> = {
    globe: '/sprites/globe.gif',
    quest: '/sprites/old_parchment.gif',
    guild: '/sprites/war_horn.gif',
    scroll: '/sprites/parchment.gif',
    key: '/sprites/parchment.gif',
    copy: '/sprites/parchment.gif',
    refresh: '/sprites/hourglass.gif',
    star: '/sprites/gold_ingot.gif',
    filter: '/sprites/small_sapphire.gif',
    add: '/sprites/small_emerald.gif',
    delete: '/sprites/sudden_death_rune.gif',
    edit: '/sprites/quill.gif',
    search: '/sprites/crystal_ball.gif',
    note: '/sprites/parchment.gif',
    location: '/sprites/compass.gif',
    clock: '/sprites/watch.gif',
    dashboard: '/sprites/almanac_of_magic.gif',
    history: '/sprites/parchment.gif',
    settings: '/sprites/mechanical_fishing_rod.gif',
    users: '/sprites/ring_of_ending.gif',
    bonecos: '/sprites/golden_figurine.gif',
  };
  return <TibiaSprite src={directMap[item] || '/sprites/parchment.gif'} alt={item} className={className} />;
}

// Map Tibia vocations to icons
export const VocationIcon = ({ vocation, className = "h-5 w-5" }: { vocation: string; className?: string }) => {
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
export const ActivityIcon = ({ activity, className = "h-5 w-5" }: { activity: string; className?: string }) => {
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

// Activity config
export const activityConfig: Record<string, { icon: typeof Sword; label: string; color: string }> = {
  hunt: { icon: Target, label: '⚔ Hunting', color: 'bg-primary/15 text-primary border-primary/30' },
  war: { icon: Swords, label: '🔥 War', color: 'bg-offline/15 text-offline border-offline/30' },
  maker: { icon: Hammer, label: '🔨 Maker', color: 'bg-afk/15 text-afk border-afk/30' },
  boss: { icon: Skull, label: '💀 Boss', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
};

export { SPRITE };
