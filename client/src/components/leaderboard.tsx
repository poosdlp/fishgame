import { useState, useEffect } from "react";

type LeaderboardCategory = "points" | "weight" | "length";

type LeaderboardEntry = {
  _id: string;
  playerName: string;
  fishName: string;
  rarity: string;
  points: number;
  weight: number | null;
  length: number;
};

const tabs: { label: string; category: LeaderboardCategory }[] = [
  { label: "Points", category: "points" },
  { label: "Weight", category: "weight" },
  { label: "Length", category: "length" },
];

const medals = ["🥇", "🥈", "🥉"];

const API = "http://localhost:5555";

export function Leaderboard() {
  const [activeCategory, setActiveCategory] = useState<LeaderboardCategory>("points");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetch(`${API}/leaderboard?category=${activeCategory}`)
      .then(r => r.json())
      .then(data => {
        setEntries(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [activeCategory]);

  return (
    <div className="leaderboard">
      <div className="lb-tabs">
        {tabs.map(t => (
          <button
            key={t.category}
            className={`lb-tab ${activeCategory === t.category ? "active" : ""}`}
            onClick={() => setActiveCategory(t.category)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && <div className="lb-empty">Loading...</div>}
      {error && <div className="lb-empty">Could not reach server.</div>}

      {!loading && !error && entries.length === 0 && (
        <div className="lb-empty">No catches yet.<br />Be the first!</div>
      )}

      {!loading && !error && entries.length > 0 && (
        <div className="lb-section">
          {entries.map((e, i) => (
            <div key={e._id} className="lb-row">
              <span className="lb-medal">{medals[i] ?? `#${i + 1}`}</span>
              <div className="lb-row-info">
                <span className="lb-row-name">{e.playerName}</span>
                <span className="lb-row-fish">{e.fishName}</span>
                <span className="lb-row-value">
                  {activeCategory === "points" && `${e.points} pts`}
                  {activeCategory === "weight" && `${e.weight} kg`}
                  {activeCategory === "length" && `${e.length} cm`}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
