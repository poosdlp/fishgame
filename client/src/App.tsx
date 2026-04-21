import { useState, useEffect, useCallback, useRef } from "react";
import { BiteAlert } from './components/bitealert';
import { CaughtFish } from './components/caughtfish';
import { Inventory } from './components/inventory';
import { Leaderboard } from './components/leaderboard';
import { Tutorial } from './components/tutorial';
import { SwingSign } from './components/SwingSign';
import type { GameState } from './types/fish';
import { LakeHeight, LakeWidth } from './data/lakeDim';
import { useFishSimulation } from "./hooks/useFishSim";
import { useFishingSession } from './hooks/useFishingSession';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

import './App.css'

function App() {
  const [state, setState] = useState<GameState>("none");
  const [bobber, setBobber] = useState<{x: number, y: number} | null>(null);

  const [showInventory, setShowInventory] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const isAnySidebarOpen = showInventory || showLeaderboard;
  const { user, logout } = useAuth();
  const { send: wsSend, subscribe, connected } = useSocket();

  const { fishInLake, setFishInLake } = useFishSimulation(bobber, state, setState);

  const {
    inventory,
    lastCaughtFish,
    handleCatch,
    handleFish,
    handleReel,
    handleCaught,
  } = useFishingSession({
    setState,
    setBobber,
    setFishInLake,
  });

  // Periodically broadcast "ready" + current state so other devices know the game client is live
  const stateForReadyRef = useRef(state);
  stateForReadyRef.current = state;
  useEffect(() => {
    if (!connected) return;
    const send = () => wsSend({ type: 'ready', state: stateForReadyRef.current });
    // Send immediately after a short delay, then every 3 seconds
    const initial = setTimeout(send, 100);
    const interval = setInterval(send, 3000);
    return () => { clearTimeout(initial); clearInterval(interval); };
  }, [connected, wsSend]);

  // Broadcast game state changes to other devices
  const prevStateRef = useRef(state);
  useEffect(() => {
    if (state !== prevStateRef.current) {
      prevStateRef.current = state;
      wsSend({ type: 'state', state });
    }
  }, [state, wsSend]);

  // Refs for handlers so the WS listener always calls the latest version
  const handlersRef = useRef({ handleFish, handleReel, handleCatch, handleCaught });
  useEffect(() => {
    handlersRef.current = { handleFish, handleReel, handleCatch, handleCaught };
  });

  // Listen for incoming WebSocket game-action messages from other devices
  useEffect(() => {
    return subscribe((data: unknown) => {
      const msg = data as { action?: string };
      console.log('[WS] received game message:', msg);
      if (!msg?.action) return;
      const h = handlersRef.current;
      console.log('[WS] dispatching action:', msg.action);
      switch (msg.action) {
        case 'fish':   h.handleFish();   break;
        case 'reel':   h.handleReel();   break;
        case 'catch':  h.handleCatch();  break;
        case 'caught': h.handleCaught(); break;
      }
    });
  }, [subscribe]);

  // Wrappers that perform the action locally AND broadcast via WebSocket
  const doFish = useCallback(() => {
    handleFish();
    wsSend({ action: 'fish' });
  }, [handleFish, wsSend]);

  const doReel = useCallback(() => {
    handleReel();
    wsSend({ action: 'reel' });
  }, [handleReel, wsSend]);

  const doCatch = useCallback(() => {
    handleCatch();
    wsSend({ action: 'catch' });
  }, [handleCatch, wsSend]);

  const doCaught = useCallback(() => {
    handleCaught();
    wsSend({ action: 'caught' });
  }, [handleCaught, wsSend]);

  return(
    <div className="app-shell">
      {/* OVERLAY */}
      {isAnySidebarOpen && (
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
        <div
          className="side-tab left-tab"
          onClick={() => setShowInventory(prev => !prev)}
        >
          {showInventory ? "◀" : "▶"}
        </div>

        {showInventory && (
          <>
            <h2>Inventory</h2>
            <Inventory fish={inventory} />
          </>
        )}
      </div>

      {/* RIGHT SIDEBAR */}
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

      {/* TUTORIAL */}
      {showTutorial && <Tutorial onClose={() => setShowTutorial(false)} />}

      {/* MAIN CONTENT */}
      <div className="game-layout">
        <SwingSign />
        
        <div className="game-screen">
          <div className="lake">
            {bobber && (
              <div
                className={`bobber${state === "bite" ? " bobber-bite" : ""}${state === "caught" ? " bobber-catch" : ""}`}
                style={{
                  left: `${(bobber.x / LakeWidth) * 100}%`,
                  top: `${(bobber.y / LakeHeight) * 100}%`,
                }}
              />
            )}
            {fishInLake.map(fish => (
              <img
                key={fish.id}
                className={`fish-sprite${fish.behavior === "hovering" ? " fish-sprite-hover" : ""}${fish.behavior === "bite" ? " fish-sprite-bite" : ""}`}
                src={fish.imagePath}
                alt={fish.name}
                style={{
                  left: `${(fish.x / LakeWidth) * 100}%`,
                  top: `${(fish.y / LakeHeight) * 100}%`,
                }}
              />
            ))}
          </div>
        </div>

        <div className="action-controls">
          {import.meta.env.DEV && state === "none" && (
            <button onClick={doFish}>Fish</button>
          )}

          {import.meta.env.DEV && state === "waiting" && (
            <button onClick={doReel}>Reel</button>
          )}

          {import.meta.env.DEV && state === "bite" && (
            <BiteAlert onCatch={doCatch} />
          )}
        </div>
      </div>

      {/* Fullscreen caught popup */}
      {state === "caught" && (
        <CaughtFish fish={lastCaughtFish} onReset={doCaught} />
      )}

      <div className="bottom-bar">
        <span>Welcome, {user?.username || user?.email}!</span>
        <div className="bottom-bar-actions">
          <button onClick={() => setShowTutorial(true)}>?</button>
          <button onClick={logout}>Logout</button>
        </div>
      </div>
    </div>
  );
}

export default App
