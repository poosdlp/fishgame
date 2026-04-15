import { useState } from "react";
import type { LeaderboardTab } from "../types/fish";

type Props = {
  isOpen: boolean;
  onToggle: () => void;
}


export function LeaderboardSidebar({ isOpen, onToggle }: Props) {
    const [activeTab, setActiveTab] = useState<LeaderboardTab>("leaderboard");
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
                    <div>
                        <p>Player1 - 10 fish</p>
                        <p>Player2 - 8 fish</p>
                    </div>
                    )}

                    {activeTab === "recent" && (
                    <div>
                        <p>🐟 Salmon caught</p>
                        <p>🐠 Tuna caught</p>
                    </div>
                    )}
                </>
                )}
            </div>
    );

}