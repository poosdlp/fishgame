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

export function CaughtFish({ fish, onReset }: Props) {
  return (
    <div style={{ color: "white" }}>
      <h2>You caught a fish!</h2>
      {fish && (
        <div>
          <p style={{ fontWeight: "bold" }}>{fish.name}</p>
          <p>📏 {fish.length} cm</p>
          <p>⚖️ {fish.weight === "how rude to ask" ? "???" : `${fish.weight} kg`}</p>
          <p>⭐ {fish.points} pts</p>
        </div>
      )}
      <button onClick={onReset}>Done</button>
    </div>
  );
}
