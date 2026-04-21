import type { InventoryFish } from '../types/fish';
import { getFishAssetByName } from '../utils/fishAssets';

type CaughtFishData = InventoryFish;

type Props = {
  fish: CaughtFishData | null;
  onReset: () => void;
};

const rarityColor: Record<string, string> = {
  common: '#aaa',
  uncommon: '#4caf50',
  rare: '#2196f3',
  legendary: '#ff9800',
  mythical: '#e040fb',
  'the one that got away': '#f44336',
};

export function CaughtFish({ fish, onReset }: Props) {
  return (
    <div className="caught-overlay">
      <div className="caught-card">
        <h2 className="caught-title">You caught a fish!</h2>
        {fish && (
          <div className="caught-details">
            <img
              src={getFishAssetByName(fish.name)?.imagePath || '/fish/salmon.png'}
              alt={fish.name}
              className="caught-sprite"
            />
            <p className="caught-name">{fish.name}</p>
            <p className="caught-rarity" style={{ color: rarityColor[fish.rarity] || '#fff' }}>
              {fish.rarity}
            </p>
            <div className="caught-stats">
              <span>📏 {fish.length} cm</span>
              <span>⚖️ {fish.weight === "how rude to ask" ? "???" : `${fish.weight} kg`}</span>
            </div>
          </div>
        )}
        <button className="caught-done-btn" onClick={onReset}>Done</button>
      </div>
    </div>
  );
}
