import type { Fishy } from "../types/fish";
import {LakeHeight,LakeWidth} from '../data/lakeDim'

export const createFish = (): Fishy => {
    const side=Math.floor(Math.random() * 4);

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
  return {
    id: crypto.randomUUID(),

    x,
    y,
    vx,
    vy,
    behavior: "swimming",
    tapCount: 0,
    tapCooldown: 0,
    requiredTaps: Math.floor(Math.random() * 5) + 3, // random number of taps required to catch the fish
    tapflag:0,
    hX:0,
    hY:0,
  };
};