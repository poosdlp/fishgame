import { useState, useEffect } from "react";
import type { LeaderboardTab, LeaderboardEntry, RecentCatch } from "../types/fish";
import { getLeaderboard, getRecentCatches } from "../api";

const rarityColor: Record<string, string> = {
  common: "#aaa",
  uncommon: "#4caf50",
  rare: "#2196f3",
  legendary: "#ff9800",
  mythical: "#e040fb",
  "the one that got away": "#f44336",
};

type Props = {
  isOpen: boolean;
  onToggle: () => void;
}

export function LeaderboardSidebar({ isOpen, onToggle }: Props) {
    const [activeTab, setActiveTab] = useState<LeaderboardTab>("leaderboard");
    const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
    const [recent, setRecent] = useState<RecentCatch[]>([]);

    useEffect(() => {
      if (!isOpen) return;
      if (activeTab === "leaderboard") {
        getLeaderboard().then(setLeaders).catch(() => {});
      } else {
        getRecentCatches().then(setRecent).catch(() => {});
      }
    }, [isOpen, activeTab]);

    return(
            <div className={`sidebar right ${isOpen ? "open" : "collapsed"}`}>
                {/* TABS (ALWAYS VISIBLE) */}
                    <div className="side-tab right-tab" onClick={onToggle}>
                    {isOpen ? "▶" : "◀"}
                    </div>

                {/* CONTENT (ONLY WHEN OPEN) */}
                {isOpen && (
                <>
                    <div className="tabs">
                    <button
                        className={activeTab === "leaderboard" ? "active" : ""}
                        onClick={() => setActiveTab("leaderboard")}
                    >
                        Leaderboard
                    </button>

                    <button
                        className={activeTab === "recent" ? "active" : ""}
                        onClick={() => setActiveTab("recent")}
                    >
                        Recent
                    </button>
                    </div>

                    {activeTab === "leaderboard" && (
                    <ol style={{ padding: "0 1rem", margin: 0 }}>
                        {leaders.length === 0 && <p style={{ opacity: 0.6 }}>No catches yet!</p>}
                        {leaders.map((entry, i) => (
                        <li key={entry.username} style={{ padding: "0.4rem 0" }}>
                            <strong>{i + 1}. {entry.username}</strong> — {entry.totalFish} fish
                        </li>
                        ))}
                    </ol>
                    )}

                    {activeTab === "recent" && (
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                        {recent.length === 0 && <p style={{ opacity: 0.6 }}>No catches yet!</p>}
                        {recent.map((entry) => (
                        <li key={entry._id} style={{ padding: "0.4rem 0.75rem", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                            <strong>{entry.username}</strong> caught{" "}
                            <span style={{ color: rarityColor[entry.rarity] || "#fff" }}>{entry.name}</span>
                            <div style={{ fontSize: "0.75rem", opacity: 0.6 }}>
                              {entry.length} cm &middot;{" "}
                              {typeof entry.weight === "number" ? `${entry.weight} g` : entry.weight}
                            </div>
                        </li>
                        ))}
                    </ul>
                    )}
                </>
                )}
            </div>
    );

}