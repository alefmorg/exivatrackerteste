import { Sword, Swords, Shield, Skull, Hammer, Crosshair, Heart, Wand2, Target } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';

const TIBIA_OUTFIT_BASE = 'https://static.tibia.com/data/outfits';

// Tibia sprite URLs for vocations
const TIBIA_VOC_SPRITES: Record<string, string> = {
  knight: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Outfit_Knight_Male.gif',
  paladin: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Outfit_Paladin_Male.gif',
  druid: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Outfit_Druid_Male.gif',
  sorcerer: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Outfit_Mage_Male.gif',
};

// Tibia item sprites for activities
const TIBIA_ACTIVITY_SPRITES: Record<string, string> = {
  hunt: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Enchanted_Spear.gif',
  war: 'https://tibia.fandom.com/wiki/Special:Redirect/file/War_Axe.gif',
  maker: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Wand_of_Vortex.gif',
  boss: 'https://tibia.fandom.com/wiki/Special:Redirect/file/Demon_Helmet.gif',
};

// Map Tibia vocations to icons
export const VocationIcon = ({ vocation, className = "h-4 w-4" }: { vocation: string; className?: string }) => {
  const settings = useSettings();
  const voc = vocation.toLowerCase();

  if (settings.iconPack === 'tibia') {
    const key = Object.keys(TIBIA_VOC_SPRITES).find(k => voc.includes(k));
    if (key) {
      return <img src={TIBIA_VOC_SPRITES[key]} alt={vocation} className={`${className} object-contain inline-block`} style={{ imageRendering: 'pixelated' }} />;
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

  if (settings.iconPack === 'tibia' && TIBIA_ACTIVITY_SPRITES[activity]) {
    return <img src={TIBIA_ACTIVITY_SPRITES[activity]} alt={activity} className={`${className} object-contain inline-block`} style={{ imageRendering: 'pixelated' }} />;
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

// Activity config with Tibia-style labels
export const activityConfig: Record<string, { icon: typeof Sword; label: string; color: string }> = {
  hunt: { icon: Target, label: '⚔ Hunting', color: 'bg-primary/15 text-primary border-primary/30' },
  war: { icon: Swords, label: '🔥 War', color: 'bg-offline/15 text-offline border-offline/30' },
  maker: { icon: Hammer, label: '🔨 Maker', color: 'bg-afk/15 text-afk border-afk/30' },
  boss: { icon: Skull, label: '💀 Boss', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
};
