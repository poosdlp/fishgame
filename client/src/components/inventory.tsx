import tempfish from "../assets/tempfish.png";

type FishRarity = "common" | "uncommon" | "rare" | "legendary" | "mythical" | "the one that got away";

type InventoryFish = {
  id: string;
  name: string;
  rarity: FishRarity;
  length: number;
  weight: number | "how rude to ask";
  points: number;
};

type Props = {
  fish: InventoryFish[];
};

const rarityColors: Record<FishRarity, string> = {
  common: "#94a3b8",
  uncommon: "#4ade80",
  rare: "#60a5fa",
  legendary: "#f59e0b",
  mythical: "#c084fc",
  "the one that got away": "#f87171",
};

export function Inventory({ fish }: Props) {
  if (fish.length === 0) {
    return (
      <div className="inventory-empty">
        <p>No fish yet.<br />Cast your line!</p>
      </div>
    );
  }

  // Group fish by name, keeping the best catch (highest points) as the representative entry
  const grouped = fish.reduce<Map<string, InventoryFish & { quantity: number }>>(
    (map, f) => {
      const existing = map.get(f.name);
      if (existing) {
        existing.quantity += 1;
        if (f.points > existing.points) {
          const qty = existing.quantity;
          map.set(f.name, { ...f, quantity: qty });
        }
      } else {
        map.set(f.name, { ...f, quantity: 1 });
      }
      return map;
    },
    new Map()
  );

  return (
    <div className="inventory-list">
      {[...grouped.values()].map(f => (
        <div key={f.name} className="fish-card">
          <div className="fish-card-img-wrap">
            <img src={tempfish} alt={f.name} className="fish-card-img" />
            {f.quantity > 1 && (
              <span className="fish-card-qty">x{f.quantity}</span>
            )}
          </div>
          <div className="fish-card-info">
            <div className="fish-card-name">{f.name}</div>
            <div
              className="fish-card-rarity"
              style={{ color: rarityColors[f.rarity] }}
            >
              {f.rarity}
            </div>
            {f.quantity > 1 && (
              <div className="fish-card-best">Best catch</div>
            )}
            <div className="fish-card-stats">
              <span>📏 {f.length} cm</span>
              <span>
                ⚖️{" "}
                {f.weight === "how rude to ask"
                  ? "???"
                  : `${f.weight} kg`}
              </span>
              <span>⭐ {f.points} pts</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
