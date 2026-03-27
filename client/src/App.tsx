import { useState } from "react";
import { BiteAlert } from './components/bitealert';
import { CaughtFish } from './components/caughtfish';
import { WaitingForABite } from './components/waitingforabite';
import {Inventory } from './components/inventory';

import './App.css'

type GameState = "bite" | "caught" | "waiting"| "none";

function App() {
  const [state, setState] = useState<GameState>("none");
  const [showInventory, setShowInventory] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  
  
    return(
     <div> 

      {/* LEFT SIDEBAR */}
        <div className={`sidebar left ${showInventory ? "open" : ""}`}>
          <button onClick={() => setShowInventory(false)}>Close</button>
          <h2>Inventory</h2>
          <Inventory />
        </div>

        {/* RIGHT SIDEBAR */}
        <div className={`sidebar right ${showLeaderboard ? "open" : ""}`}>
          <button onClick={() => setShowLeaderboard(false)}>Close</button>
          <h2>Leaderboard</h2>
          <p>Player1 - 10 fish</p>
          <p>Player2 - 8 fish</p>
        </div>


        {/* MAIN CONTENT */}
        <div style={{textAlign: "center", marginTop: "50px"}}>
          <h1>Fishing Game thats very cool and girly but in a way that everyone loves</h1>

          <button onClick={() => setShowInventory(true)}>
            Open Inventory
          </button>

          <button onClick={() => setShowLeaderboard(true)}>
            Open Leaderboard
          </button>



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
              <Inventory />
            </>
          )}


      </div>
    </div>
    );
}

export default App
