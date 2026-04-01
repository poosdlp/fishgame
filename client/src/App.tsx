import { useState } from "react";
import { BiteAlert } from './components/bitealert';
import { CaughtFish } from './components/caughtfish';
import { WaitingForABite } from './components/waitingforabite';
import {Inventory } from './components/inventory';

import './App.css'

type GameState = "bite" | "caught" | "waiting"| "none";

type LeaderboardTab = "leaderboard" | "recent";

type FishTemplate =
  | {
      name: string;
      rarity: "common" | "uncommon" | "rare" | "legendary" | "mythical";
    }
  | {
      name: string;
      rarity: "the one that got away";
      length: number;
      weight: "how rude to ask";
    };

type Fishy = {
  id: string;
  name: string;
  rarity: FishTemplate["rarity"];
  weight: number | "how rude to ask";
  length: number;
};



function App() {
  const [state, setState] = useState<GameState>("none");

  const [showInventory, setShowInventory] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [activeTab, setActiveTab] = useState<LeaderboardTab>("leaderboard");
  const isAnySidebarOpen = showInventory || showLeaderboard;
  const [inventory, setInventory] = useState<Fishy[]>([]);

//temp fish data for testing inventory
  const fishTypes: FishTemplate[] = [
  { name: "Salmon", rarity: "common" },
  { name: "Tuna", rarity: "uncommon" },
  { name: "Bass", rarity: "common" },
  { name: "Pufferfish", rarity: "rare" },
  { name: "Anglerfish", rarity: "rare" },
  { name: "Golden Koi", rarity: "legendary" },
  { name: "Dragonfish", rarity: "mythical" },
  { name: "livia fish", rarity: "the one that got away", length: 170,weight: "how rude to ask"},
  { name: "axel fish", rarity: "the one that got away", length: 150,weight: "how rude to ask"},
  { name: "marcus fish", rarity: "the one that got away", length: 160,weight: "how rude to ask"},
  { name: "jake fish", rarity: "the one that got away", length: 140,weight: "how rude to ask"},
  { name: "josh fish", rarity: "the one that got away", length: 180,weight: "how rude to ask"},

];

  
  const createFish = (): Fishy => {
    const roll = Math.random();

    let fish;

    if (roll < 0.6) {
      const commonFish = fishTypes.filter(f => f.rarity === "common");
      fish = commonFish[Math.floor(Math.random() * commonFish.length)];
    } else if (roll < 0.75) { 
      const uncommonFish = fishTypes.filter(f => f.rarity === "uncommon");
      fish = uncommonFish[Math.floor(Math.random() * uncommonFish.length)];
    } else if (roll < 0.87) {
      const rareFish = fishTypes.filter(f => f.rarity === "rare");
      fish = rareFish[Math.floor(Math.random() * rareFish.length)];
    } else if (roll < 0.9) {
      const legendaryFish = fishTypes.filter(f => f.rarity === "legendary");
      fish = legendaryFish[Math.floor(Math.random() * legendaryFish.length)];
    } else if (roll < 0.98) {
      const mythicalFish = fishTypes.filter(f => f.rarity === "mythical");
      fish = mythicalFish[Math.floor(Math.random() * mythicalFish.length)];
    } else {
      const gotAwayFish = fishTypes.filter(f => f.rarity === "the one that got away");
      fish = gotAwayFish[Math.floor(Math.random() * gotAwayFish.length)];
    } 

    // use fixed stats
    if (fish.rarity === "the one that got away") {
      return {
        id: crypto.randomUUID(),
        name: fish.name,
        rarity: fish.rarity,
        length: fish.length,   
        weight: fish.weight 
      };
    }

    const length=
      fish.rarity === "common" ? Math.floor(Math.random() * 40) + 20 :
      fish.rarity === "uncommon" ? Math.floor(Math.random() * 50) + 30 :
      fish.rarity === "rare" ? Math.floor(Math.random() * 60) + 40 :
      fish.rarity === "legendary" ? Math.floor(Math.random() * 80) + 50 :
      Math.floor(Math.random() * 20) + 10;

    const weight = Math.round(length * (Math.random() * 0.5 + 0.02)); // weight is based on length with some randomness 


  return {
    id: crypto.randomUUID(),
    name: fish.name,
    rarity: fish.rarity as Fishy["rarity"],
    length: length,
    weight: weight,
  };
};

  const catchFish = (fish: Fishy) => {
    const newFish = createFish();
    setInventory(prev => [...prev, newFish]);
    setState("caught");
  }



    return(
     <div> 

      {/* OVERLAY */}
      {(isAnySidebarOpen) && (
        <div
          className="overlay"
          onClick={() => {
            setShowInventory(false);
            setShowLeaderboard(false);
          }}
        />
      )}


        {/* LEFT SIDEBAR */}
          <div className={`sidebar left ${showInventory ? "open" : "collapsed"}`}>

             {/* SINGLE TOGGLE TAB */}
              <div
                className="side-tab left-tab"
                onClick={() => setShowInventory(prev => !prev)}
              >
                {showInventory ? "◀" : "▶"}
              </div>

              {/* CONTENT */}
              {showInventory && (
                <>
                  <h2>Inventory</h2>
                  <Inventory />
                </>
              )}
            </div>

        {/* RIGHT SIDEBAR */}
        <div className={`sidebar right ${showLeaderboard ? "open" : "collapsed"}`}>
          {/* TABS (ALWAYS VISIBLE) */}
          
              <div
                className="side-tab right-tab"
                onClick={() => setShowLeaderboard(prev => !prev)}
              >
                {showLeaderboard ? "▶" : "◀"}
              </div>
            

          {/* CONTENT (ONLY WHEN OPEN) */}
          {showLeaderboard && (
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


        {/* MAIN CONTENT */}
        <div style={{textAlign: "center", marginTop: "50px"}}>
          <h1>Fishing Game thats very cool and girly but in a way that everyone loves</h1>

          

          {/* Start screen */}
          {state === "none" && (
            <button onClick={() => setState("waiting")}>Play</button>
          )}
          {/* Waiting */}
          {state === "waiting" && (
            <WaitingForABite onFishBite={() => setState("bite")} />
          )}

          {/* Bite */}
          {state === "bite" && (
            <BiteAlert onCatch={() => setState("caught")} />
          )}

          {/* Caught */}
          {state === "caught" && (
            <>
              <CaughtFish onReset={() => setState("none")} />
            </>
          )}


      </div>
    </div>
    );
}

export default App
