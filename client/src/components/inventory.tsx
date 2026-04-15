import type { InventoryFish } from '../types/fish';

type Props = {
  fish: InventoryFish[];
};

const rarityColor: Record<string, string> = {
  common: "#aaa",
  uncommon: "#4caf50",
  rare: "#2196f3",
  legendary: "#ff9800",
  mythical: "#e040fb",
  "the one that got away": "#f44336",
};

export function Inventory({ fish }: Props) {
  if (fish.length === 0) {
    return <p style={{ padding: "1rem", opacity: 0.6 }}>No fish caught yet!</p>;
  }

  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {fish.map((f) => (
        <li
          key={f._id}
          style={{
            padding: "0.5rem 0.75rem",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <strong>{f.name}</strong>{" "}
          <span style={{ color: rarityColor[f.rarity] || "#fff", fontSize: "0.85rem" }}>
            {f.rarity}
          </span>
          <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>
            {f.length} cm &middot;{" "}
            {typeof f.weight === "number" ? `${f.weight} g` : f.weight}
          </div>
        </li>
      ))}
    </ul>
  );
}