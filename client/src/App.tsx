import { useState } from "react";
import { BiteAlert } from './components/bitealert';
import { CaughtFish } from './components/caughtfish';
import { WaitingForABite } from './components/waitingforabite';
import {Inventory } from './components/inventory';

import './App.css'

type GameState = "bite" | "caught" | "waiting"| "none";

function App() {
  const [state, setState] = useState<GameState>("none");
  
  
  return(
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
          <Inventory />
        </>
      )}


    </div>

  );
}

export default App
