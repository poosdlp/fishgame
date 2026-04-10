import { use, useRef, useState } from "react";
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
type inventorytab = "fish" | "journals";

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
  length: number
  points: number;

  x: number;
  y: number;
  vx: number;
  vy: number;
  behavior: FishBehavior;
  tapCount: number;
  tapCooldown: number;
  requiredTaps: number;

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
  const [inventory, setInventory] = useState<Fishy[]>([
    { id: "filler-1", name: "Salmon", rarity: "common", length: 32, weight: 8, points: 10, x: 0, y: 0, vx: 0, vy: 0, behavior: "caught", tapCount: 0, tapCooldown: 0, requiredTaps: 3 },
    { id: "filler-2", name: "Tuna", rarity: "uncommon", length: 55, weight: 18, points: 100, x: 0, y: 0, vx: 0, vy: 0, behavior: "caught", tapCount: 0, tapCooldown: 0, requiredTaps: 3 },
    { id: "filler-3", name: "Pufferfish", rarity: "rare", length: 44, weight: 12, points: 1000, x: 0, y: 0, vx: 0, vy: 0, behavior: "caught", tapCount: 0, tapCooldown: 0, requiredTaps: 4 },
    { id: "filler-4", name: "Golden Koi", rarity: "legendary", length: 72, weight: 30, points: 10000, x: 0, y: 0, vx: 0, vy: 0, behavior: "caught", tapCount: 0, tapCooldown: 0, requiredTaps: 5 },
    { id: "filler-5", name: "Dragonfish", rarity: "mythical", length: 15, weight: 2, points: 100000, x: 0, y: 0, vx: 0, vy: 0, behavior: "caught", tapCount: 0, tapCooldown: 0, requiredTaps: 7 },
    { id: "filler-6", name: "livia fish", rarity: "the one that got away", length: 170, weight: "how rude to ask", points: 9999999, x: 0, y: 0, vx: 0, vy: 0, behavior: "caught", tapCount: 0, tapCooldown: 0, requiredTaps: 3 },
  ]);
  const [fishInLake, setFishInLake] = useState<Fishy[]>([]);
  const [targetFishId, setTargetFishId] = useState<string | null>(null);
  const hoverQueueRef = useRef<string[]>([]);

//temp fish data for testing inventory
  const fishTypes: FishTemplate[] = [
  { name: "Salmon", rarity: "common" },
  { name: "Tuna", rarity: "uncommon" },
  { name: "Bass", rarity: "common" },
  { name: "Pufferfish", rarity: "rare" },
  { name: "Anglerfish", rarity: "rare" },
  { name: "Golden Koi", rarity: "legendary" },
  { name: "Dragonfish", rarity: "mythical" },
  { name: "livia fish", rarity: "the one that got away", length: 170, weight: "how rude to ask", points: 9999999},
  { name: "axel fish", rarity: "the one that got away", length: 150, weight: "how rude to ask", points: 9999999},
  { name: "marcus fish", rarity: "the one that got away", length: 160, weight: "how rude to ask", points: 9999999},
  { name: "jake fish", rarity: "the one that got away", length: 140, weight: "how rude to ask", points: 9999999},
  { name: "josh fish", rarity: "the one that got away", length: 180, weight: "how rude to ask", points: 9999999},

];

const bobberRef = useRef<{ x: number; y: number } | null>(null);


 useEffect(() => {
   bobberRef.current = bobber;
    let animationId: number;
    let time = 0;

    const update = () => {
      time += 1; 

      if(!targetFishId && hoverQueueRef.current.length===2 ){
          const rand = Math.floor(Math.random() * 2);
            setTargetFishId(hoverQueueRef.current[rand]);
        }
        if(!targetFishId && hoverQueueRef.current.length===1){
          const firstfish= fishInLake.find(f => f.id === hoverQueueRef.current[0]);
          if(firstfish && firstfish.tapCount >= firstfish.requiredTaps){
            setTargetFishId(hoverQueueRef.current[0]);
          }
        }
    
      setFishInLake(prev => 
        prev.map(fish => {
          //console.log("fish count:", prev.length);
          const bobber = bobberRef.current;
          // console.log("bobber in update:", bobber);
          // console.log("bobber location", bobber ? `(${bobber.x.toFixed(2)}, ${bobber.y.toFixed(2)})` : "null");
          // console.log("fish location", `(${fish.x.toFixed(2)}, ${fish.y.toFixed(2)})`);
          // console.log("fish dist:", bobber ? Math.sqrt((bobber.x - fish.x) ** 2 + (bobber.y - fish.y) ** 2).toFixed(2) : "N/A");
          
          const attractionRadius = 150;
          const hoverRadius = 80;
          const biteRadius = 5;
          const maxspeed = 1.3;
          const minSpeed = 0.2;

          let {
          x, y, vx, vy,
          behavior,
          tapCount,
          tapCooldown,
          } = fish;

          let newVx = vx;
          let newVy = vy;
          let newBehavior = behavior;
          let tempID = fish.id;
         

          let dx = 0;
          let dy = 0;
          let dist = 0;
            

          if (bobber) {
            dx = bobber.x - fish.x;
            dy = bobber.y - fish.y;
            dist = Math.sqrt(dx * dx + dy * dy);
          }
          if (!isFinite(dist) || dist < 1) dist = 1;

          //caught
          if (newBehavior === "caught") {
            return fish; // frozen
          }

          let win=false; //temp variable for winning the mini game, eventually replace with mobile logic


          if(newBehavior === "bite" && bobber) {
          let hook=1; //eventually replace with mobile logic

          if(hook===1){
            //pop up with bite screen and start mini game on phone
            //if win change flag to caught 
            win=true; //temp auto win for testing
            newBehavior="caught";
            return {
              ...fish,
              behavior: newBehavior,
              x: bobber.x,
              y: bobber.y,
              vx: 0,
              vy: 0,
            };}
            else{

            //reset fish to swimming if they escape
            }
        }

        let hook=0; //temp hook variable to simulate hook state, eventually replace with mobile logic 

        
        if(newBehavior === "hovering" && hook === 0 && bobber ) {

          
            console.log("in hovering----------------------------------------");
          
          const seed = Number(fish.id.slice(0, 5));
          const angle = time * 0.01 + seed;
      

          const orbitX = Math.cos(angle) * hoverRadius; 
          const orbitY = Math.sin(angle) * hoverRadius;

          const pushX = -orbitX * 0.3; // push away from bobber to create tension
          const pushY = -orbitY * 0.3;
          

          const pullStrength = 0.5;

          const pullX = dx * pullStrength;
          const pullY = dy * pullStrength;

          let newtapCount = tapCount;
          let newTapCooldown = Math.max(0, tapCooldown - 1);


          if(dist < biteRadius && tapCooldown <= 0) {
            console.log("in bite radius, tap count:", tapCount, "cooldown:", tapCooldown);
            console.log("target fish id:", targetFishId, "temp id:", tempID);

            newtapCount = tapCount + 1;
            newTapCooldown = 500; // 30 frames cooldown

          }

          if(tapCooldown > 250 && dist<(hoverRadius-20)) {// move away from bobber slightly during cooldown to give player a chance to tap again, eventually replace with mobile logic that gives player a chance to tap again
            console.log("moving away--------------------------------");
            newVx += (pushX / dist) * 0.5; 
            newVy += (pushY / dist) * 0.5;
          }
          if(tapCooldown < 100&&dist>(hoverRadius -30)) {
            console.log("move toward--------------------------");
            newVx += (pullX / dist) * 0.5; // move towards bobber when cooldown is almost up to simulate fish being pulled in  
            newVy += (pullY / dist) * 0.5;
          }


          if ( targetFishId && targetFishId===tempID &&newtapCount >= fish.requiredTaps)  {
            console.log("fish is going to bite, tap count:", newtapCount);
            //newBehavior = "bite";

          }

          return {
            ...fish,
            behavior: newBehavior,
            x: fish.x + newVx,
            y: fish.y + newVy,
            vx: newVx,
            vy: newVy,
            tapCount: newtapCount,
            tapCooldown: newTapCooldown,
          };



          
         }
    

        if (newBehavior === "attracted") {
                   // console.log("attracted logic running");


          if(bobber && dist < hoverRadius) {
            newBehavior = "hovering";
          }

          if(!targetFishId){
            if(!hoverQueueRef.current.includes(fish.id) && hoverQueueRef.current.length <2){
              hoverQueueRef.current.push(fish.id)
              console.log("added fish to Q-----------------------------------");
            }
 
        }

          const closeBoost = dist < 70 ? 2 : 1;

                    
          const speed = Math.max(
            minSpeed,
            Math.min(dist / attractionRadius, 1) * maxspeed
          );
          

          const targetVx = (dx / dist) * speed;
          const targetVy = (dy / dist) * speed;

          const turnSpeed = 0.15; // responsiveness
          const accel = 0.03;     // natural pull

          // steering (fast response)
          newVx += (targetVx - newVx) * turnSpeed;
          newVy += (targetVy - newVy) * turnSpeed;

          // acceleration (organic feel)
          newVx += (dx / dist) * accel* closeBoost;
          newVy += (dy / dist) * accel* closeBoost;

          // wobble (personality)
          const seed = Number(fish.id.slice(0, 8)) || 0; // prevent NaN
          const wobbleStrength = 0.5;
          const wobbleSpeed = 0.1;

          // optional: reduce wobble when close to bobber
          const wobbleFactor = Math.max(dist / attractionRadius, 0.1);

          const wobbleX = Math.sin(time * wobbleSpeed + seed) * wobbleStrength * wobbleFactor;
          const wobbleY = Math.cos(time * wobbleSpeed + seed) * wobbleStrength * wobbleFactor;

          return {
            ...fish,
            behavior: newBehavior,
            x: fish.x + newVx + wobbleX,
            y: fish.y + newVy + wobbleY,
            vx: newVx,
            vy: newVy,
          };

        }

        if(newBehavior === "swimming") {

          //console.log("swimming logic running");
          //console.log("fish dist:", dist);


          if (bobber && dist < attractionRadius) {
            //console.log("entering attraction radius, behavior changing to attracted");
            const speed = Math.min(dist / attractionRadius, 1) * maxspeed;
            const targetVx = (dx / dist) * speed;
            const targetVy = (dy / dist) * speed;

            const turnSpeed = 0.2;   // responsiveness
            const accelBoost = 0.05; // extra pull

            newVx += (targetVx - newVx) * turnSpeed;
            newVy += (targetVy - newVy) * turnSpeed;

            // extra pull so it doesn’t feel too sluggish when far away
            newVx += (dx / dist) * accelBoost;
            newVy += (dy / dist) * accelBoost;
            //console.log("changing to attracted now");
            newBehavior = "attracted";
          }
          // 🐟 normal movement + wobble
            const speed = Math.sqrt(newVx * newVx + newVy * newVy);
            const maxSpeed = 1.5;

            if (speed > maxSpeed) {
              newVx = (newVx / speed) * maxSpeed;
              newVy = (newVy / speed) * maxSpeed;
            }

            const wobbleX = Math.sin(time + fish.y * 0.05) * 0.2;
            const wobbleY = Math.cos(time + fish.x * 0.06) * 0.2;

            if (Math.random() < 0.02) { // 2% chance per frame
              const angle = Math.random() * (Math.PI / 4);
              const direction = Math.random() < 0.5 ? -1 : 1;
              const theta = angle * direction;

              const rotatedVx = newVx * Math.cos(theta) - newVy * Math.sin(theta);
              const rotatedVy = newVx * Math.sin(theta) + newVy * Math.cos(theta);

              newVx = rotatedVx;
              newVy = rotatedVy;
            }

            return {
              ...fish,
              behavior: newBehavior,
              x: fish.x + newVx + wobbleX,
              y: fish.y + newVy + wobbleY,
              vx: newVx,
              vy: newVy,
            };

          }



            return fish;


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
  }, [bobber]);
        


  
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
        points: fish.points ,

      // spawn outside the lake so it has to swim in
        x,y,

        // initial movement
        vx,
        vy,
        behavior: "swimming",
        tapCount: 0,
        tapCooldown: 0,
        requiredTaps: Math.floor(Math.random() * 5) + 3, // random number of taps required to catch the fish  
        
      };
    }

    const length=
      fish.rarity === "common" ? Math.floor(Math.random() * 40) + 20 :
      fish.rarity === "uncommon" ? Math.floor(Math.random() * 50) + 30 :
      fish.rarity === "rare" ? Math.floor(Math.random() * 60) + 40 :
      fish.rarity === "legendary" ? Math.floor(Math.random() * 80) + 50 :
      Math.floor(Math.random() * 20) + 10;

    const weight = Math.round(length * (Math.random() * 0.5 + 0.02)); // weight is based on length with some randomness 

    const points=
      fish.rarity === "common" ? Math.floor(Math.random() * 40) + 20 :
      fish.rarity === "uncommon" ? Math.floor(Math.random() * 50) + 30 :
      fish.rarity === "rare" ? Math.floor(Math.random() * 60) + 40 :
      fish.rarity === "legendary" ? Math.floor(Math.random() * 80) + 50 :
      Math.floor(Math.random() * 20) + 10;

  return {
    id: crypto.randomUUID(),
    name: fish.name,
    rarity: fish.rarity as Fishy["rarity"],
    length: length,
    weight: weight,
    points: points,

    x,
    y,
    vx,
    vy,
    behavior: "swimming",
    tapCount: 0,
    tapCooldown: 0,
    requiredTaps: Math.floor(Math.random() * 5) + 3, // random number of taps required to catch the fish
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
                  <Inventory fish={inventory} />
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
              const count = Math.floor(Math.random() * 5) + 6; // random 2-6
              const newFishArray: Fishy[] = []; // create an array to hold new fish
                for (let i = 0; i < count; i++) {
                  const newFishList = createFish();
                  newFishArray.push(newFishList); // add each new fish to the array
                }
                setFishInLake(newFishArray);
                //pick fish to bite
                const randindex= Math.floor(Math.random() * newFishArray.length);
              


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
