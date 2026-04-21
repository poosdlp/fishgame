import { useEffect, useRef, useState } from "react";
import { LakeWidth, LakeHeight } from "../data/lakeDim";
import type { GameState } from "../types/fish";

// Anonymous fish for in-lake movement — no identity known until caught
export type LakeFish = {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  behavior: "swimming" | "attracted" | "hovering" | "bite";
  tapCount: number;
  requiredTaps: number;
};

// Clamps fish position to lake bounds
function applyBoundaries(x: number, y: number, vx: number, vy: number) {
  let cx = x, cy = y, cvx = vx, cvy = vy;
  if (cx < 0          && cvx < 0) { cx = 0;          cvx = 0; }
  if (cx > LakeWidth  && cvx > 0) { cx = LakeWidth;  cvx = 0; }
  if (cy < 0          && cvy < 0) { cy = 0;          cvy = 0; }
  if (cy > LakeHeight && cvy > 0) { cy = LakeHeight; cvy = 0; }
  return { x: cx, y: cy, vx: cvx, vy: cvy };
}

export function useFishSimulation(bobber: { x: number; y: number } | null, state: GameState, setState: (state: GameState) => void) {
  const [fishInLake, setFishInLake] = useState<LakeFish[]>([]);
  const bobberRef = useRef<{ x: number; y: number } | null>(null);
  const stateRef = useRef(state);
  const targetFishIdRef = useRef<string | null>(null);
  const hoverGatherTimeRef = useRef(0);

  useEffect(() => {
    bobberRef.current = bobber;
  }, [bobber]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    // Reset bite-selection state when a cast ends or bobber is removed.
    if (!bobber || state === "none") {
      targetFishIdRef.current = null;
      hoverGatherTimeRef.current = 0;
    }
  }, [bobber, state]);

  useEffect(() => {
    let animationId: number;
    let time = 0;

    const update = () => {
      time += 1;

      setFishInLake(prev => {
        // If the selected fish no longer exists (new cast/reset), allow a new selection.
        if (targetFishIdRef.current && !prev.some(f => f.id === targetFishIdRef.current)) {
          targetFishIdRef.current = null;
          hoverGatherTimeRef.current = 0;
        }

        // Hover gather timer: wait until 2+ fish are orbiting before selecting a target.
        if (!targetFishIdRef.current) {
          const candidates = prev.filter(f => f.behavior === "hovering");

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
          const bobber = bobberRef.current;
          const attractionRadius = 110;
          const hoverRadius = 65;
          const maxspeed = 1.0;
          const minSpeed = 0.12;

          let { vx, vy, behavior, tapCount } = fish;
          let newVx = vx;
          let newVy = vy;
          let newBehavior = behavior;

          let dx = 0;
          let dy = 0;
          let dist = 0;

          if (bobber) {
            dx = bobber.x - fish.x;
            dy = bobber.y - fish.y;
            dist = Math.sqrt(dx * dx + dy * dy);
          }
          if (!isFinite(dist) || dist < 1) dist = 1;

          // Bite state transition — rush toward bobber over several frames
          if (newBehavior === "bite" && bobber) {
            if (stateRef.current === "waiting") {
              setState("bite");
            }
            if (stateRef.current === "caught" || stateRef.current === "none") {
              return fish;
            }
            const rushSpeed = 0.18;
            const newX = fish.x + (bobber.x - fish.x) * rushSpeed;
            const newY = fish.y + (bobber.y - fish.y) * rushSpeed;
            return {
              ...fish,
              behavior: "bite",
              x: newX,
              y: newY,
              vx: 0,
              vy: 0,
            };
          }

          // When a bite is active, scatter hovering/attracted fish away from the bobber
          const biteActive = stateRef.current === "bite" || prev.some(f => f.behavior === "bite");
          if (biteActive && (newBehavior === "hovering" || newBehavior === "attracted")) {
            newBehavior = "swimming";
            const fleeAngle = Math.atan2(fish.y - (bobber?.y ?? fish.y), fish.x - (bobber?.x ?? fish.x));
            newVx = Math.cos(fleeAngle) * 1.5;
            newVy = Math.sin(fleeAngle) * 1.5;
            const fb = applyBoundaries(fish.x + newVx, fish.y + newVy, newVx, newVy);
            return { ...fish, behavior: newBehavior, ...fb, tapCount: 0 };
          }

          // Hovering behavior with orbital movement
          if (newBehavior === "hovering" && bobber) {
            // Derive a stable phase from the fish id; works with both UUIDs and fallback IDs
            let hash = 0;
            for (let i = 0; i < fish.id.length; i++) {
              hash = ((hash << 5) - hash + fish.id.charCodeAt(i)) | 0;
            }
            const phaseOffset = ((hash & 0x7fffffff) % 1000) / 1000 * Math.PI * 2;
            const angle = time * 0.008 + phaseOffset;
            const newtapCount = tapCount + 1;

            if (targetFishIdRef.current === fish.id) {
              if (newtapCount >= fish.requiredTaps) {
                // 50/50 chance: fish either commits to biting or chickens out
                if (Math.random() < 0.5) {
                  newBehavior = "hovering";
                  targetFishIdRef.current = null;
                  hoverGatherTimeRef.current = 0;
                } else {
                  newBehavior = "bite";
                }
              } else {
                // Target fish springs toward the bobber center
                newVx = dx * 0.05;
                newVy = dy * 0.05;
              }
            } else {
              // Non-target fish orbit the bobber
              const targetX = bobber.x + Math.cos(angle) * hoverRadius;
              const targetY = bobber.y + Math.sin(angle) * hoverRadius;
              newVx = (targetX - fish.x) * 0.05;
              newVy = (targetY - fish.y) * 0.05;
            }

            const hb = applyBoundaries(fish.x + newVx, fish.y + newVy, newVx, newVy);
            return { ...fish, behavior: newBehavior, ...hb, tapCount: newtapCount };
          }

          // Attracted behavior: moving toward bobber
          if (newBehavior === "attracted") {
            if (bobber && dist < hoverRadius && !biteActive) {
              newBehavior = "hovering";
            }

            const closeBoost = dist < 60 ? 1.4 : 1;
            const speed = Math.max(
              minSpeed,
              Math.min(dist / attractionRadius, 1) * maxspeed
            );

            const targetVx = (dx / dist) * speed;
            const targetVy = (dy / dist) * speed;

            const turnSpeed = 0.1;
            const accel = 0.018;

            newVx += (targetVx - newVx) * turnSpeed;
            newVy += (targetVy - newVy) * turnSpeed;
            newVx += (dx / dist) * accel * closeBoost;
            newVy += (dy / dist) * accel * closeBoost;

            const seed = Number(fish.id.slice(0, 8)) || 0;
            const wobbleStrength = 0.5;
            const wobbleSpeed = 0.1;
            const wobbleFactor = Math.max(dist / attractionRadius, 0.1);

            const wobbleX = Math.sin(time * wobbleSpeed + seed) * wobbleStrength * wobbleFactor;
            const wobbleY = Math.cos(time * wobbleSpeed + seed) * wobbleStrength * wobbleFactor;

            const ab = applyBoundaries(fish.x + newVx + wobbleX, fish.y + newVy + wobbleY, newVx, newVy);
            return { ...fish, behavior: newBehavior, ...ab };
          }

          // Swimming behavior: free-form movement
          if (newBehavior === "swimming") {
            if (bobber && dist < attractionRadius) {
              const speed = Math.min(dist / attractionRadius, 1) * maxspeed;
              const targetVx = (dx / dist) * speed;
              const targetVy = (dy / dist) * speed;
              const turnSpeed = 0.12;
              const accelBoost = 0.02;
              newVx += (targetVx - newVx) * turnSpeed;
              newVy += (targetVy - newVy) * turnSpeed;
              newVx += (dx / dist) * accelBoost;
              newVy += (dy / dist) * accelBoost;
              newBehavior = "attracted";
            }

            const speed = Math.sqrt(newVx * newVx + newVy * newVy);
            const maxSpeed = 1.1;
            if (speed > maxSpeed) {
              newVx = (newVx / speed) * maxSpeed;
              newVy = (newVy / speed) * maxSpeed;
            }

            const wobbleX = Math.sin(time + fish.y * 0.05) * 0.2;
            const wobbleY = Math.cos(time + fish.x * 0.06) * 0.2;

            if (Math.random() < 0.01) {
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
  }, []);

  return { fishInLake, setFishInLake };




}