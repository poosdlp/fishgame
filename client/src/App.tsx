import { use, useState } from "react";
import { useEffect } from "react";
import { BiteAlert } from './components/bitealert';
import { CaughtFish } from './components/caughtfish';
import { WaitingForABite } from './components/waitingforabite';
import {Inventory } from './components/inventory';

import './App.css'

const LakeWidth = 800;
const LakeHeight = 500;

let tempfish;

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

type FishBehavior = "swimming" | "attracted" | "hovering" | "bite" | "caught";
type Fishy = {
  id: string;
  name: string;
  rarity: FishTemplate["rarity"];
  weight: number | "how rude to ask";
  length: number;

  x: number;
  y: number;
  vx: number;
  vy: number;
  behavior: FishBehavior;

  tapCount: number;
  tapCooldown: number;
  isDiving: boolean;

};

function loadimages() {
 
  

  tempfish = new Image();
  tempfish.src = "/tempfish.png";
}


function App() {
  const [state, setState] = useState<GameState>("none");
  const [bobber, setBobber] = useState<{x: number, y: number} | null>(null);

  const [showInventory, setShowInventory] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [activeTab, setActiveTab] = useState<LeaderboardTab>("leaderboard");
  const isAnySidebarOpen = showInventory || showLeaderboard;
  const [inventory, setInventory] = useState<Fishy[]>([]);
  const [fishInLake, setFishInLake] = useState<Fishy[]>([]);
  const [targetFishId, setTargetFishId] = useState<string | null>(null);

//temp fish data for testing inventory
  const fishTypes: FishTemplate[] = [
  { name: "Salmon", rarity: "common" },
  { name: "Tuna", rarity: "uncommon" },
  { name: "Bass", rarity: "common" },
  { name: "Pufferfish", rarity: "rare" },
  { name: "Anglerfish", rarity: "rare" },
  { name: "Golden Koi", rarity: "legendary" },
  { name: "Dragonfish", rarity: "mythical" },
  { name: "livia fish", rarity: "the one that got away", length: 170, weight: "how rude to ask"},
  { name: "axel fish", rarity: "the one that got away", length: 150, weight: "how rude to ask"},
  { name: "marcus fish", rarity: "the one that got away", length: 160, weight: "how rude to ask"},
  { name: "jake fish", rarity: "the one that got away", length: 140, weight: "how rude to ask"},
  { name: "josh fish", rarity: "the one that got away", length: 180, weight: "how rude to ask"},

];

 useEffect(() => {
    let animationId: number;
    let time = 0;

    const update = () => {
      time += 0.016; 
      setFishInLake(prev =>
        prev.map(fish => {
          
          const attractionRadius = 300;
          const stopRadius = 10;
         

          let dx = 0;
          let dy = 0;
          let dist = Infinity;
          let newVx = fish.vx;
          let newVy = fish.vy;
          let behavior = fish.behavior;
          let tapCount = fish.tapCount;
          let tapCooldown = fish.tapCooldown;
          let isDiving = fish.isDiving;    

          if (bobber) {
            dx = bobber.x - fish.x;
            dy = bobber.y - fish.y;
            dist = Math.sqrt(dx * dx + dy * dy);
          }

            if (dist < attractionRadius && fish.behavior === "swimming") {
              fish.behavior = "attracted";
            }
          

          if (fish.behavior === "attracted") {
            newVx += (dx / dist) * 0.3;
            newVy += (dy / dist) * 0.3;
            if (dist<50){
              behavior = "hovering";
            }
          }
          
          let hook=0; //temp hook variable to simulate hook state, eventually replace with mobile logic

          if(fish.behavior === "hovering" && hook === 0 && bobber ) { 
            //count down taps
            if (tapCooldown > 0) {
              tapCooldown -= 1;
            }

            if(!isDiving && tapCooldown <= 0) {
              isDiving = true;
              tapCooldown = 30+Math.random() * 30; // 0.5 second cooldown
            }

            let offsetX =0;
            let offsetY =0;

            if(isDiving) {
              offsetX = dx * 0.2;
              offsetY = dy * 0.2;

              if(dist<5){
                isDiving=false;
                tapCount += 1;
              }
            } else {
              const angle = time +Number(fish.id.slice(0, 5)) * 0.0001; // unique angle based on id
              offsetX = Math.cos(angle) * 12;
              offsetY = Math.sin(angle) * 12;
            }

          if (tapCount >= 3 + Math.floor(Math.random() * 4)) {
            fish.behavior = "bite";
          }
         return {
            ...fish,
            behavior,
            tapCount,
            tapCooldown,
            isDiving,
            x: bobber.x + offsetX,
            y: bobber.y + offsetY,
            vx: 0,
            vy: 0,
          };
        }       

        //temp variable for winning the mini game, 
        // eventually replace with mobile logic 
        let win=false;

        if(fish.behavior === "bite" && bobber) {
          hook=1; //eventually replace with mobile logic

          if(hook===1){
            //pop up with bite screen and start mini game on phone
            //if win change flag to caught 
            win=true; //temp auto win for testing
            return {
              ...fish,
              behavior: "caught" as FishBehavior,
              x: bobber.x,
              y: bobber.y,
              vx: 0,
              vy: 0,
            };}
            else{

            //reset fish to swimming if they escape
            }
        }

        if(win===true){
          fish.behavior="caught";
        }


          if (fish.behavior === "caught") { 
            //return stats screen eventually
            //check if caught before eventually
            
            return fish;
          }

          // 🐟 normal movement + wobble
            const speed = Math.sqrt(newVx * newVx + newVy * newVy);
            const maxSpeed = 1.5;

            if (speed > maxSpeed) {
              newVx = (newVx / speed) * maxSpeed;
              newVy = (newVy / speed) * maxSpeed;
            }

            const wobbleX = Math.sin(time + fish.y * 0.01) * 0.2;
            const wobbleY = Math.cos(time + fish.x * 0.01) * 0.2;

            return {
              ...fish,
              behavior,
              x: fish.x + newVx + wobbleX,
              y: fish.y + newVy + wobbleY,
              vx: newVx,
              vy: newVy,
            };
          })
        .filter(fish =>
        fish.x > -100 &&
        fish.x < LakeWidth + 100 &&
        fish.y > -100 &&
        fish.y < LakeHeight + 100
      )
      );

      animationId = requestAnimationFrame(update);
    };

    animationId = requestAnimationFrame(update);

    return () => cancelAnimationFrame(animationId);
  }, []);
        


  
  const createFish = (): Fishy => {
    const roll = Math.random();
    const side=Math.floor(Math.random() * 4);

    let fish;

// spawn outside the lake so it has to swim in
    let x=0;
    let y=0;
    
    if (side === 0) {
      // left
      x = -20;
      y = Math.random() * LakeHeight;
    } else if (side === 1) {
      // right
      x = LakeWidth + 20;
      y = Math.random() * LakeHeight;
    } else if (side === 2) {
      // top
      x = Math.random() * LakeWidth;
      y = -20;
    } else {
      // bottom
      x = Math.random() * LakeWidth;
      y = LakeHeight + 20;
    }

    const centerX = LakeWidth / 2;
    const centerY = LakeHeight / 2;

    const vx = (centerX - x) * 0.001;
    const vy = (centerY - y) * 0.001;



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
    } else if (roll < 0.99) {
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
        weight: fish.weight ,

      // spawn outside the lake so it has to swim in
        x,y,

        // initial movement
        vx,
        vy,
        behavior: "swimming",
        tapCount: 0,
        tapCooldown: 0,
        isDiving: false,

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

    x,
    y,
    vx,
    vy,
    behavior: "swimming",
    tapCount: 0,
    tapCooldown: 0,
    isDiving: false,
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
            
            <button onClick={() => {
              setState("waiting");
              const count = Math.floor(Math.random() * 5) + 2; // random 2-6
              const newFishArray: Fishy[] = []; // create an array to hold new fish
                for (let i = 0; i < count; i++) {
                  const newFishList = createFish();
                  newFishArray.push(newFishList); // add each new fish to the array
                }
                setFishInLake(newFishArray);
                //pick fish to bite
                const randindex= Math.floor(Math.random() * newFishArray.length);
                setTargetFishId(newFishArray[randindex].id);


                setBobber({
                  x: Math.random() * (LakeWidth - 100) + 50,
                  y: Math.random() * (LakeHeight - 100) + 50,
                });
            }}>Play</button>
            
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
