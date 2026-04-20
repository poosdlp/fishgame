import { useState } from 'react';
import type { InventoryFish } from '../types/fish';

type Props = {
  fish: InventoryFish[];
};


export function Inventory({ fish }: Props) {
  const [query, setQuery] = useState('');

  if (fish.length === 0) {
    return (
      <div className="inventory-empty">
        <p>No fish yet.<br />Cast your line!</p>
      </div>
    );
  }

  // Group fish by name, keeping the largest catch as the representative entry
  const grouped = fish.reduce<Map<string, InventoryFish & { quantity: number }>>(
    (map, f) => {
      const existing = map.get(f.name);
      if (existing) {
        existing.quantity += 1;
        if (f.length > existing.length) {
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

  const filtered = [...grouped.values()].filter(f =>
    f.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="inventory-list">
      <input
        className="inventory-search"
        type="text"
        placeholder="Search..."
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      {filtered.length === 0 && (
        <div className="inventory-empty"><p>No matches.</p></div>
      )}
      {filtered.map(f => (
        <div key={f.name} className="fish-card">
          <div className="fish-card-img-wrap">
            <img src="/tempfish.png" alt={f.name} className="fish-card-img" style={{ imageRendering: "pixelated" }} />
            {f.quantity > 1 && (
              <span className="fish-card-qty">x{f.quantity}</span>
            )}
          </div>
          <div className="fish-card-info">
            <div className="fish-card-name">{f.name}</div>
            <div className="fish-card-rarity">{f.rarity}</div>
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
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
