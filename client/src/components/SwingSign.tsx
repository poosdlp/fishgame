import { useRef, useEffect, useCallback } from 'react';

// Physics constants — tweak these to change how the sign feels
const GRAVITY   = 0.003;  // restoring force pulling back to center (higher = snappier return)
const DAMPING   = 0.97;   // energy kept per frame (lower = stops faster, higher = swings longer)
const MOUSE_DRAG = 0.0003; // how much horizontal mouse movement spins the sign
const CLICK_KICK = 0.05;   // angular velocity added on click

export function SwingSign() {
  const signRef   = useRef<HTMLDivElement>(null);
  const angleRef  = useRef(0);       // current rotation in radians
  const velRef    = useRef(0);       // current angular velocity
  const lastXRef  = useRef<number | null>(null);
  const rafRef    = useRef<number>(0);

  // Pendulum physics loop — runs every frame regardless of user input
  useEffect(() => {
    const tick = () => {
      velRef.current  += -GRAVITY * angleRef.current; // gravity pulls toward 0
      velRef.current  *= DAMPING;                      // friction bleeds off energy
      angleRef.current += velRef.current;

      if (signRef.current) {
        signRef.current.style.transform = `rotate(${angleRef.current}rad)`;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Dragging the cursor across the sign spins it proportionally to mouse speed
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (lastXRef.current !== null) {
      const dx = e.clientX - lastXRef.current;
      velRef.current += dx * MOUSE_DRAG;
    }
    lastXRef.current = e.clientX;
  }, []);

  const handleMouseLeave = useCallback(() => {
    lastXRef.current = null;
  }, []);

  // Clicking kicks the sign toward whichever side was clicked
  const handleClick = useCallback((e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const side = e.clientX < rect.left + rect.width / 2 ? -1 : 1;
    velRef.current += side * CLICK_KICK;
  }, []);

  return (
    // Outer div holds the layout space; the sign rotates inside it from the top-center pivot
    <div style={{ display: 'inline-block', height: 160, lineHeight: 0, marginBottom: 60 }}>
      <div
        ref={signRef}
        style={{ transformOrigin: 'top center', display: 'inline-block', cursor: 'pointer' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {/* Replace this with <img src="/sign.png" ... /> once the sprite is ready */}
        <img src="/sign.png" width={300} height={160} alt="Phising" draggable={false} style={{ imageRendering: "pixelated" }} />
      </div>
    </div>
  );
}
