import { useEffect, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { catchFish as catchFishApi, getInventory } from '../api';
import type { GameState, InventoryFish } from '../types/fish';
import { LakeHeight, LakeWidth } from '../data/lakeDim';
import { createFish } from '../utils/fishCreate';
import type { LakeFish } from './useFishSim';

type Bobber = { x: number; y: number } | null;

type Options = {
  setState: (state: GameState) => void;
  setBobber: Dispatch<SetStateAction<Bobber>>;
  setFishInLake: Dispatch<SetStateAction<LakeFish[]>>;
};

export function useFishingSession({ setState, setBobber, setFishInLake }: Options) {
  const [inventory, setInventory] = useState<InventoryFish[]>([]);
  const [lastCaughtFish, setLastCaughtFish] = useState<InventoryFish | null>(null);

  useEffect(() => {
    getInventory()
      .then(setInventory)
      .catch(err => console.error('Failed to load inventory:', err));
  }, []);

  const handleCatch = async () => {
    try {
      const fish = await catchFishApi();
      setLastCaughtFish(fish);
      setInventory(prev => [fish, ...prev]);
      setFishInLake([]);
      // Keep bobber alive briefly for catch animation; handleCaught clears it
      setState('caught');
    } catch (err) {
      console.error('Failed to catch fish:', err);
    }
  };

  const handleFish = () => {
    console.log('[handleFish] called, setting state to waiting');
    setState('waiting');
    const count = Math.floor(Math.random() * 5) + 8;
    const newFishArray: LakeFish[] = [];

    for (let index = 0; index < count; index += 1) {
      newFishArray.push(createFish());
    }

    console.log('[handleFish] spawning', newFishArray.length, 'fish');
    setFishInLake(newFishArray);
    const spawnMargin = 200;
    const bobberPos = {
      x: Math.random() * (LakeWidth - spawnMargin * 2) + spawnMargin,
      y: Math.random() * (LakeHeight - spawnMargin * 2) + spawnMargin,
    };
    console.log('[handleFish] placing bobber at', bobberPos);
    setBobber(bobberPos);
  };

  const handleReel = () => {
    setBobber(null);
    setFishInLake([]);
    setState('none');
  };

  const handleCaught = () => {
    setFishInLake([]);
    setBobber(null);
    setState('none');
  };

  return {
    inventory,
    lastCaughtFish,
    handleCatch,
    handleFish,
    handleReel,
    handleCaught,
  };
}