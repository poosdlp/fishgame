type FishRarity = "common" | "uncommon" | "rare" | "legendary" | "mythical" | "the one that got away";

type CaughtFishData = {
  name: string;
  rarity: FishRarity;
  length: number;
  weight: number | "how rude to ask";
  points: number;
};

type Props = {
  fish: CaughtFishData | null;
  onReset: () => void;
};

const rarityColors: Record<FishRarity, string> = {
  common: "#94a3b8",
  uncommon: "#4ade80",
  rare: "#60a5fa",
  legendary: "#f59e0b",
  mythical: "#c084fc",
  "the one that got away": "#f87171",
};

export function CaughtFish({ fish, onReset }: Props) {
  return (
    <div>
      <h2>You caught a fish!</h2>
      {fish && (
        <div>
          <p style={{ color: rarityColors[fish.rarity], fontWeight: "bold" }}>{fish.name}</p>
          <p>📏 {fish.length} cm</p>
          <p>⚖️ {fish.weight === "how rude to ask" ? "???" : `${fish.weight} kg`}</p>
          <p>⭐ {fish.points} pts</p>
        </div>
      )}
      <button onClick={onReset}>Done</button>
    </div>
  );
}
