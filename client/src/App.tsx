import { use, useRef, useState } from "react";
import { useEffect } from "react";
import { BiteAlert } from './components/bitealert';
import { CaughtFish } from './components/caughtfish';
import { Inventory } from './components/inventory';
import { Leaderboard } from './components/leaderboard';
import { fishTypes } from './data/fishTypes';
import type { FishTemplate } from './data/fishTypes';

import './App.css'

const LakeWidth = 1200;
const LakeHeight = 700;

// Clamps fish position to lake bounds, but only zeroes velocity when moving outward.
// This prevents fish from pinballing off walls while still allowing them to swim in from outside.
function applyBoundaries(x: number, y: number, vx: number, vy: number) {
  let cx = x, cy = y, cvx = vx, cvy = vy;
  if (cx < 0          && cvx < 0) { cx = 0;          cvx = 0; }
  if (cx > LakeWidth  && cvx > 0) { cx = LakeWidth;  cvx = 0; }
  if (cy < 0          && cvy < 0) { cy = 0;          cvy = 0; }
  if (cy > LakeHeight && cvy > 0) { cy = LakeHeight; cvy = 0; }
  return { x: cx, y: cy, vx: cvx, vy: cvy };
}

let tempfish;

// Game states:
// none    — idle, no fishing in progress
// waiting — bobber is cast, fish are swimming
// bite    — a fish has committed to biting, waiting for player to react
// caught  — player successfully caught a fish, showing result screen
type GameState = "bite" | "caught" | "waiting"| "none";


type inventorytab = "fish" | "journals";


// Fish behavior state machine:
// swimming  → attracted (enters bobber radius)
// attracted → hovering  (reaches hover radius)
// hovering  → bite      (selected fish reaches requiredTaps, passes 50/50 check)
// hovering  → hovering  (selected fish fails 50/50 check, resets target)
// bite      → caught    (player clicks Catch Fish!)
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
  requiredTaps: number; // frames the selected fish must hover before attempting to bite

};

function loadimages() {



  tempfish = new Image();
  tempfish.src = "/tempfish.png";
}


const API = "http://localhost:5555";

// Retrieves or prompts for the player name, persisted in localStorage
function getPlayerName(): string {
  let name = localStorage.getItem("playerName");
  if (!name) {
    name = prompt("Enter your player name:") || "Angler";
    localStorage.setItem("playerName", name);
  }
  return name;
}

function App() {
  const [state, setState] = useState<GameState>("none");
  const [bobber, setBobber] = useState<{x: number, y: number} | null>(null);

  const [showInventory, setShowInventory] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const isAnySidebarOpen = showInventory || showLeaderboard;
  const [inventory, setInventory] = useState<Fishy[]>([]);
  const [fishInLake, setFishInLake] = useState<Fishy[]>([]);
  const [lastCaughtFish, setLastCaughtFish] = useState<Fishy | null>(null);
  const bitingFishRef = useRef<Fishy | null>(null);
  // stateRef mirrors `state` for use inside the animation loop (avoids stale closure)
  const stateRef = useRef(state);
  // targetFishIdRef holds the id of the fish currently selected to attempt a bite.
  // null means no fish is targeted yet.
  const targetFishIdRef = useRef<string | null>(null);
  // counts frames where 2+ fish are hovering; resets if the count drops below 2
  const hoverGatherTimeRef = useRef(0);
  useEffect(() => { stateRef.current = state; }, [state]);

  // Load inventory from server on mount
  useEffect(() => {
    const playerName = getPlayerName();
    fetch(`${API}/inventory/${encodeURIComponent(playerName)}`)
      .then(r => r.json())
      .then((data: Array<{id: string; name: string; rarity: Fishy["rarity"]; points: number; weight: number | null; length: number}>) => {
        const loaded: Fishy[] = data.map(f => ({
          id: f.id,
          name: f.name,
          rarity: f.rarity,
          points: f.points,
          weight: f.weight === null ? "how rude to ask" : f.weight,
          length: f.length,
          x: 0, y: 0, vx: 0, vy: 0,
          behavior: "caught",
          tapCount: 0, tapCooldown: 0, requiredTaps: 0,
        }));
        setInventory(loaded);
      })
      .catch(err => console.error("Failed to load inventory:", err));
  }, []);


// bobberRef mirrors `bobber` state for use inside the animation loop (avoids stale closure)
const bobberRef = useRef<{ x: number; y: number } | null>(null);


 useEffect(() => {
   bobberRef.current = bobber;
    let animationId: number;
    let time = 0;

    const update = () => {
      time += 1;


      setFishInLake(prev => {
        // Hover gather timer: wait until 2+ fish are orbiting before selecting a target.
        // This ensures a visible group forms before a bite is possible.
        if (!targetFishIdRef.current) {
          const candidates = prev.filter(f => f.behavior === "hovering");

          // Only tick the timer once 2+ fish are hovering together
          if (candidates.length >= 2) {
            hoverGatherTimeRef.current += 1;
          } else {
            hoverGatherTimeRef.current = 0;
          }

          // After 180 frames (~3s at 60fps), randomly pick one hovering fish as the target
          if (hoverGatherTimeRef.current >= 180) {
            targetFishIdRef.current = candidates[Math.floor(Math.random() * candidates.length)].id;
            hoverGatherTimeRef.current = 0;
          }
        }

        return prev.map(fish => {
          //console.log("fish count:", prev.length);
          const bobber = bobberRef.current;
          // console.log("bobber in update:", bobber);
          // console.log("bobber location", bobber ? `(${bobber.x.toFixed(2)}, ${bobber.y.toFixed(2)})` : "null");
          // console.log("fish location", `(${fish.x.toFixed(2)}, ${fish.y.toFixed(2)})`);
          // console.log("fish dist:", bobber ? Math.sqrt((bobber.x - fish.x) ** 2 + (bobber.y - fish.y) ** 2).toFixed(2) : "N/A");

          const attractionRadius = 150;
          const hoverRadius = 80;
          const maxspeed = 1.3;
          const minSpeed = 0.2;

          let { vx, vy, behavior, tapCount } = fish;

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

          // Caught fish are frozen in place — no further movement
          if (newBehavior === "caught") {
            return fish;
          }

          if (newBehavior === "bite" && bobber) {
            // Trigger the game's bite state so the player can react
            if (stateRef.current === "waiting") {
              setState("bite");
            }
            // Guard: if the game already moved past bite (caught or reset), freeze the fish
            // without this, the animation loop could re-trigger "bite" and overwrite "caught"
            if (stateRef.current === "caught" || stateRef.current === "none") {
              return fish;
            }
            return {
              ...fish,
              behavior: "bite" as FishBehavior,
              x: bobber.x,
              y: bobber.y,
              vx: 0,
              vy: 0,
            };
          }


        if(newBehavior === "hovering" && bobber) {

          // Spread fish evenly around the orbit using their UUID as a phase offset.
          // Each fish gets a unique angle so they don't all stack on the same point.
          const phaseOffset = (parseInt(fish.id.replace(/-/g, "").slice(0, 6), 16) % 1000) / 1000 * Math.PI * 2;
          const angle = time * 0.008 + phaseOffset;
          const newtapCount = tapCount + 1;

          if (targetFishIdRef.current === tempID) {
            if (newtapCount >= fish.requiredTaps) {
              // 50/50 chance: fish either commits to biting or chickens out back to hovering.
              // On failure, target resets so the gather timer has to run again.
              if (Math.random() < 0.5) {
                newBehavior = "hovering";
                targetFishIdRef.current = null;
                hoverGatherTimeRef.current = 0;
              } else {
                newBehavior = "bite";
                bitingFishRef.current = { ...fish, tapCount: newtapCount, behavior: "bite" as FishBehavior };
              }
            } else {
              // Target fish springs toward the bobber center
              newVx = dx * 0.08;
              newVy = dy * 0.08;
            }
          } else {
            // Non-target fish orbit the bobber at hoverRadius
            const targetX = bobber.x + Math.cos(angle) * hoverRadius;
            const targetY = bobber.y + Math.sin(angle) * hoverRadius;
            newVx = (targetX - fish.x) * 0.08;
            newVy = (targetY - fish.y) * 0.08;
          }

          const hb = applyBoundaries(fish.x + newVx, fish.y + newVy, newVx, newVy);
          return { ...fish, behavior: newBehavior, ...hb, tapCount: newtapCount };



         }


        if (newBehavior === "attracted") {
                   // console.log("attracted logic running");


          if (bobber && dist < hoverRadius) {
            newBehavior = "hovering";
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

          const ab = applyBoundaries(fish.x + newVx + wobbleX, fish.y + newVy + wobbleY, newVx, newVy);
          return { ...fish, behavior: newBehavior, ...ab };

        }

        if(newBehavior === "swimming") {

          if (bobber && dist < attractionRadius) {
            const speed = Math.min(dist / attractionRadius, 1) * maxspeed;
            const targetVx = (dx / dist) * speed;
            const targetVy = (dy / dist) * speed;
            const turnSpeed = 0.2;
            const accelBoost = 0.05;
            newVx += (targetVx - newVx) * turnSpeed;
            newVy += (targetVy - newVy) * turnSpeed;
            newVx += (dx / dist) * accelBoost;
            newVy += (dy / dist) * accelBoost;
            newBehavior = "attracted";
          }

          const speed = Math.sqrt(newVx * newVx + newVy * newVy);
          const maxSpeed = 1.5;
          if (speed > maxSpeed) {
            newVx = (newVx / speed) * maxSpeed;
            newVy = (newVy / speed) * maxSpeed;
          }

          const wobbleX = Math.sin(time + fish.y * 0.05) * 0.2;
          const wobbleY = Math.cos(time + fish.x * 0.06) * 0.2;

          if (Math.random() < 0.02) {
            const angle = Math.random() * (Math.PI / 4);
            const direction = Math.random() < 0.5 ? -1 : 1;
            const theta = angle * direction;
            const rotatedVx = newVx * Math.cos(theta) - newVy * Math.sin(theta);
            const rotatedVy = newVx * Math.sin(theta) + newVy * Math.cos(theta);
            newVx = rotatedVx;
            newVy = rotatedVy;
          }

          const sb = applyBoundaries(fish.x + newVx + wobbleX, fish.y + newVy + wobbleY, newVx, newVy);
          return { ...fish, behavior: newBehavior, ...sb };

        }



            return fish;


        });
      });



      animationId = requestAnimationFrame(update);
    };

    animationId = requestAnimationFrame(update);

    return () => cancelAnimationFrame(animationId);
  }, [bobber]);




  const createFish = (): Fishy => {
    const roll = Math.random();
    const side=Math.floor(Math.random() * 4);

    let fish;

// Spawn outside the lake edges so each fish swims in naturally
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

    // Initial velocity aimed loosely toward center so fish swim into the lake
    const vx = (centerX - x) * 0.001;
    const vy = (centerY - y) * 0.001;


    // Rarity roll — probabilities: common 60%, uncommon 15%, rare 12%, legendary 3%, mythical 9%, the one that got away 1%
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

    // "The one that got away" fish use fixed stats defined in fishTypes.ts
    if (fish.rarity === "the one that got away") {
      return {
        id: crypto.randomUUID(),
        name: fish.name,
        rarity: fish.rarity,
        length: fish.length,
        weight: fish.weight ,
        points: fish.points ,

        x,y,
        vx,
        vy,
        behavior: "swimming",
        tapCount: 0,
        tapCooldown: 0,
        requiredTaps: Math.floor(Math.random() * 180) + 180, // hover frames before biting (3–6s at 60fps)

      };
    }

    // Length ranges scale up with rarity
    const length=
      fish.rarity === "common" ? Math.floor(Math.random() * 40) + 20 :
      fish.rarity === "uncommon" ? Math.floor(Math.random() * 50) + 30 :
      fish.rarity === "rare" ? Math.floor(Math.random() * 60) + 40 :
      fish.rarity === "legendary" ? Math.floor(Math.random() * 80) + 50 :
      Math.floor(Math.random() * 20) + 10;

    const weight = Math.round(length * (Math.random() * 0.5 + 0.02)); // weight is based on length with some randomness

    // Points scale with rarity; mythical gives the highest range (150–349)
    const points=
      fish.rarity === "common" ? Math.floor(Math.random() * 40) + 20 :
      fish.rarity === "uncommon" ? Math.floor(Math.random() * 50) + 30 :
      fish.rarity === "rare" ? Math.floor(Math.random() * 60) + 40 :
      fish.rarity === "legendary" ? Math.floor(Math.random() * 80) + 50 :
      Math.floor(Math.random() * 200) + 150;

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
    requiredTaps: Math.floor(Math.random() * 180) + 180, // hover frames before biting (3–6s at 60fps)
  };
};

  const catchFish = (fish: Fishy) => {
    setInventory(prev => [...prev, fish]);
    setLastCaughtFish(fish);
    setFishInLake(prev => prev.map(f => f.id === fish.id ? { ...f, behavior: "caught" as FishBehavior } : f));
    // Clear all bite-related refs so the next fishing session starts fresh
    targetFishIdRef.current = null;
    bitingFishRef.current = null;
    hoverGatherTimeRef.current = 0;
    setState("caught");

    const playerName = getPlayerName();
    const body = {
      playerName,
      id: fish.id,
      name: fish.name,
      rarity: fish.rarity,
      points: fish.points,
      weight: typeof fish.weight === "number" ? fish.weight : null,
      length: fish.length,
    };

    // Persist catch to player inventory on server
    fetch(`${API}/inventory`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(err => console.error("Failed to save catch to inventory:", err));

    // Submit to global leaderboard
    fetch(`${API}/leaderboard`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, fishName: fish.name }),
    }).catch(err => console.error("Failed to submit to leaderboard:", err));
  }



    return(
     <div>

      {/* OVERLAY — dims the lake when a sidebar is open; clicking it closes both sidebars */}
      {(isAnySidebarOpen) && (
        <div
          className="overlay"
          onClick={() => {
            setShowInventory(false);
            setShowLeaderboard(false);
          }}
        />
      )}


        {/* LEFT SIDEBAR — player inventory */}
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

        {/* RIGHT SIDEBAR — global leaderboard */}
        <div className={`sidebar right ${showLeaderboard ? "open" : "collapsed"}`}>
          <div
            className="side-tab right-tab"
            onClick={() => setShowLeaderboard(prev => !prev)}
          >
            {showLeaderboard ? "▶" : "◀"}
          </div>

          {showLeaderboard && (
            <>
              <h2>Leaderboard</h2>
              <Leaderboard />
            </>
          )}
        </div>


        {/* MAIN CONTENT */}
        <div style={{textAlign: "center", marginTop: "50px"}}>
          <h1>Phising</h1>
          <div className="game-screen">
            <div className="lake">
              {bobber && (
                <div
                  className={state === "bite" ? "bobber bobber-bite" : "bobber"}
                  style={{ left: bobber.x - 10, top: bobber.y - 10 }}
                />
              )}
              {fishInLake.map(fish => (
                <div
                  key={fish.id}
                  // hovering fish get the bob animation to visually distinguish them
                  className={fish.behavior === "hovering" ? "fish-dot fish-dot-hover" : "fish-dot"}
                  style={{ left: fish.x, top: fish.y }}
                />
              ))}
            </div>
          </div>


          {/* Fish button — casts the bobber and spawns 21–30 fish */}
          {state === "none" && (
            <button onClick={() => {
              // Reset all refs before starting a new session
              targetFishIdRef.current = null;
              bitingFishRef.current = null;
              hoverGatherTimeRef.current = 0;
              setState("waiting");
              const count = Math.floor(Math.random() * 10) + 21;
              const newFishArray: Fishy[] = [];
              for (let i = 0; i < count; i++) {
                newFishArray.push(createFish());
              }
              setFishInLake(newFishArray);
              // Bobber spawns with a margin so fish don't immediately hover on it
              const spawnMargin = 200;
              setBobber({
                x: Math.random() * (LakeWidth - spawnMargin * 2) + spawnMargin,
                y: Math.random() * (LakeHeight - spawnMargin * 2) + spawnMargin,
              });
            }}>Fish</button>
          )}

          {/* Reel button — cancels the current cast and resets everything */}
          {state === "waiting" && (
            <button onClick={() => {
              setBobber(null);
              setFishInLake([]);
              targetFishIdRef.current = null;
              bitingFishRef.current = null;
              hoverGatherTimeRef.current = 0;
              setState("none");
            }}>Reel</button>
          )}

          {/* Bite alert — shown when a fish commits to biting; player must click to catch */}
          {state === "bite" && (
            <BiteAlert onCatch={() => {
              if (bitingFishRef.current) {
                catchFish(bitingFishRef.current);
                bitingFishRef.current = null;
              }
            }} />
          )}

          {/* Caught screen — shows the caught fish's stats; Done resets to idle */}
          {state === "caught" && (
            <CaughtFish fish={lastCaughtFish} onReset={() => {
              setFishInLake([]);
              setBobber(null);
              targetFishIdRef.current = null;
              bitingFishRef.current = null;
              hoverGatherTimeRef.current = 0;
              setState("none");
            }} />
          )}


      </div>
    </div>
    );
}

export default App
