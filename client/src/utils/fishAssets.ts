export type FishRarity = 'common' | 'uncommon' | 'rare' | 'legendary' | 'mythical' | 'the one that got away';

export type FishAsset = {
  name: string;
  rarity: FishRarity;
  imagePath: string;
  lengthRange?: [number, number];
  weightRange?: [number, number];
  fixedLength?: number;
  fixedWeight?: number | 'how rude to ask';
};

export const fishAssets: FishAsset[] = [
  { name: 'Salmon', rarity: 'common', imagePath: '/fish/salmon.png', lengthRange: [20, 59], weightRange: [1, 30] },
  { name: 'Tuna', rarity: 'uncommon', imagePath: '/fish/tuna.png', lengthRange: [30, 79], weightRange: [2, 40] },
  { name: 'Bass', rarity: 'common', imagePath: '/fish/bass.png', lengthRange: [20, 59], weightRange: [1, 30] },
  { name: 'Pufferfish', rarity: 'rare', imagePath: '/fish/pufferfish.png', lengthRange: [40, 99], weightRange: [3, 50] },
  { name: 'Anglerfish', rarity: 'rare', imagePath: '/fish/anglerfish.png', lengthRange: [40, 99], weightRange: [3, 50] },
  { name: 'Golden Koi', rarity: 'legendary', imagePath: '/fish/goldenkoi.png', lengthRange: [50, 129], weightRange: [4, 70] },
  { name: 'Dragonfish', rarity: 'mythical', imagePath: '/fish/dragonfish.png', lengthRange: [60, 139], weightRange: [5, 90] },
  { name: 'livia fish', rarity: 'the one that got away', imagePath: '/fish/livfish.png', fixedLength: 170, fixedWeight: 'how rude to ask' },
  { name: 'axel fish', rarity: 'the one that got away', imagePath: '/fish/axelfish.png', fixedLength: 177, fixedWeight: 'how rude to ask' },
  { name: 'marcus fish', rarity: 'the one that got away', imagePath: '/fish/marcusfish.png', fixedLength: 180, fixedWeight: 'how rude to ask' },
  { name: 'jake fish', rarity: 'the one that got away', imagePath: '/fish/jakefish.jpeg', fixedLength: 187, fixedWeight: 'how rude to ask' },
  { name: 'josh fish', rarity: 'the one that got away', imagePath: '/fish/joshfish.png', fixedLength: 180, fixedWeight: 'how rude to ask' },
];

export function getFishAssetByName(name: string): FishAsset | undefined {
  return fishAssets.find(asset => asset.name === name);
}

export function getRandomFishAsset(): FishAsset {
  const roll = Math.random();
  let pool: FishAsset[];

  if (roll < 0.6) {
    pool = fishAssets.filter(f => f.rarity === 'common');
  } else if (roll < 0.75) {
    pool = fishAssets.filter(f => f.rarity === 'uncommon');
  } else if (roll < 0.87) {
    pool = fishAssets.filter(f => f.rarity === 'rare');
  } else if (roll < 0.9) {
    pool = fishAssets.filter(f => f.rarity === 'legendary');
  } else if (roll < 0.99) {
    pool = fishAssets.filter(f => f.rarity === 'mythical');
  } else {
    pool = fishAssets.filter(f => f.rarity === 'the one that got away');
  }

  return pool[Math.floor(Math.random() * pool.length)];
}
