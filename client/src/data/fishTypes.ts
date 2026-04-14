export type FishRarity = "common" | "uncommon" | "rare" | "legendary" | "mythical" | "the one that got away";

export type FishTemplate =
  | {
      name: string;
      rarity: "common" | "uncommon" | "rare" | "legendary" | "mythical";
      image: string;
    }
  | {
      name: string;
      rarity: "the one that got away";
      length: number;
      weight: "how rude to ask";
      points: number;
      image: string;
    };

export const fishTypes: FishTemplate[] = [
  { name: "Salmon",      rarity: "common",    image: "/tempfish.png" },
  { name: "Bass",        rarity: "common",    image: "/tempfish.png" },
  { name: "Tuna",        rarity: "uncommon",  image: "/tempfish.png" },
  { name: "Pufferfish",  rarity: "rare",      image: "/tempfish.png" },
  { name: "Anglerfish",  rarity: "rare",      image: "/tempfish.png" },
  { name: "Golden Koi",  rarity: "legendary", image: "/tempfish.png" },
  { name: "Dragonfish",  rarity: "mythical",  image: "/tempfish.png" },
  { name: "livia fish",  rarity: "the one that got away", length: 170, weight: "how rude to ask", points: 999, image: "/tempfish.png" },
  { name: "axel fish",   rarity: "the one that got away", length: 150, weight: "how rude to ask", points: 999, image: "/tempfish.png" },
  { name: "marcus fish", rarity: "the one that got away", length: 160, weight: "how rude to ask", points: 999, image: "/tempfish.png" },
  { name: "jake fish",   rarity: "the one that got away", length: 140, weight: "how rude to ask", points: 999, image: "/tempfish.png" },
  { name: "josh fish",   rarity: "the one that got away", length: 180, weight: "how rude to ask", points: 999, image: "/tempfish.png" },
];
