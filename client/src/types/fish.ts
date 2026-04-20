export type GameState = "bite" | "caught" | "waiting"| "none";

export type FishTemplate =
  | {
      name: string;
      rarity: "common" | "uncommon" | "rare" | "legendary" | "mythical";
      journalEntry:string;
    }
  | {
      name: string;
      rarity: "the one that got away";
      length: number;
      weight: "how rude to ask";
      journalEntry:string;
    };

export type FishBehavior = "swimming" | "attracted" | "hovering" | "bite" | "caught";


export type Fishy = {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  behavior: FishBehavior;
  tapCount: number;
  tapCooldown: number;
  requiredTaps: number;
  tapflag:number;


  hX:number;
  hY:number;

};


export type InventoryFish = {
  _id: string;
  name: string;
  rarity: FishTemplate["rarity"];
  weight: number | "how rude to ask";
  length: number;
  journalEntry: string;
  caughtAt: string;
};

export type LeaderboardEntry = {
  username: string;
  totalFish: number;
};

export type RecentCatch = {
  _id: string;
  name: string;
  rarity: FishTemplate["rarity"];
  length: number;
  weight: number | "how rude to ask";
  caughtAt: string;
  username: string;
};

export type LeaderboardTab = "leaderboard" | "recent";
export type inventorytab = "fish" | "journals";




