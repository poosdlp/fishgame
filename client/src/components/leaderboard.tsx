import { useEffect, useState } from "react";
import { getLeaderboard } from "../api";
import type { LeaderboardEntry } from "../types/fish";

const medals = ["🥇", "🥈", "🥉"];

export function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    getLeaderboard()
      .then(data => {
        setEntries(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  return (
    <div className="leaderboard">
      <div className="lb-header">
        <h2>Top Anglers</h2>
      </div>

      {loading && <div className="lb-empty">Loading...</div>}
      {error && <div className="lb-empty">Could not reach server.</div>}

      {!loading && !error && entries.length === 0 && (
        <div className="lb-empty">No catches yet.<br />Be the first!</div>
      )}

      {!loading && !error && entries.length > 0 && (
        <div className="lb-section">
          {entries.map((e, i) => (
            <div key={e.username} className="lb-row">
              <span className="lb-medal">{medals[i] ?? `#${i + 1}`}</span>
              <div className="lb-row-info">
                <span className="lb-row-name">{e.username}</span>
                <span className="lb-row-value">{e.totalFish} fish caught</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
