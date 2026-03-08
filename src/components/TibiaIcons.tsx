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
  wand_of_cosmic_energy: { path: '/sprites/wand_of_cosmic_energy.gif', label: 'Wand of Cosmic Energy', category: 'Varinhas' },
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
  golden_mug: { path: '/sprites/golden_mug.gif', label: 'Golden Mug', category: 'Items' },
  stuffed_dragon: { path: '/sprites/stuffed_dragon.gif', label: 'Stuffed Dragon', category: 'Fansite' },
  medal_of_honour: { path: '/sprites/medal_of_honour.gif', label: 'Medal of Honour', category: 'Fansite' },
  frozen_starlight: { path: '/sprites/frozen_starlight.gif', label: 'Frozen Starlight', category: 'Fansite' },
  enchanted_chicken_wing: { path: '/sprites/enchanted_chicken_wing.gif', label: 'Enchanted Chicken Wing', category: 'Items' },
  blessed_steak: { path: '/sprites/blessed_steak.gif', label: 'Blessed Steak', category: 'Items' },
  fireworks_rocket: { path: '/sprites/fireworks_rocket.gif', label: 'Fireworks Rocket', category: 'Items' },
  cream_cake: { path: '/sprites/cream_cake.gif', label: 'Cream Cake', category: 'Items' },
  surprise_bag_red: { path: '/sprites/surprise_bag_red.gif', label: 'Surprise Bag (Red)', category: 'Items' },
  backpack_of_holding: { path: '/sprites/backpack_of_holding.gif', label: 'Backpack of Holding', category: 'Mochilas' },
  golden_backpack: { path: '/sprites/golden_backpack.gif', label: 'Golden Backpack', category: 'Mochilas' },
  heart_backpack: { path: '/sprites/heart_backpack.gif', label: 'Heart Backpack', category: 'Mochilas' },
  boots_of_haste: { path: '/sprites/boots_of_haste.gif', label: 'Boots of Haste', category: 'Equipamentos' },
  golden_legs: { path: '/sprites/golden_legs.gif', label: 'Golden Legs', category: 'Equipamentos' },
  golden_helmet: { path: '/sprites/golden_helmet.gif', label: 'Golden Helmet', category: 'Equipamentos' },
  winged_helmet: { path: '/sprites/winged_helmet.gif', label: 'Winged Helmet', category: 'Equipamentos' },
  blue_robe: { path: '/sprites/blue_robe.gif', label: 'Blue Robe', category: 'Equipamentos' },
  vampire_shield: { path: '/sprites/vampire_shield.gif', label: 'Vampire Shield', category: 'Escudos' },
  dragon_shield: { path: '/sprites/dragon_shield.gif', label: 'Dragon Shield', category: 'Escudos' },
  demon_shield: { path: '/sprites/demon_shield.gif', label: 'Demon Shield', category: 'Escudos' },
  ornamented_shield: { path: '/sprites/ornamented_shield.gif', label: 'Ornamented Shield', category: 'Escudos' },
  shield_of_honour: { path: '/sprites/shield_of_honour.gif', label: 'Shield of Honour', category: 'Escudos' },
  ruthless_axe: { path: '/sprites/ruthless_axe.gif', label: 'Ruthless Axe', category: 'Machados' },
  amulet_of_loss: { path: '/sprites/amulet_of_loss.gif', label: 'Amulet of Loss', category: 'Anéis' },
  emerald_bangle: { path: '/sprites/emerald_bangle.gif', label: 'Emerald Bangle', category: 'Anéis' },
  ring_of_the_sky: { path: '/sprites/ring_of_the_sky.gif', label: 'Ring of the Sky', category: 'Anéis' },
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
  // Outfits (base)
  outfit_knight: { path: '/sprites/outfit_knight.gif', label: 'Citizen (Knight)', category: 'Outfits' },
  outfit_paladin: { path: '/sprites/outfit_paladin.gif', label: 'Hunter (Paladin)', category: 'Outfits' },
  outfit_druid: { path: '/sprites/outfit_druid.gif', label: 'Summoner (Druid)', category: 'Outfits' },
  outfit_sorcerer: { path: '/sprites/outfit_sorcerer.gif', label: 'Mage (Sorcerer)', category: 'Outfits' },
  // Outfits (full addons)
  outfit_assassin_full: { path: '/sprites/outfit_assassin_full.gif', label: 'Assassin (Full)', category: 'Outfits' },
  outfit_barbarian_full: { path: '/sprites/outfit_barbarian_full.gif', label: 'Barbarian (Full)', category: 'Outfits' },
  outfit_arena_champion_full: { path: '/sprites/outfit_arena_champion_full.gif', label: 'Arena Champion (Full)', category: 'Outfits' },
  outfit_battle_mage_full: { path: '/sprites/outfit_battle_mage_full.gif', label: 'Battle Mage (Full)', category: 'Outfits' },
  outfit_bat_knight_full: { path: '/sprites/outfit_bat_knight_full.gif', label: 'Bat Knight (Full)', category: 'Outfits' },
  outfit_aerial_disciple_full: { path: '/sprites/outfit_aerial_disciple_full.gif', label: 'Aerial Disciple (Full)', category: 'Outfits' },
  outfit_arbalester_full: { path: '/sprites/outfit_arbalester_full.gif', label: 'Arbalester (Full)', category: 'Outfits' },
  outfit_armoured_archer_full: { path: '/sprites/outfit_armoured_archer_full.gif', label: 'Armoured Archer (Full)', category: 'Outfits' },
  outfit_ancient_aucar_full: { path: '/sprites/outfit_ancient_aucar_full.gif', label: 'Ancient Aucar (Full)', category: 'Outfits' },
  outfit_afflicted_full: { path: '/sprites/outfit_afflicted_full.gif', label: 'Afflicted (Full)', category: 'Outfits' },
  outfit_beastmaster_full: { path: '/sprites/outfit_beastmaster_full.gif', label: 'Beastmaster (Full)', category: 'Outfits' },
  outfit_blade_dancer_full: { path: '/sprites/outfit_blade_dancer_full.gif', label: 'Blade Dancer (Full)', category: 'Outfits' },
  outfit_breezy_garb_full: { path: '/sprites/outfit_breezy_garb_full.gif', label: 'Breezy Garb (Full)', category: 'Outfits' },
  outfit_beekeeper_full: { path: '/sprites/outfit_beekeeper_full.gif', label: 'Beekeeper (Full)', category: 'Outfits' },
  outfit_beggar_full: { path: '/sprites/outfit_beggar_full.gif', label: 'Beggar (Full)', category: 'Outfits' },
  // Fansite Items
  heavily_bound_book: { path: '/sprites/heavily_bound_book.gif', label: 'Heavily Bound Book', category: 'Fansite' },
  abacus: { path: '/sprites/abacus.gif', label: 'Abacus', category: 'Fansite' },
  adamant_shield: { path: '/sprites/adamant_shield.gif', label: 'Adamant Shield', category: 'Fansite' },
  armillary_sphere: { path: '/sprites/armillary_sphere.gif', label: 'Armillary Sphere', category: 'Fansite' },
  auroras_collection: { path: '/sprites/auroras_collection.gif', label: "Aurora's Collection", category: 'Fansite' },
  aylie: { path: '/sprites/aylie.gif', label: 'Aylie', category: 'Fansite' },
  baby_munster: { path: '/sprites/baby_munster.gif', label: 'Baby Munster', category: 'Fansite' },
  banor_doll: { path: '/sprites/banor_doll.gif', label: 'Banor Doll', category: 'Fansite' },
  bard_doll: { path: '/sprites/bard_doll.gif', label: 'Bard Doll', category: 'Fansite' },
  beaver_of_wisdom: { path: '/sprites/beaver_of_wisdom.gif', label: 'Beaver of Wisdom', category: 'Fansite' },
  bella_bonecrusher_doll: { path: '/sprites/bella_bonecrusher_doll.gif', label: "Bella Bonecrusher's Doll", category: 'Fansite' },
  black_knight_doll: { path: '/sprites/black_knight_doll.gif', label: 'Black Knight Doll', category: 'Fansite' },
  bonelord_tome: { path: '/sprites/bonelord_tome.gif', label: 'Bonelord Tome', category: 'Fansite' },
  bookworm_doll: { path: '/sprites/bookworm_doll.gif', label: 'Bookworm Doll', category: 'Fansite' },
  assassin_doll: { path: '/sprites/assassin_doll.gif', label: 'Assassin Doll', category: 'Fansite' },
  crunors_heart: { path: '/sprites/crunors_heart.gif', label: "Crunor's Heart", category: 'Fansite' },
  dark_oracle: { path: '/sprites/dark_oracle.gif', label: 'Dark Oracle', category: 'Fansite' },
  dark_wizards_crown: { path: '/sprites/dark_wizards_crown.gif', label: "Dark Wizard's Crown", category: 'Fansite' },
  dragon_eye: { path: '/sprites/dragon_eye.gif', label: 'Dragon Eye', category: 'Fansite' },
  dragon_goblet: { path: '/sprites/dragon_goblet.gif', label: 'Dragon Goblet', category: 'Fansite' },
  draken_doll: { path: '/sprites/draken_doll.gif', label: 'Draken Doll', category: 'Fansite' },
  draptor_doll: { path: '/sprites/draptor_doll.gif', label: 'Draptor Doll', category: 'Fansite' },
  duality_doll: { path: '/sprites/duality_doll.gif', label: 'Duality Doll', category: 'Fansite' },
  ferumbras_doll: { path: '/sprites/ferumbras_doll.gif', label: 'Ferumbras Doll', category: 'Fansite' },
  friendship_amulet: { path: '/sprites/friendship_amulet.gif', label: 'Friendship Amulet', category: 'Fansite' },
  frozen_heart: { path: '/sprites/frozen_heart.gif', label: 'Frozen Heart', category: 'Fansite' },
  evora: { path: '/sprites/evora.gif', label: 'Evora', category: 'Fansite' },
  citizen_doll: { path: '/sprites/citizen_doll.gif', label: 'Citizen Doll', category: 'Fansite' },
  durin_doll: { path: '/sprites/durin_doll.gif', label: 'Doll of Durin', category: 'Fansite' },
  // Fansite Items (batch 2)
  golden_falcon: { path: '/sprites/golden_falcon.gif', label: 'Golden Falcon', category: 'Fansite' },
  golden_newspaper: { path: '/sprites/golden_newspaper.gif', label: 'Golden Newspaper', category: 'Fansite' },
  goromaphone: { path: '/sprites/goromaphone.gif', label: 'Goromaphone', category: 'Fansite' },
  imortus: { path: '/sprites/imortus.gif', label: 'Imortus', category: 'Fansite' },
  jade_amulet: { path: '/sprites/jade_amulet.gif', label: 'Jade Amulet', category: 'Fansite' },
  journal_shield: { path: '/sprites/journal_shield.gif', label: 'Journal Shield', category: 'Fansite' },
  key_of_numerous_locks: { path: '/sprites/key_of_numerous_locks.gif', label: 'Key of Numerous Locks', category: 'Fansite' },
  loremaster_doll: { path: '/sprites/loremaster_doll.gif', label: 'Loremaster Doll', category: 'Fansite' },
  lucky_clover_amulet: { path: '/sprites/lucky_clover_amulet.gif', label: 'Lucky Clover Amulet', category: 'Fansite' },
  magic_hat: { path: '/sprites/magic_hat.gif', label: 'Magic Hat', category: 'Fansite' },
  majestic_shield: { path: '/sprites/majestic_shield.gif', label: 'Majestic Shield', category: 'Fansite' },
  mathmaster_shield: { path: '/sprites/mathmaster_shield.gif', label: 'Mathmaster Shield', category: 'Fansite' },
  love_elixir: { path: '/sprites/love_elixir.gif', label: 'Love Elixir', category: 'Fansite' },
  luna: { path: '/sprites/luna.gif', label: 'Luna', category: 'Fansite' },
  dread_doll: { path: '/sprites/dread_doll.gif', label: 'Dread Doll', category: 'Fansite' },
  little_adventurer_doll: { path: '/sprites/little_adventurer_doll.gif', label: 'Little Adventurer Doll', category: 'Fansite' },
  epaminondas_doll: { path: '/sprites/epaminondas_doll.gif', label: 'Epaminondas Doll', category: 'Fansite' },
  hand_puppets: { path: '/sprites/hand_puppets.gif', label: 'Hand Puppets', category: 'Fansite' },
  medusa_skull: { path: '/sprites/medusa_skull.gif', label: 'Medusa Skull', category: 'Fansite' },
  midnight_panther_doll: { path: '/sprites/midnight_panther_doll.gif', label: 'Midnight Panther Doll', category: 'Fansite' },
  mini_nabbot: { path: '/sprites/mini_nabbot.gif', label: 'Mini NabBot', category: 'Fansite' },
  nightmare_doll: { path: '/sprites/nightmare_doll.gif', label: 'Nightmare Doll', category: 'Fansite' },
  noble_sword: { path: '/sprites/noble_sword.gif', label: 'Noble Sword', category: 'Fansite' },
  norseman_doll: { path: '/sprites/norseman_doll.gif', label: 'Norseman Doll', category: 'Fansite' },
  omniscient_owl: { path: '/sprites/omniscient_owl.gif', label: 'Omniscient Owl', category: 'Fansite' },
  orcs_jaw_shredder: { path: '/sprites/orcs_jaw_shredder.gif', label: "Orc's Jaw Shredder", category: 'Fansite' },
  phoenix_statue: { path: '/sprites/phoenix_statue.gif', label: 'Phoenix Statue', category: 'Fansite' },
  shield_of_destiny: { path: '/sprites/shield_of_destiny.gif', label: 'Shield of Destiny', category: 'Fansite' },
  scroll_stolen_moment: { path: '/sprites/scroll_stolen_moment.gif', label: 'Scroll of the Stolen Moment', category: 'Fansite' },
  pigeon_trophy: { path: '/sprites/pigeon_trophy.gif', label: 'Pigeon Trophy', category: 'Fansite' },
  music_box: { path: '/sprites/music_box.gif', label: 'Music Box', category: 'Fansite' },
  memory_box: { path: '/sprites/memory_box.gif', label: 'Memory Box', category: 'Fansite' },
  shield_of_endless_search: { path: '/sprites/shield_of_endless_search.gif', label: 'Shield of Endless Search', category: 'Fansite' },
  dragon_spirit: { path: '/sprites/dragon_spirit.gif', label: 'The Dragon Spirit', category: 'Fansite' },
  epic_wisdom: { path: '/sprites/epic_wisdom.gif', label: 'The Epic Wisdom', category: 'Fansite' },
  gods_twilight_doll: { path: '/sprites/gods_twilight_doll.gif', label: "The Gods' Twilight Doll", category: 'Fansite' },
  mexcalibur: { path: '/sprites/mexcalibur.gif', label: 'The Mexcalibur', category: 'Fansite' },
  war_backpack: { path: '/sprites/war_backpack.gif', label: 'War Backpack', category: 'Fansite' },
  white_lion_doll: { path: '/sprites/white_lion_doll.gif', label: 'White Lion Doll', category: 'Fansite' },
  wicked_witch: { path: '/sprites/wicked_witch.gif', label: 'Wicked Witch', category: 'Fansite' },
  tibiahispano_emblem: { path: '/sprites/tibiahispano_emblem.gif', label: 'TibiaHispano Emblem', category: 'Fansite' },
  tibiapedia: { path: '/sprites/tibiapedia.gif', label: 'Tibiapedia', category: 'Fansite' },
  tibioras_box: { path: '/sprites/tibioras_box.gif', label: "Tibiora's Box", category: 'Fansite' },
  tibiacity_encyclopedia: { path: '/sprites/tibiacity_encyclopedia.gif', label: 'Tibiacity Encyclopedia', category: 'Fansite' },
  old_radio: { path: '/sprites/old_radio.gif', label: 'Old Radio', category: 'Fansite' },
  // Outfits (batch 2)
  outfit_brotherhood_full: { path: '/sprites/outfit_brotherhood_full.gif', label: 'Brotherhood (Full)', category: 'Outfits' },
  outfit_cave_explorer_full: { path: '/sprites/outfit_cave_explorer_full.gif', label: 'Cave Explorer (Full)', category: 'Outfits' },
  outfit_celestial_avenger_full: { path: '/sprites/outfit_celestial_avenger_full.gif', label: 'Celestial Avenger (Full)', category: 'Outfits' },
  outfit_champion_full: { path: '/sprites/outfit_champion_full.gif', label: 'Champion (Full)', category: 'Outfits' },
  outfit_chaos_acolyte_full: { path: '/sprites/outfit_chaos_acolyte_full.gif', label: 'Chaos Acolyte (Full)', category: 'Outfits' },
  outfit_ceremonial_garb_full: { path: '/sprites/outfit_ceremonial_garb_full.gif', label: 'Ceremonial Garb (Full)', category: 'Outfits' },
  outfit_citizen_full: { path: '/sprites/outfit_citizen_full.gif', label: 'Citizen (Full)', category: 'Outfits' },
  outfit_conjurer_full: { path: '/sprites/outfit_conjurer_full.gif', label: 'Conjurer (Full)', category: 'Outfits' },
  outfit_crystal_warlord_full: { path: '/sprites/outfit_crystal_warlord_full.gif', label: 'Crystal Warlord (Full)', category: 'Outfits' },
  outfit_darklight_evoker_full: { path: '/sprites/outfit_darklight_evoker_full.gif', label: 'Darklight Evoker (Full)', category: 'Outfits' },
  outfit_citizen_issavi_full: { path: '/sprites/outfit_citizen_issavi_full.gif', label: 'Citizen of Issavi (Full)', category: 'Outfits' },
};

// ============================================================
// Default icon assignments (slot → sprite key)
// ============================================================

export const DEFAULT_ICON_MAP: Record<string, string> = {
  // Nav
  nav_dashboard: 'almanac_of_magic',
  nav_exiva: 'crystal_ball',
  nav_bonecos: 'golden_figurine',
  nav_relatorio: 'old_parchment',
  nav_mapa: 'compass',
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
  // Actions & UI elements
  action_globe: 'globe',
  action_quest: 'old_parchment',
  action_guild: 'war_horn',
  action_scroll: 'parchment',
  action_refresh: 'hourglass',
  action_star: 'gold_ingot',
  action_filter: 'small_sapphire',
  action_add: 'small_emerald',
  action_delete: 'sudden_death_rune',
  action_edit: 'quill',
  action_search: 'crystal_ball',
  action_note: 'parchment',
  action_location: 'compass',
  action_clock: 'watch',
  action_copy: 'parchment',
  action_calendar: 'watch',
  action_key: 'parchment',
  action_shield: 'mastermind_shield',
  action_user: 'skull',
  // Vocations
  voc_knight: 'outfit_knight',
  voc_paladin: 'outfit_paladin',
  voc_druid: 'outfit_druid',
  voc_sorcerer: 'outfit_sorcerer',
  // Activities
  act_hunt: 'enchanted_spear',
  act_war: 'war_axe',
  act_maker: 'wand_of_vortex',
  act_boss: 'demon_helmet',
  // Login/Logout actions (separate from status)
  action_login: 'green_gem',
  action_logout: 'red_gem',
  // Menu
  action_signout: 'death_ring',
};

// Customizable icon slots with labels
export const ICON_SLOTS: { key: string; label: string; group: string }[] = [
  // Nav
  { key: 'nav_dashboard', label: 'Dashboard', group: 'Navegação' },
  { key: 'nav_exiva', label: 'Exiva', group: 'Navegação' },
  { key: 'nav_bonecos', label: 'Bonecos', group: 'Navegação' },
  { key: 'nav_relatorio', label: 'Relatório', group: 'Navegação' },
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
  // Actions & UI elements
  { key: 'action_globe', label: 'Globo / Mundo', group: 'Ações' },
  { key: 'action_quest', label: 'Quest', group: 'Ações' },
  { key: 'action_guild', label: 'Guild', group: 'Ações' },
  { key: 'action_scroll', label: 'Scroll', group: 'Ações' },
  { key: 'action_refresh', label: 'Refresh', group: 'Ações' },
  { key: 'action_star', label: 'Estrela', group: 'Ações' },
  { key: 'action_filter', label: 'Filtro', group: 'Ações' },
  { key: 'action_add', label: 'Adicionar', group: 'Ações' },
  { key: 'action_delete', label: 'Deletar', group: 'Ações' },
  { key: 'action_edit', label: 'Editar', group: 'Ações' },
  { key: 'action_search', label: 'Buscar', group: 'Ações' },
  { key: 'action_note', label: 'Nota', group: 'Ações' },
  { key: 'action_location', label: 'Localização', group: 'Ações' },
  { key: 'action_clock', label: 'Relógio', group: 'Ações' },
  { key: 'action_copy', label: 'Copiar', group: 'Ações' },
  { key: 'action_calendar', label: 'Calendário', group: 'Ações' },
  { key: 'action_key', label: 'Chave', group: 'Ações' },
  { key: 'action_shield', label: 'Escudo', group: 'Ações' },
  { key: 'action_user', label: 'Pessoa', group: 'Ações' },
  // Vocations
  { key: 'voc_knight', label: 'Knight', group: 'Vocações' },
  { key: 'voc_paladin', label: 'Paladin', group: 'Vocações' },
  { key: 'voc_druid', label: 'Druid', group: 'Vocações' },
  { key: 'voc_sorcerer', label: 'Sorcerer', group: 'Vocações' },
  // Activities
  { key: 'act_hunt', label: 'Hunt', group: 'Atividades' },
  { key: 'act_war', label: 'War', group: 'Atividades' },
  { key: 'act_maker', label: 'Maker', group: 'Atividades' },
  { key: 'act_boss', label: 'Boss', group: 'Atividades' },
  // Login/Logout
  { key: 'action_login', label: 'Login (Pegar)', group: 'Ações' },
  { key: 'action_logout', label: 'Logout (Devolver)', group: 'Ações' },
  { key: 'action_signout', label: 'Sair (Menu)', group: 'Ações' },
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

// Helper to get vocation/activity sprite from customIcons
function getVocSpritePath(vocKey: string, customIcons?: Record<string, string>): string {
  const slotKey = `voc_${vocKey}`;
  const spriteKey = customIcons?.[slotKey] || DEFAULT_ICON_MAP[slotKey];
  if (spriteKey && ALL_SPRITES[spriteKey]) return ALL_SPRITES[spriteKey].path;
  return SPRITE.vocation[vocKey as keyof typeof SPRITE.vocation] || '/sprites/outfit_knight.gif';
}

function getActSpritePath(actKey: string, customIcons?: Record<string, string>): string {
  const slotKey = `act_${actKey}`;
  const spriteKey = customIcons?.[slotKey] || DEFAULT_ICON_MAP[slotKey];
  if (spriteKey && ALL_SPRITES[spriteKey]) return ALL_SPRITES[spriteKey].path;
  return SPRITE.activity[actKey as keyof typeof SPRITE.activity] || '/sprites/parchment.gif';
}

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
    relatorio: 'nav_relatorio',
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
    login: 'action_login',
    logout: 'action_logout',
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
  // Secondary slot map for action/misc icons
  const actionSlotMap: Record<string, string> = {
    globe: 'action_globe',
    quest: 'action_quest',
    guild: 'action_guild',
    scroll: 'action_scroll',
    key: 'action_key',
    copy: 'action_copy',
    refresh: 'action_refresh',
    star: 'action_star',
    filter: 'action_filter',
    add: 'action_add',
    delete: 'action_delete',
    edit: 'action_edit',
    search: 'action_search',
    note: 'action_note',
    location: 'action_location',
    clock: 'action_clock',
    calendar: 'action_calendar',
    shield: 'action_shield',
    user: 'action_user',
    dashboard: 'nav_dashboard',
    history: 'nav_history',
    settings: 'nav_settings',
    users: 'nav_users',
    bonecos: 'nav_bonecos',
    signout: 'action_signout',
  };
  const actionSlot = actionSlotMap[item];
  if (actionSlot) return <SlotSprite slot={actionSlot} className={className} />;
  return <TibiaSprite src="/sprites/parchment.gif" alt={item} className={className} />;
}

// Map Tibia vocations to icons
export const VocationIcon = ({ vocation, className = "h-5 w-5" }: { vocation: string; className?: string }) => {
  const settings = useSettings();
  const voc = vocation.toLowerCase();
  const key = Object.keys(SPRITE.vocation).find(k => voc.includes(k)) as keyof typeof SPRITE.vocation | undefined;

  if (settings.iconPack === 'tibia' || Object.keys(settings.customIcons).some(k => k.startsWith('voc_'))) {
    if (key) {
      return <TibiaSprite src={getVocSpritePath(key, settings.customIcons)} alt={vocation} className={className} />;
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

  if (settings.iconPack === 'tibia' || Object.keys(settings.customIcons).some(k => k.startsWith('act_'))) {
    if (SPRITE.activity[activity as keyof typeof SPRITE.activity]) {
      return <TibiaSprite src={getActSpritePath(activity, settings.customIcons)} alt={activity} className={className} />;
    }
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
