import {useState, useEffect} from "react";
import { BiteAlert } from './components/bitealert';
import { CaughtFish } from './components/caughtfish';
import { WaitingForABite } from './components/waitingforabite';
import { catchFish as catchFishApi, getInventory } from './api';

import type {GameState,Fishy,InventoryFish} from './types/fish'
import {LakeHeight,LakeWidth} from './data/lakeDim'
import { createFish } from "./utils/fishCreate";
import { useFishSimulation } from "./hooks/useFishSim";
import { InventorySidebar } from "./components/InventorySidebar";
import { LeaderboardSidebar } from "./components/LeaderboardSidebar";


import './App.css'


function App() {
  const [state, setState] = useState<GameState>("none");
  const [bobber, setBobber] = useState<{x: number, y: number} | null>(null);
  const [showInventory, setShowInventory] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const isAnySidebarOpen = showInventory || showLeaderboard;
  const [inventory, setInventory] = useState<InventoryFish[]>([]);
  const [lastCatch, setLastCatch] = useState<InventoryFish | null>(null);
  
  const { fishInLake, setFishInLake } = useFishSimulation(bobber);

  useEffect(() => {
    getInventory().then(setInventory).catch(() => {});
  }, []);

  const handleCatch = async () => {
    try {
      const fish = await catchFishApi();
      setLastCatch(fish);
      setInventory(prev => [fish, ...prev]);
    } catch {
      // still transition to caught state even if save fails
    }
    setState("caught");
  };
   
   


  return(
    <div> 
      <InventorySidebar
        isOpen={showInventory} 
        onToggle={()=> setShowInventory(prev=>!prev)}
        inventory={inventory} />
      <LeaderboardSidebar
        isOpen={showLeaderboard}
        onToggle={() => setShowLeaderboard(prev => !prev)}
      />
    {/* OVERLAY */}
    {(isAnySidebarOpen) && (
      <div className="overlay" onClick={() => {
          setShowInventory(false);
          setShowLeaderboard(false);
        }} />
    )}
       
      {/* MAIN CONTENT */}
      <div style={{textAlign: "center", marginTop: "50px"}}>
        <h1>Fishing Game thats very cool and girly but in a way that everyone loves</h1>
        <button onClick={() => {
            const count = Math.floor(Math.random() * 5) + 6; // random 6-10
            const newFishArray: Fishy[] = [];

            for (let i = 0; i < count; i++) {
              newFishArray.push(createFish());
            }

            setFishInLake(newFishArray);
            setState("waiting");
            setBobber({
              x: Math.random() * (LakeWidth - 100) + 50,
              y: Math.random() * (LakeHeight - 100) + 50,
            });
          }}>Play</button>
        
        <div className="game-screen">
          <div className="lake">
            {bobber && (
              <div style={{
                position: "absolute",
                left: bobber.x - 10,
                top: bobber.y - 10,
                width: 20,
                height: 20,
                background: "red",
                borderRadius: "50%",
                border: "3px solid white",
                zIndex: 10,
              }} />
            )}
            {fishInLake.map(fish => (
              <div
                key={fish.id}
                style={{
                  position: "absolute",
                  left: fish.x,
                  top: fish.y,
                  width: 20,
                  height: 20,
                  background: "orange",
                  borderRadius: "50%",
                }}
              />
            ))}
          </div>
        </div>


        {/* Start screen */}

        {state === "none" && (
          <div>Start the game!</div>         
          
        )}
        {/* Waiting */}
        {state === "waiting" && (
          <WaitingForABite onFishBite={() => setState("bite")} />
        )}

        {/* Bite */}
        {state === "bite" && (
          <BiteAlert onCatch={handleCatch} />
        )}

        {/* Caught */}
        {state === "caught" && (
          <>
            <CaughtFish fish={lastCatch} onReset={() => { setLastCatch(null); setState("none"); }} />
          </>
        )}


    </div>
  </div>
  );
}

export default App
