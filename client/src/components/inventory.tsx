type InventoryFish = {
  dbId?: string;
  name: string;
  rarity: string;
  weight: number | "how rude to ask";
  length: number;
};

type Props = {
  fish: InventoryFish[];
  onRelease: (dbId: string) => void;
};

export function Inventory({ fish, onRelease }: Props) {
  return (
    <div>
      {fish.length === 0 && <p>No fish caught yet!</p>}
      {fish.map(f => (
        <div key={f.dbId ?? f.name}>
          <strong>{f.name}</strong> — {f.rarity}, {f.length}cm, {f.weight === "how rude to ask" ? f.weight : `${f.weight}kg`}
          {f.dbId && (
            <button onClick={() => onRelease(f.dbId!)}>Release</button>
          )}
        </div>
      ))}
    </div>
  );
}
