import type { InventoryFish } from '../types/fish';

// after player successfully catches fish, successful mini play, show fish stats, add fish to inventory and return to waiting for a bite.  
type Props = {
  fish: InventoryFish | null;
  onReset: () => void;
};  

export function CaughtFish({ fish, onReset }: Props) {
  return (
    <div>
      <h2>Congratulations! You caught a fish!</h2>
      {fish && (
        <div>
          <p><strong>{fish.name}</strong></p>
          <p>Rarity: {fish.rarity}</p>
          <p>Length: {fish.length} cm</p>
          <p>Weight: {typeof fish.weight === 'number' ? `${fish.weight} g` : fish.weight}</p>
        </div>
      )}
      <button onClick={onReset}>Done</button>
    </div>
  );
}