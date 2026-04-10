type Fish = {
  name: string;
  rarity: string;
  weight: number | "how rude to ask";
  length: number;
};

type Props = {
  fish: Fish;
  onClose: () => void;
};

export function FirstCatchPopup({ fish, onClose }: Props) {
  return (
    <div className="first-catch-backdrop">
      <div className="first-catch-popup">
        <h2>First catch!</h2>
        <h3>{fish.name}</h3>
        <p>Rarity: {fish.rarity}</p>
        <p>Length: {fish.length}cm</p>
        <p>Weight: {fish.weight === "how rude to ask" ? fish.weight : `${fish.weight}kg`}</p>
        <button onClick={onClose}>Nice!</button>
      </div>
    </div>
  );
}
